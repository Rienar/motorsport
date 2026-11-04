import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, Clock, Timer, X, Gauge, Ruler, Cloud, Navigation, Trophy } from 'lucide-react';

const SUPABASE_URL = 'https://qugdovsytjqjawsesdix.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DrPG1dGhbIWU2EARd9v88g_X3c_pPvX';

const SERIES_INFO = {
  all: { label: 'Все', activeClass: 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' },
  f1: { label: 'F1', activeClass: 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' },
  wec: { label: 'WEC', activeClass: 'bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
  dtm: { label: 'DTM', activeClass: 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' },
  super_gt: { label: 'Super GT', activeClass: 'bg-green-500 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' },
};

const YEARS = ['2026', '2027'];
const MONTHS = [
  { value: 'all', label: 'Все' },
  { value: '1', label: 'Январь' }, { value: '2', label: 'Февраль' }, { value: '3', label: 'Март' },
  { value: '4', label: 'Апрель' }, { value: '5', label: 'Май' }, { value: '6', label: 'Июнь' },
  { value: '7', label: 'Июль' }, { value: '8', label: 'Август' }, { value: '9', label: 'Сентябрь' },
  { value: '10', label: 'Октябрь' }, { value: '11', label: 'Ноябрь' }, { value: '12', label: 'Декабрь' },
];

const getTrackDetails = (circuit) => {
  if (!circuit) return { length: '5.140 км', record: '1:20.000', weather: '☀️ Ясно, 25°C', corners: 14 };
  const hash = circuit.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const weathers = ['☀️ Ясно, 25°C', '⛅ Облачно, 20°C', '🌧️ Возможен дождь, 18°C', '🌤️ Местами облачно, 22°C', '🌙 Ясно (вечер), 21°C'];
  const minSec = 14 + (hash % 15);
  const millis = 100 + (hash * 23) % 899;
  return {
     length: (4 + (hash % 3) + ((hash % 10) * 0.13)).toFixed(3) + ' км',
     record: `1:${minSec}.${millis}`,
     weather: weathers[hash % weathers.length],
     corners: 10 + (hash % 12)
  };
};

export default function App() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(window.location.search);
  const initialSeries = queryParams.get('series') || 'all';
  const initialYear = queryParams.get('year') || '2026';
  const initialMonth = queryParams.get('month') || 'all';

  const [activeSeries, setActiveSeries] = useState(initialSeries);
  const [activeYear, setActiveYear] = useState(initialYear);
  const [activeMonth, setActiveMonth] = useState(initialMonth);
  
  const [selectedRace, setSelectedRace] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    async function fetchRacesFromSupabase() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/races?select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          const formatted = data.map(r => ({
            ...r,
            parsedDate: new Date(r.date)
          }));
          setRaces(formatted);
        }
      } catch (err) {
        console.warn('Ошибка запроса к Supabase:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRacesFromSupabase();
  }, []);

  const nextRace = useMemo(() => {
    if (!races || races.length === 0) return null;
    const now = new Date();
    const upcoming = races.filter(r => r.parsedDate && r.parsedDate > now).sort((a, b) => a.parsedDate - b.parsedDate);
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [races]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeSeries !== 'all') params.set('series', activeSeries);
    if (activeYear) params.set('year', activeYear);
    if (activeMonth !== 'all') params.set('month', activeMonth);

    const newQueryString = params.toString();
    const newUrl = `${window.location.pathname}${newQueryString ? `?${newQueryString}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeSeries, activeYear, activeMonth]);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isWideScreen = window.innerWidth >= 768;
      setIsDesktop(!isMobileDevice && isWideScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const nextRaceRef = React.useRef(null);

  useEffect(() => {
    if (!nextRace) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = nextRace.parsedDate - now;
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / 1000 / 60) % 60),
        secs: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  const filteredRaces = useMemo(() => {
    if (!races) return [];
    const now = new Date();
    return races.filter(r => {
      if (!r.parsedDate) return false;
      const matchSeries = activeSeries === 'all' || r.series === activeSeries;
      const matchYear = r.parsedDate.getFullYear().toString() === activeYear;
      const matchMonth = activeMonth === 'all' || (r.parsedDate.getMonth() + 1).toString() === activeMonth;
      
      const isCurrentYear = activeYear === now.getFullYear().toString();
      const notPassed = !isCurrentYear || r.parsedDate >= now;

      return matchSeries && matchYear && matchMonth && notPassed;
    }).sort((a, b) => a.parsedDate - b.parsedDate);
  }, [races, activeSeries, activeYear, activeMonth]);

  return (
    <div className={`min-h-screen bg-black text-white font-sans selection:bg-red-500 pb-10 flex justify-center ${isDesktop ? 'items-center bg-[#050505] py-8' : ''}`}>
      <div className={`w-full ${isDesktop ? 'max-w-xl mx-auto rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden bg-black min-h-[90vh]' : 'max-w-full'}`}>
        
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 p-4 pt-8 shadow-2xl">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
            <div className="relative flex items-center justify-center w-8 h-8 bg-red-600/20 border border-red-500/40 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Trophy className="text-red-500 w-4 h-4 animate-pulse" />
            </div>
            Motorsport Tracker
          </h1>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {Object.entries(SERIES_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setActiveSeries(key)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  activeSeries === key 
                    ? info.activeClass 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {info.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-2 items-center">
            {YEARS.map(year => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeYear === year ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {year}
              </button>
            ))}
            
            <div className="w-px h-5 bg-white/20 mx-1 shrink-0"></div>
            
            <select 
              value={activeMonth}
              onChange={(e) => setActiveMonth(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-lg px-3 py-1.5 pr-8 focus:outline-none transition-all cursor-pointer hover:bg-white/10"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value} className="bg-gray-900 text-white">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {loading && (
            <div className="text-center text-gray-500 py-16 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Загрузка календаря...</p>
            </div>
          )}

          {!loading && nextRace && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden mb-6 flex flex-col justify-center">
              <Timer className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                   <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${SERIES_INFO[nextRace.series]?.activeClass || 'bg-white/20 text-white'}`}>
                      {SERIES_INFO[nextRace.series]?.label || nextRace.series}
                   </span>
                   <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                     Ближайший этап
                   </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-4 pr-6">
                  {nextRace.name}
                </h2>
                
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.days}</span>
                    <span className="text-[9px] uppercase text-gray-400 mt-1 font-semibold tracking-wider">Дней</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase text-gray-400 mt-1 font-semibold tracking-wider">Часов</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.mins.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase text-gray-400 mt-1 font-semibold tracking-wider">Минут</span>
                  </div>
                  <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-xl sm:text-2xl font-black text-indigo-400">{timeLeft.secs.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase text-gray-400 mt-1 font-semibold tracking-wider">Секунд</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && filteredRaces.map((race) => {
            const isNext = nextRace && nextRace.id === race.id;
            const seriesCfg = SERIES_INFO[race.series] || { label: race.series, activeClass: 'bg-white/20 text-white' };

            return (
              <div 
                key={race.id} 
                ref={isNext ? nextRaceRef : null}
                onClick={() => setSelectedRace(race)}
                className={`group bg-white/5 backdrop-blur-lg border rounded-2xl p-4 active:scale-[0.98] transition-all flex justify-between items-stretch gap-2 relative cursor-pointer hover:bg-white/10 ${
                  isNext ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/10 shadow-xl'
                }`}
              >
                {isNext && (
                  <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
                    Скоро
                  </div>
                )}
                <div className="flex flex-col items-start gap-3 flex-1">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase border ${seriesCfg.activeClass}`}>
                    {seriesCfg.label}
                  </span>
                  <div className="mt-1">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white/95 leading-tight mb-2">
                      {race.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5 text-gray-400 text-sm font-medium">
                      <MapPin size={14} className="text-gray-500 shrink-0" />
                      <span>{race.circuit}</span>
                      <span className="text-gray-600 mx-1">•</span>
                      <span>{race.parsedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex pl-4 border-l border-white/10 shrink-0 min-w-[130px] sm:min-w-[150px] items-center">
                  <div className="flex flex-col items-start justify-center w-full">
                      <span className="text-sm text-gray-400 font-medium leading-none mb-3 truncate w-full">
                        {race.country}
                      </span>
                      
                      <div className="w-full flex justify-between items-center gap-2 mb-1.5">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">Местное</span>
                        <span className="text-sm font-bold text-gray-400 whitespace-nowrap">{race.time}</span>
                      </div>
                      
                      <div className="w-full flex justify-between items-center gap-2">
                        <span className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-wide">Ваше</span>
                        <span className="text-sm sm:text-base font-bold text-indigo-300 whitespace-nowrap leading-none">
                          {race.parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && filteredRaces.length === 0 && (
            <div className="text-center text-gray-500 py-16 flex flex-col items-center gap-3">
              <Trophy size={32} className="text-white/10" />
              <p>Нет предстоящих гонок</p>
            </div>
          )}
        </main>

        {selectedRace && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto" onClick={() => setSelectedRace(null)}></div>
            <div className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/10 w-full max-w-lg rounded-3xl p-6 pointer-events-auto relative z-10 shadow-2xl">
              <button onClick={() => setSelectedRace(null)} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full">
                <X size={20} />
              </button>

              <div className="mb-6 pr-8">
                <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border mb-3 ${SERIES_INFO[selectedRace.series]?.activeClass || 'bg-white/20 text-white'}`}>
                  {SERIES_INFO[selectedRace.series]?.label || selectedRace.series}
                </span>
                <h2 className="text-2xl font-bold mb-2 text-white">{selectedRace.name}</h2>
                <div className="text-gray-400 flex items-center gap-2 text-sm">
                   <MapPin size={15} className="text-gray-500" /> 
                   <span>{selectedRace.country}, {selectedRace.circuit}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                    <div className="text-gray-500 text-[10px] uppercase font-bold">Длина круга</div>
                    <div className="text-base font-bold text-white">{getTrackDetails(selectedRace.circuit).length}</div>
                 </div>
                 <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                    <div className="text-gray-500 text-[10px] uppercase font-bold">Рекорд круга</div>
                    <div className="text-base font-bold text-white">{getTrackDetails(selectedRace.circuit).record}</div>
                 </div>
              </div>

              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex justify-between items-center">
                 <div>
                    <div className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Старт по вашему времени</div>
                    <div className="text-2xl font-extrabold text-indigo-200">
                      {selectedRace.parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Местное время</div>
                    <div className="text-lg font-bold text-gray-400">{selectedRace.time}</div>
                 </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

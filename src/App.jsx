import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, Clock, Timer, X, Gauge, Ruler, Cloud, Navigation, Trophy, RefreshCw, AlertCircle } from 'lucide-react';

const SUPABASE_URL = 'https://qugdovsytjqjawsesdix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1Z2RvdnN5dGpxamF3c2VzZGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE5MTY2MTU4MTksImV4cCI6MjIzMjE5MTgxOX0.aYt_F8z0tT6aF0W1hO2uX8dK9jL3mN4pQ5rS6tU7vW8';

const SERIES_INFO = {
  all: { label: 'Все', activeClass: 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' },
  f1: { label: 'F1', activeClass: 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' },
  wec: { label: 'WEC', activeClass: 'bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
  dtm: { label: 'DTM', activeClass: 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' },
  super_gt: { label: 'Super GT', activeClass: 'bg-green-500 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' },
};

const YEARS = ['2026', '2027'];
const MONTHS = [
  { value: 'all', label: 'Все' }, { value: '1', label: 'Янв' }, { value: '2', label: 'Фев' }, { value: '3', label: 'Мар' },
  { value: '4', label: 'Апр' }, { value: '5', label: 'Май' }, { value: '6', label: 'Июн' }, { value: '7', label: 'Июл' }, 
  { value: '8', label: 'Авг' }, { value: '9', label: 'Сен' }, { value: '10', label: 'Окт' }, { value: '11', label: 'Ноя' }, { value: '12', label: 'Дек' },
];

const CountdownTimer = ({ targetDate }) => {
  const [tl, setTl] = useState({ d: 0, h: '00', m: '00', s: '00' });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = targetDate - new Date();
      if (diff <= 0) return clearInterval(timer);
      setTl({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24).toString().padStart(2, '0'),
        m: Math.floor((diff / 60000) % 60).toString().padStart(2, '0'),
        s: Math.floor((diff / 1000) % 60).toString().padStart(2, '0')
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {[
        { val: tl.d, label: 'Дней' }, { val: tl.h, label: 'Часов' },
        { val: tl.m, label: 'Минут' }, { val: tl.s, label: 'Секунд', color: 'text-indigo-400' }
      ].map((b, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-inner">
          <span className={`text-xl sm:text-2xl font-black ${b.color || 'text-white'}`}>{b.val}</span>
          <span className="text-[9px] uppercase text-gray-400 mt-1 font-semibold tracking-wider">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

const WeatherWidget = ({ raceDate, circuit, country }) => {
  const [weather, setWeather] = useState("Загрузка...");

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      const daysDiff = (raceDate - new Date()) / 86400000;
      if (daysDiff > 7 || daysDiff < -5) return isMounted && setWeather("Ожидается");
      
      try {
        let coords;
        for (const query of [circuit, country]) {
          if (!query || coords) continue;
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=ru`);
          const data = await res.json();
          if (data.results?.length) coords = data.results[0];
        }

        if (!coords) return isMounted && setWeather("Нет данных");

        const dateStr = raceDate.toISOString().split('T')[0];
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&daily=temperature_2m_max,weathercode&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`);
        const wData = await wRes.json();

        if (wData.daily?.time.length) {
          const wC = wData.daily.weathercode[0];
          const icon = wC === 0 ? '☀️' : wC <= 3 ? '⛅' : wC <= 49 ? '🌫️' : wC <= 69 ? '🌧️' : wC <= 79 ? '❄️' : '⛈️';
          if (isMounted) setWeather(`${icon} ${Math.round(wData.daily.temperature_2m_max[0])}°C`);
        } else {
          if (isMounted) setWeather("Недоступен");
        }
      } catch {
        if (isMounted) setWeather("Ошибка API");
      }
    };
    fetchWeather();
    return () => { isMounted = false; };
  }, [raceDate, circuit, country]);

  return <div className="text-sm font-bold text-white">{weather}</div>;
};

const getTrackDetails = (circuit = '') => {
  const hash = circuit.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return {
     length: (4 + (hash % 3) + ((hash % 10) * 0.13)).toFixed(3) + ' км',
     record: `1:${14 + (hash % 15)}.${100 + (hash * 23) % 899}`,
     corners: 10 + (hash % 12)
  };
};

export default function App() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(window.location.search);
  const [activeSeries, setActiveSeries] = useState(queryParams.get('series') || 'all');
  const [activeYear, setActiveYear] = useState(queryParams.get('year') || '2026');
  const [activeMonth, setActiveMonth] = useState(queryParams.get('month') || 'all');
  const [showPast, setShowPast] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const nextRaceRef = useRef(null);

  const fetchRaces = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/races?select=*&order=date.asc`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      if (data) setRaces(data.map(r => ({ ...r, parsedDate: new Date(r.date) })));
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRaces(); }, []);

  const nextRace = useMemo(() => races.filter(r => r.parsedDate > new Date()).sort((a, b) => a.parsedDate - b.parsedDate)[0] || null, [races]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (activeSeries !== 'all') p.set('series', activeSeries);
    if (activeYear) p.set('year', activeYear);
    if (activeMonth !== 'all') p.set('month', activeMonth);
    window.history.replaceState({}, '', `${window.location.pathname}${p.toString() ? `?${p.toString()}` : ''}`);
  }, [activeSeries, activeYear, activeMonth]);

  useEffect(() => {
    const checkDev = () => setIsDesktop(window.innerWidth >= 768 && !/mobi|android|ipad|iphone/i.test(navigator.userAgent));
    checkDev(); window.addEventListener('resize', checkDev);
    return () => window.removeEventListener('resize', checkDev);
  }, []);

  useEffect(() => {
    if (nextRaceRef.current && !loading) setTimeout(() => nextRaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
  }, [loading]);

  const filteredRaces = useMemo(() => {
    const now = new Date();
    return races.filter(r => {
      const matchS = activeSeries === 'all' || r.series.toLowerCase() === activeSeries.toLowerCase();
      const matchY = r.parsedDate.getFullYear().toString() === activeYear;
      const matchM = activeMonth === 'all' || (r.parsedDate.getMonth() + 1).toString() === activeMonth;
      const notPassed = showPast || activeYear !== now.getFullYear().toString() || r.parsedDate >= now;
      return matchS && matchY && matchM && notPassed;
    }).sort((a, b) => a.parsedDate - b.parsedDate);
  }, [races, activeSeries, activeYear, activeMonth, showPast]);

  return (
    <div className={`min-h-screen bg-black text-white font-sans selection:bg-red-500 pb-10 flex justify-center ${isDesktop ? 'items-center bg-[#050505] py-8' : ''}`}>
      <style>{`
        @keyframes appEntrance { from { opacity: 0; transform: translateY(12px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes modalScaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className={isDesktop ? 'w-full max-w-xl mx-auto rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-black min-h-[90vh]' : 'w-full max-w-full'} style={{ animation: 'appEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 p-4 pt-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="relative flex items-center justify-center w-8 h-8 bg-red-600/20 border border-red-500/40 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <Trophy className="text-red-500 w-4 h-4 animate-pulse" />
              </div>
              Motorsport Tracker
            </h1>
            <button onClick={fetchRaces} disabled={loading} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/10">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {Object.entries(SERIES_INFO).map(([key, info]) => (
              <button key={key} onClick={() => setActiveSeries(key)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeSeries === key ? info.activeClass : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                {info.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              {YEARS.map(year => (
                <button key={year} onClick={() => setActiveYear(year)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeYear === year ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {year}
                </button>
              ))}
              <div className="w-px h-5 bg-white/20 mx-1 shrink-0"></div>
              <select value={activeMonth} onChange={(e) => setActiveMonth(e.target.value)} className="appearance-none bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-lg px-3 py-1.5 pr-6 focus:outline-none transition-all cursor-pointer hover:bg-white/10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em 1em' }}>
                {MONTHS.map(m => <option key={m.value} value={m.value} className="bg-gray-900 text-white">{m.label}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setShowPast(!showPast)}>
              <span className="text-xs font-semibold text-gray-400">Прошедшие</span>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 border ${showPast ? 'bg-indigo-500 border-indigo-500' : 'bg-white/5 border-white/10'}`}>
                <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300" style={{ transform: showPast ? 'translateX(18px)' : 'translateX(3px)' }} />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">Загрузка...</p>
            </div>
          ) : error ? (
            <div className="bg-red-950/25 border border-red-500/30 rounded-2xl p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold text-red-200">Ошибка</h3>
              <p className="text-sm text-red-400 mx-auto">{error}</p>
            </div>
          ) : (
            <>
              {nextRace && (
                <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.01] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden mb-6 flex flex-col justify-center">
                  <Timer className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                       <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${SERIES_INFO[nextRace.series]?.activeClass || 'bg-white/20 text-white'}`}>
                          {SERIES_INFO[nextRace.series]?.label || nextRace.series}
                       </span>
                       <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">Ближайший этап</div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-4 pr-6">{nextRace.name}</h2>
                    <CountdownTimer targetDate={nextRace.parsedDate} />
                  </div>
                </div>
              )}

              {(() => {
                let lastMonthYear = '';
                return filteredRaces.map((race, index) => {
                  const isNext = nextRace && nextRace.id === race.id;
                  const currentMonthYear = race.parsedDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
                  const isNewMonth = lastMonthYear !== currentMonthYear;
                  lastMonthYear = currentMonthYear;
                  const seriesCfg = SERIES_INFO[race.series] || { label: race.series, activeClass: 'bg-white/20 text-white' };

                  return (
                    <React.Fragment key={race.id || index}>
                      {isNewMonth && (
                        <div className="flex items-center gap-4 mt-8 mb-4 opacity-80" style={{ animation: `fadeIn 0.5s ease-out both` }}>
                          <div className="h-px bg-white/10 flex-1"></div>
                          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{currentMonthYear}</span>
                          <div className="h-px bg-white/10 flex-1"></div>
                        </div>
                      )}
                      <div 
                        ref={isNext ? nextRaceRef : null}
                        onClick={() => setSelectedRace(race)}
                        className={`group bg-white/5 backdrop-blur-lg border rounded-2xl p-4 active:scale-[0.98] transition-all flex justify-between items-stretch gap-2 relative cursor-pointer hover:bg-white/10 ${isNext ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/10 shadow-xl'}`}
                        style={{ animation: `fadeIn 0.5s ease-out ${(index % 20) * 0.05}s both` }}
                      >
                        {isNext && <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">Скоро</div>}
                        <div className="flex flex-col items-start gap-3 flex-1">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase border ${seriesCfg.activeClass}`}>{seriesCfg.label}</span>
                          <div className="mt-1">
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white/95 leading-tight mb-2">{race.name}</h2>
                            <div className="flex flex-wrap items-center gap-1.5 text-gray-400 text-sm font-medium">
                              <MapPin size={14} className="text-gray-500 shrink-0" />
                              <span>{race.circuit}</span><span className="text-gray-600 mx-1">•</span>
                              <span>{race.parsedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex pl-4 border-l border-white/10 shrink-0 min-w-[130px] sm:min-w-[150px] items-center">
                          <div className="flex flex-col items-start justify-center w-full">
                              <span className="text-sm text-gray-400 font-medium leading-none mb-3 truncate w-full">{race.country}</span>
                              <div className="w-full flex justify-between items-center gap-2 mb-1.5">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wide flex items-center gap-1">Местное</span>
                                <span className="text-sm font-bold text-gray-400 whitespace-nowrap">{race.time}</span>
                              </div>
                              <div className="w-full flex justify-between items-center gap-2">
                                <span className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-wide flex items-center gap-1">Ваше</span>
                                <span className="text-sm sm:text-base font-bold text-indigo-300 whitespace-nowrap leading-none">
                                  {race.parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                });
              })()}
              
              {filteredRaces.length === 0 && (
                <div className="text-center text-gray-500 py-16 flex flex-col items-center gap-3">
                  <Trophy size={32} className="text-white/10" />
                  <p>Нет гонок</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {selectedRace && (() => {
        const track = getTrackDetails(selectedRace.circuit);
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto transition-opacity" style={{ animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} onClick={() => setSelectedRace(null)}></div>
            <div className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/10 w-full max-w-lg rounded-3xl p-6 pointer-events-auto relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden" style={{ animation: 'modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <button onClick={() => setSelectedRace(null)} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"><X size={20} /></button>

              <div className="mb-6 pr-8">
                <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border mb-3 ${SERIES_INFO[selectedRace.series]?.activeClass || 'bg-white/20 text-white'}`}>
                  {SERIES_INFO[selectedRace.series]?.label || selectedRace.series}
                </span>
                <h2 className="text-2xl font-bold mb-2 text-white">{selectedRace.name}</h2>
                <div className="text-gray-400 flex flex-wrap items-center gap-2 text-sm">
                  <MapPin size={15} className="text-gray-500" /> 
                  <span>{selectedRace.country}, {selectedRace.circuit}</span>
                  <span className="text-gray-600">•</span>
                  {selectedRace.parsedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: Ruler, label: 'Длина', val: track.length },
                  { icon: Gauge, label: 'Рекорд круга', val: track.record },
                  { icon: Navigation, label: 'Повороты', val: track.corners }
                ].map((item, i) => (
                  <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                    <div className="text-gray-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"><item.icon size={14}/> {item.label}</div>
                    <div className="text-base font-bold text-white">{item.val}</div>
                  </div>
                ))}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                    <div className="text-gray-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"><Cloud size={14}/> Погода</div>
                    <WeatherWidget raceDate={selectedRace.parsedDate} circuit={selectedRace.circuit} country={selectedRace.country} />
                </div>
              </div>

              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                <div>
                    <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock size={12} /> Ваше время</div>
                    <div className="text-2xl font-extrabold text-indigo-200">{selectedRace.parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div className="text-right z-10">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Местное время</div>
                    <div className="text-lg font-bold text-gray-400">{selectedRace.time}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

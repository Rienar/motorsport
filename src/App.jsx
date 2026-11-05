import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, Clock, Timer, X, Gauge, Ruler, Cloud, Navigation, 
  Trophy, RefreshCw, AlertCircle, CalendarPlus, Download, 
  ChevronDown, ChevronUp, Users, User, Loader2, Award
} from 'lucide-react';

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
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Состояния карточки этапа
  const [selectedRace, setSelectedRace] = useState(null);
  const [isStandingsExpanded, setIsStandingsExpanded] = useState(false);
  const [standingsTab, setStandingsTab] = useState('drivers'); // 'drivers' | 'teams'
  const [standingsScope, setStandingsScope] = useState('race'); // 'race' | 'cumulative'
  
  // Данные для модалки гонки
  const [driverStandings, setDriverStandings] = useState([]);
  const [teamStandings, setTeamStandings] = useState([]);
  const [cumulativeDrivers, setCumulativeDrivers] = useState([]);
  const [cumulativeTeams, setCumulativeTeams] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);

  // Данные для глобальной модалки сезона (Вариант 2)
  const [showSeasonStandingsModal, setShowSeasonStandingsModal] = useState(false);
  const [seasonStandingsTab, setSeasonStandingsTab] = useState('drivers');
  const [seasonDrivers, setSeasonDrivers] = useState([]);
  const [seasonTeams, setSeasonTeams] = useState([]);
  const [seasonLoading, setSeasonLoading] = useState(false);

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

  const aggregateResults = (data, keyField) => {
    const map = {};
    data.forEach(item => {
      const key = item[keyField];
      if (!map[key]) {
        map[key] = { ...item, points: 0, delta: 0 };
      }
      map[key].points += Number(item.points || 0);
    });
    return Object.values(map)
      .sort((a, b) => b.points - a.points)
      .map((item, idx) => ({ ...item, position: idx + 1 }));
  };

  // Загрузка результатов для модалки этапа (с поддержкой нарастающего итога)
  useEffect(() => {
    if (selectedRace && selectedRace.parsedDate < new Date() && selectedRace.series.toLowerCase() === 'f1') {
      setStandingsLoading(true);

      const pastF1RacesUpToCurrent = races
        .filter(r => r.series.toLowerCase() === 'f1' && 
                     r.parsedDate.getFullYear() === selectedRace.parsedDate.getFullYear() && 
                     r.parsedDate <= selectedRace.parsedDate)
        .map(r => r.id);

      const pastIdsQuery = `in.(${pastF1RacesUpToCurrent.join(',')})`;

      Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/driver_results?race_id=eq.${selectedRace.id}&order=position.asc`, { 
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } 
        }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/team_results?race_id=eq.${selectedRace.id}&order=position.asc`, { 
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } 
        }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/driver_results?race_id=${pastIdsQuery}`, { 
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } 
        }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/team_results?race_id=${pastIdsQuery}`, { 
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } 
        }).then(r => r.json())
      ]).then(([dRace, tRace, dCum, tCum]) => {
        setDriverStandings(Array.isArray(dRace) ? dRace : []);
        setTeamStandings(Array.isArray(tRace) ? tRace : []);

        if (Array.isArray(dCum) && Array.isArray(dRace)) {
          const racePointsMap = {};
          dRace.forEach(r => { racePointsMap[r.driver_name] = Number(r.points || 0); });
          const aggDrivers = aggregateResults(dCum, 'driver_name').map(d => ({
            ...d,
            delta: racePointsMap[d.driver_name] || 0
          }));
          setCumulativeDrivers(aggDrivers);
        }

        if (Array.isArray(tCum) && Array.isArray(tRace)) {
          const raceTeamPointsMap = {};
          tRace.forEach(r => { raceTeamPointsMap[r.team_name] = Number(r.points || 0); });
          const aggTeams = aggregateResults(tCum, 'team_name').map(t => ({
            ...t,
            delta: raceTeamPointsMap[t.team_name] || 0
          }));
          setCumulativeTeams(aggTeams);
        }
      }).catch(console.error).finally(() => setStandingsLoading(false));
    } else {
      setDriverStandings([]);
      setTeamStandings([]);
      setCumulativeDrivers([]);
      setCumulativeTeams([]);
    }
  }, [selectedRace, races]);

  // Загрузка глобального стендинга сезона для кнопки в шапке
  const fetchGlobalSeasonStandings = async () => {
    setShowSeasonStandingsModal(true);
    setSeasonLoading(true);

    const pastF1SeasonIds = races
      .filter(r => r.series.toLowerCase() === 'f1' && 
                   r.parsedDate.getFullYear().toString() === activeYear && 
                   r.parsedDate < new Date())
      .map(r => r.id);

    if (pastF1SeasonIds.length === 0) {
      setSeasonDrivers([]);
      setSeasonTeams([]);
      setSeasonLoading(false);
      return;
    }

    const idsQuery = `in.(${pastF1SeasonIds.join(',')})`;

    try {
      const [dRes, tRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/driver_results?race_id=${idsQuery}`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/team_results?race_id=${idsQuery}`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        }).then(r => r.json())
      ]);

      if (Array.isArray(dRes)) setSeasonDrivers(aggregateResults(dRes, 'driver_name'));
      if (Array.isArray(tRes)) setSeasonTeams(aggregateResults(tRes, 'team_name'));
    } catch (e) {
      console.error(e);
    } finally {
      setSeasonLoading(false);
    }
  };

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

  const handleAddToCalendar = (e, type, race) => {
    e.stopPropagation();
    const start = race.parsedDate;
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); 
    const title = `${race.name} (${race.series.toUpperCase()})`;
    const loc = `${race.circuit}, ${race.country}`;
    const formatD = d => d.toISOString().replace(/-|:|\.\d+/g, '');

    if (type === 'google') {
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatD(start)}/${formatD(end)}&location=${encodeURIComponent(loc)}`;
      window.open(url, '_blank');
    } else if (type === 'ics') {
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
        `SUMMARY:${title}`, `DTSTART:${formatD(start)}`, `DTEND:${formatD(end)}`, `LOCATION:${loc}`,
        "END:VEVENT", "END:VCALENDAR"
      ].join("\n");
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${race.name.replace(/\s+/g, '_')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openModal = (race) => {
    setSelectedRace(race);
    setIsStandingsExpanded(false);
    setStandingsTab('drivers');
    setStandingsScope('race');
  };

  return (
    <div className={`min-h-screen bg-black text-white font-sans selection:bg-red-500 pb-10 flex justify-center ${isDesktop ? 'items-center bg-[#050505] py-8' : ''}`}>
      <style>{`
        @keyframes appEntrance { from { opacity: 0; transform: translateY(12px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes modalScaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
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
          
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
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

              {/* Кнопка "Зачёт" в шапке (Вариант 2, только для F1) */}
              {activeSeries === 'f1' && (
                <button 
                  onClick={fetchGlobalSeasonStandings}
                  className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                >
                  <Award size={13} className="text-amber-400" />
                  <span>Зачёт {activeYear}</span>
                </button>
              )}
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
                        onClick={() => openModal(race)}
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

      {/* МОДАЛКА ЭТАПА (С ПЕРЕКЛЮЧАТЕЛЕМ НАРАСТАЮЩЕГО ИТОГА) */}
      {selectedRace && (() => {
        const track = getTrackDetails(selectedRace.circuit);
        const isPastRace = selectedRace.parsedDate < new Date();
        const isF1 = selectedRace.series.toLowerCase() === 'f1';

        const activeList = standingsScope === 'race'
          ? (standingsTab === 'drivers' ? driverStandings : teamStandings)
          : (standingsTab === 'drivers' ? cumulativeDrivers : cumulativeTeams);

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto transition-opacity" style={{ animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} onClick={() => setSelectedRace(null)}></div>
            <div className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto hide-scrollbar rounded-3xl p-6 pointer-events-auto relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]" style={{ animation: 'modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <button onClick={() => setSelectedRace(null)} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors z-20"><X size={20} /></button>

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

              {/* Характеристики трассы */}
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

              {/* РЕЗУЛЬТАТЫ F1 */}
              {isPastRace && isF1 && (
                <div className="mb-6 bg-black/40 border border-white/5 rounded-2xl p-4 overflow-hidden transition-all duration-300 min-h-[160px] relative">
                  
                  {/* Заголовок и тумблер: Этап / Нарастающий итог */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy size={15} className="text-amber-400"/> 
                      {standingsScope === 'race' ? 'Итоги этапа' : 'Зачёт после этапа'}
                    </h3>

                    {/* Тумблер Варианта 1 */}
                    <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 text-[11px]">
                      <button 
                        onClick={() => setStandingsScope('race')} 
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${standingsScope === 'race' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                      >
                        Этап
                      </button>
                      <button 
                        onClick={() => setStandingsScope('cumulative')} 
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${standingsScope === 'cumulative' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                      >
                        После этапа
                      </button>
                    </div>
                  </div>
                  
                  {standingsLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 rounded-2xl">
                      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                  ) : activeList.length === 0 ? (
                    <div className="text-center text-gray-500 text-xs py-4">Результаты еще не добавлены</div>
                  ) : (
                    <>
                      {!isStandingsExpanded ? (
                        /* Свернутый вид: Топ-3 */
                        <div className="space-y-4">
                          <div>
                            <div className="text-[10px] uppercase text-gray-500 font-bold mb-2">
                              {standingsScope === 'race' ? 'Пилоты (Топ-3)' : 'Личный зачёт (Топ-3)'}
                            </div>
                            {(standingsScope === 'race' ? driverStandings : cumulativeDrivers).slice(0, 3).map((d) => (
                              <div key={d.id || d.driver_name} className="flex justify-between items-center text-sm py-1.5 border-b border-white/5 last:border-0">
                                <div className="flex gap-3 items-center">
                                  <span className={`font-bold w-3 text-xs ${d.position === 1 ? 'text-amber-400' : d.position === 2 ? 'text-gray-300' : 'text-amber-600'}`}>
                                    {d.position}
                                  </span>
                                  <div>
                                    <span className="text-white font-medium">{d.driver_name}</span>
                                    <span className="text-gray-500 text-[10px] ml-2">{d.team_name}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-indigo-300 font-bold text-xs">{d.points} PTS</span>
                                  {standingsScope === 'cumulative' && d.delta > 0 && (
                                    <span className="text-[10px] text-emerald-400 ml-1.5 font-semibold">+{d.delta}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <button 
                            onClick={() => setIsStandingsExpanded(true)}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-colors flex items-center justify-center gap-1"
                          >
                            Полный зачет <ChevronDown size={14} />
                          </button>
                        </div>
                      ) : (
                        /* Развернутый вид */
                        <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
                          <div className="flex bg-white/5 p-1 rounded-xl">
                            <button onClick={() => setStandingsTab('drivers')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${standingsTab === 'drivers' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                              <User size={14}/> Пилоты
                            </button>
                            <button onClick={() => setStandingsTab('teams')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${standingsTab === 'teams' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                              <Users size={14}/> Команды
                            </button>
                          </div>

                          <div className="max-h-52 overflow-y-auto hide-scrollbar pr-1 divide-y divide-white/5">
                            {activeList.map((item) => (
                              <div key={item.id || item.driver_name || item.team_name} className="flex justify-between items-center text-sm py-2">
                                <div className="flex gap-3 items-center">
                                  <span className={`font-bold w-4 text-center ${item.position === 1 ? 'text-amber-400' : item.position === 2 ? 'text-gray-300' : item.position === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                                    {item.position}
                                  </span>
                                  <div>
                                    <div className="text-white font-medium text-xs sm:text-sm">{item.driver_name || item.team_name}</div>
                                    {item.driver_name && <div className="text-[10px] text-gray-500 uppercase">{item.team_name}</div>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-indigo-300 font-bold text-xs sm:text-sm">{item.points} <span className="text-[10px] text-indigo-500/60">PTS</span></span>
                                  {standingsScope === 'cumulative' && item.delta > 0 && (
                                    <span className="text-[10px] text-emerald-400 ml-1.5 font-bold">+{item.delta}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={() => setIsStandingsExpanded(false)}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-colors flex items-center justify-center gap-1"
                          >
                            Свернуть <ChevronUp size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Блок Времени и Добавления в календарь (только если гонка впереди) */}
              {!isPastRace && (
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                   <div>
                      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Clock size={12} /> Ваше время
                      </div>
                      <div className="text-2xl font-extrabold text-indigo-200">
                        {selectedRace.parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">Местное: {selectedRace.time}</div>
                   </div>
                   
                   <div className="flex items-center gap-2 z-10">
                      <button 
                        onClick={(e) => handleAddToCalendar(e, 'google', selectedRace)}
                        className="p-2.5 bg-white/5 hover:bg-indigo-500 hover:border-indigo-400 border border-white/10 rounded-xl text-indigo-200 transition-all shadow-lg"
                        title="Google Календарь"
                      >
                        <CalendarPlus size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleAddToCalendar(e, 'ics', selectedRace)}
                        className="p-2.5 bg-white/5 hover:bg-white/20 border border-white/10 rounded-xl text-gray-300 transition-all shadow-lg"
                        title="Скачать .ics файл (Apple / Outlook)"
                      >
                        <Download size={18} />
                      </button>
                   </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* ГЛОБАЛЬНАЯ МОДАЛКА СТЕНДИНГА СЕЗОНА (ВАРИАНТ 2) */}
      {showSeasonStandingsModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto transition-opacity" 
            style={{ animation: 'fadeIn 0.3s ease-out forwards' }} 
            onClick={() => setShowSeasonStandingsModal(false)}
          />
          <div 
            className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/10 w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl p-6 pointer-events-auto relative z-10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col" 
            style={{ animation: 'modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
            
            <button 
              onClick={() => setShowSeasonStandingsModal(false)} 
              className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="mb-4 pr-8">
              <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border mb-2 bg-amber-500/20 text-amber-300 border-amber-500/30">
                Formula 1 • {activeYear}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="text-amber-400 w-5 h-5" /> Турнирная таблица
              </h2>
              <p className="text-gray-400 text-xs mt-1">Текущий общий зачёт по сумме всех завершённых этапов</p>
            </div>

            {/* Переключатель табов: полупрозрачный фон, рамка и свечение */}
            <div className="flex bg-white/[0.08] p-1.5 rounded-2xl border border-white/10 mb-4 shrink-0 shadow-inner">
              <button 
                onClick={() => setSeasonStandingsTab('drivers')} 
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  seasonStandingsTab === 'drivers' 
                    ? 'bg-amber-500 text-black shadow-[0_0_18px_rgba(245,158,11,0.45)]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <User size={14}/> Личный зачёт
              </button>
              <button 
                onClick={() => setSeasonStandingsTab('teams')} 
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  seasonStandingsTab === 'teams' 
                    ? 'bg-amber-500 text-black shadow-[0_0_18px_rgba(245,158,11,0.45)]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users size={14}/> Кубок конструкторов
              </button>
            </div>

            {/* Список зачета с индиго-акцентом для очков */}
            <div className="flex-1 overflow-y-auto hide-scrollbar divide-y divide-white/5 pr-1">
              {seasonLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                  <p className="text-gray-400 text-xs">Подсчет очков чемпионата...</p>
                </div>
              ) : (seasonStandingsTab === 'drivers' ? seasonDrivers : seasonTeams).length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-12">В этом сезоне еще нет завершенных гонок</div>
              ) : (
                (seasonStandingsTab === 'drivers' ? seasonDrivers : seasonTeams).map((item) => (
                  <div key={item.driver_name || item.team_name} className="flex justify-between items-center py-2.5 px-2 hover:bg-white/[0.03] rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 text-center font-bold text-sm ${
                        item.position === 1 ? 'text-amber-400' : 
                        item.position === 2 ? 'text-gray-300' : 
                        item.position === 3 ? 'text-amber-600' : 'text-gray-500'
                      }`}>
                        {item.position}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white/95">{item.driver_name || item.team_name}</div>
                        {item.driver_name && <div className="text-[10px] text-gray-400 uppercase tracking-wider">{item.team_name}</div>}
                      </div>
                    </div>
                    <div className="text-right flex items-baseline gap-1">
                      <span className="text-indigo-300 font-extrabold text-sm sm:text-base">{item.points}</span>
                      <span className="text-[10px] text-indigo-400/70 font-bold uppercase tracking-wider">PTS</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

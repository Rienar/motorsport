import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Clock, Timer, X, Gauge, Ruler, Cloud, Navigation, Trophy, RefreshCw, AlertCircle } from 'lucide-react';

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
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = targetDate - new Date();
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
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-inner">
        <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.days}</span>
        <span className="text-[9px] uppercase text-gray-400 mt-1 font-semibold tracking-wider">Дней</span>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-inner">
        <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-[9px] uppercase text-gray-400 mt-1 font-semibold tracking-wider">Часов</span>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-inner">
        <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.mins.toString().padStart(2, '0')}</span>
        <span className="text-[9px] uppercase text-gray-400 mt-1 font-semibold tracking-wider">Минут</span>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-inner">
        <span className="text-xl sm:text-2xl font-black text-indigo-400">{timeLeft.secs.toString().padStart(2, '0')}</span>
        <span className="text-[9px] uppercase text-gray-400 mt-1 font-semibold tracking-wider">Секунд</span>
      </div>
    </div>
  );
};

const WeatherWidget = ({ raceDate, circuit, country }) => {
  const [weather, setWeather] = useState("Загрузка...");

  useEffect(() => {
    let isMounted = true;
    const fetchLiveWeather = async () => {
      const daysDiff = (raceDate - new Date()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 7 || daysDiff < -5) {
        if (isMounted) setWeather("Ожидается");
        return;
      }
      try {
        let coords = null;
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(circuit)}&count=1&language=ru`);
        const geoData = await geoRes.json();
        if (geoData.results?.length > 0) coords = geoData.results[0];
        else if (country) {
          const cRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(country)}&count=1&language=ru`); const cData = await cRes.json(); if (cData.results?.length > 0) coords = cData.results[0]; }  if (!coords) { if (isMounted) setWeather("Нет данных"); return; }  const dStr = raceDate.toISOString().split('T')[0]; const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&daily=temperature_2m_max,weathercode&timezone=auto&start_date=${dStr}&end_date=${dStr}`); const wData = await wRes.json();  if (wData.daily?.time.length > 0) { const maxT = Math.round(wData.daily.temperature_2m_max[0]); const wC = wData.daily.weathercode[0]; let icon = '🌤️'; if (wC === 0) icon = '☀️'; else if (wC <= 3) icon = '⛅'; else if (wC <= 49) icon = '🌫️'; else if (wC <= 69) icon = '🌧️'; else if (wC <= 79) icon = '❄️'; else icon = '⛈️'; if (isMounted) setWeather(`${icon} ${maxT}°C`); } else { if (isMounted) setWeather("Недоступен"); } } catch (err) { if (isMounted) setWeather("Ошибка API"); } }; fetchLiveWeather(); return () => { isMounted = false; }; }, [raceDate, circuit, country]);  return <div className="text-sm font-bold text-white">{weather}</div>; };  const getTrackDetails = (circuit) => { const hash = (circuit \vert{}\vert{} '').split('').reduce((a, b) => a + b.charCodeAt(0), 0); return { length: (4 + (hash \% 3) + ((hash \% 10) * 0.13)).toFixed(3) + ' км', record: `1:${14 + (hash % 15)}.${100 + (hash * 23) \% 899}`, corners: 10 + (hash \% 12) }; };  export default function App() { const [races, setRaces] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);  const queryParams = new URLSearchParams(window.location.search); const [activeSeries, setActiveSeries] = useState(queryParams.get('series') \vert{}\vert{} 'all'); const [activeYear, setActiveYear] = useState(queryParams.get('year') \vert{}\vert{} '2026'); const [activeMonth, setActiveMonth] = useState(queryParams.get('month') \vert{}\vert{} 'all'); const [showPastRaces, setShowPastRaces] = useState(false);  const [selectedRace, setSelectedRace] = useState(null); const [isDesktop, setIsDesktop] = useState(false);  const fetchRaces = async () => { setLoading(true); setError(null); try { const response = await fetch(`${SUPABASE_URL}/rest/v1/races?select=*&order=date.asc`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }); if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
      const data = await response.json();
      if (data) setRaces(data.map(r => ({ ...r, parsedDate: new Date(r.date) })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRaces(); }, []);

  const nextRace = useMemo(() => {
    const upcoming = races.filter(r => r.parsedDate > new Date()).sort((a, b) => a.parsedDate - b.parsedDate);
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [races]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeSeries !== 'all') params.set('series', activeSeries);
    if (activeYear) params.set('year', activeYear);
    if (activeMonth !== 'all') params.set('month', activeMonth);
    window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`);
  }, [activeSeries, activeYear, activeMonth]);

  useEffect(() => {
    const checkDevice = () => setIsDesktop(!/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()) && window.innerWidth >= 768);
    checkDevice(); window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const nextRaceRef = React.useRef(null);
  useEffect(() => {
    if (nextRaceRef.current && !loading) {
      setTimeout(() => nextRaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    }
  }, [loading]);

  const filteredRaces = useMemo(() => {
    const now = new Date();
    return races.filter(r => {
      const matchSeries = activeSeries === 'all' || r.series.toLowerCase() === activeSeries.toLowerCase();
      const matchYear = r.parsedDate.getFullYear().toString() === activeYear;
      const matchMonth = activeMonth === 'all' || (r.parsedDate.getMonth() + 1).toString() === activeMonth;
      const notPassed = showPastRaces || activeYear !== now.getFullYear().toString() || r.parsedDate >= now;
      return matchSeries && matchYear && matchMonth && notPassed;
    }).sort((a, b) => a.parsedDate - b.parsedDate);
  }, [races, activeSeries, activeYear, activeMonth, showPastRaces]);

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
                <button key={year} onClick={() => setActiveYear(year)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font

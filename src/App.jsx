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
  
  // Результаты конкретной гонки
  const [driverStandings, setDriverStandings] = useState([]);
  const [teamStandings, setTeamStandings] = useState([]);
  // Результаты с нарастающим итогом на момент этапа
  const [cumulativeDrivers, setCumulativeDrivers] = useState([]);
  const [cumulativeTeams, setCumulativeTeams] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);

  // Состояние глобальной модалки турнирной таблицы (Вариант 2)
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

  // Вспомогательный расчет суммы очков
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

      // Находим все гонки F1 того же года до текущей включительно
      const pastF1RacesUpToCurrent = races
        .filter

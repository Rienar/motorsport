import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Timer, AlertCircle, Radio
} from 'lucide-react';
import { useRaces, useCircuits } from './services/queries';
import { TRANSLATIONS } from './constants/translations';
import { SERIES_CONFIG, YEARS } from './constants/seriesConfig';
import { Header } from './components/Header';
import { RaceCard } from './components/RaceCard';
import { CalendarView } from './components/CalendarView';
import { RaceModal } from './components/RaceModal';
import { SeasonModal } from './components/SeasonModal';
import { SeasonTracker } from './components/SeasonTracker';

const SUPABASE_URL = 'https://qugdovsytjqjawsesdix.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DrPG1dGhbIWU2EARd9v88g_X3c_pPvX';

const getRaceDurationMs = (race) => {
  const s = race.series?.toLowerCase() || '';
  const name = race.name?.toLowerCase() || '';

  if (s === 'f1') return 2 * 60 * 60 * 1000;
  if (s === 'dtm') return 75 * 60 * 1000;
  if (s === 'super_gt') return 150 * 60 * 1000;
  if (s === 'wec') {
    if (name.includes('24')) return 24 * 60 * 60 * 1000;
    if (name.includes('1812') || name.includes('10')) return 10 * 60 * 60 * 1000;
    if (name.includes('8') || name.includes('сах') || name.includes('бах') || name.includes('bahrain')) return 8 * 60 * 60 * 1000;
    return 6 * 60 * 60 * 1000;
  }
  return 2 * 60 * 60 * 1000;
};

const LiveStopwatch = ({ startDate, t }) => {
  const [elapsed, setElapsed] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, new Date().getTime() - startDate.getTime());
      setElapsed({
        h: Math.floor(diff / 3600000).toString().padStart(2, '0'),
        m: Math.floor((diff / 60000) % 60).toString().padStart(2, '0'),
        s: Math.floor((diff / 1000) % 60).toString().padStart(2, '0')
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/40 rounded-2xl py-3 px-4 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
      <span className="text-xs uppercase font-bold text-red-300 tracking-wider">{t.onAir}</span>
      <span className="text-xl font-black text-white font-mono tracking-widest">{elapsed.h}:{elapsed.m}:{elapsed.s}</span>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ru');
  const t = useMemo(() => TRANSLATIONS[lang] || TRANSLATIONS.ru, [lang]);

  const changeLanguage = (nextLang) => {
    if (nextLang === lang) return;
    setLang(nextLang);
    localStorage.setItem('app_lang', nextLang);
  };

  const { data: rawRaces = [], isLoading: racesLoading, error: racesError, refetch } = useRaces();
  const { data: circuitsMap = {} } = useCircuits();

  const races = useMemo(() => rawRaces.map(r => ({ ...r, parsedDate: new Date(r.date) })), [rawRaces]);

  const queryParams = new URLSearchParams(window.location.search);
  const [activeSeries, setActiveSeries] = useState(queryParams.get('series') || 'all');
  const [activeYear, setActiveYear] = useState(queryParams.get('year') || '2026');
  const [activeMonth, setActiveMonth] = useState(queryParams.get('month') || 'all');
  const [showPast, setShowPast] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  const [dayRacesModal, setDayRacesModal] = useState(null);
  const [activeRaceIndex, setActiveRaceIndex] = useState(0);

  const selectedRace = useMemo(() => {
    if (!dayRacesModal || dayRacesModal.length === 0) return null;
    return dayRacesModal[activeRaceIndex] || dayRacesModal[0];
  }, [dayRacesModal, activeRaceIndex]);

  const [isStandingsExpanded, setIsStandingsExpanded] = useState(false);
  const [standingsTab, setStandingsTab] = useState('drivers');
  const [standingsScope, setStandingsScope] = useState('race');
  
  const [driverStandings, setDriverStandings] = useState([]);
  const [teamStandings, setTeamStandings] = useState([]);
  const [cumulativeDrivers, setCumulativeDrivers] = useState([]);
  const [cumulativeTeams, setCumulativeTeams] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);

  const [showSeasonStandingsModal, setShowSeasonStandingsModal] = useState(false);
  const [seasonStandingsTab, setSeasonStandingsTab] = useState('drivers');
  const [seasonDrivers, setSeasonDrivers] = useState([]);
  const [seasonTeams, setSeasonTeams] = useState([]);
  const [seasonLoading, setSeasonLoading] = useState(false);

  const nextRaceRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(clock);
  }, []);

  const getCircuitInfo = (race) => {
    if (!race) return null;
    return circuitsMap[String(race.circuit_id)] || circuitsMap[race.circuit] || {
      name: race.circuit,
      country: race.country,
      length_km: null,
      turns: null,
      lap_record: null,
      wiki_url: null
    };
  };

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

  const isRaceLive = (race) => {
    const start = race.parsedDate.getTime();
    const end = start + getRaceDurationMs(race);
    const now = currentTime.getTime();
    return now >= start && now < end;
  };

  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    races.forEach(r => {
      const matchSeries = activeSeries === 'all' || r.series.toLowerCase() === activeSeries.toLowerCase();
      const matchYear = r.parsedDate.getFullYear().toString() === activeYear;
      if (matchSeries && matchYear) {
        monthsSet.add(r.parsedDate.getMonth());
      }
    });
    return Array.from(monthsSet).sort((a, b) => a - b);
  }, [races, activeSeries, activeYear]);

  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(calMonth)) {
      setCalMonth(availableMonths[0]);
    }
  }, [availableMonths, calMonth]);

  const handlePrevMonth = () => {
    if (availableMonths.length === 0) return;
    const currentIdx = availableMonths.indexOf(calMonth);
    if (currentIdx > 0) {
      setCalMonth(availableMonths[currentIdx - 1]);
    } else {
      setCalMonth(availableMonths[availableMonths.length - 1]);
    }
  };

  const handleNextMonth = () => {
    if (availableMonths.length === 0) return;
    const currentIdx = availableMonths.indexOf(calMonth);
    if (currentIdx !== -1 && currentIdx < availableMonths.length - 1) {
      setCalMonth(availableMonths[currentIdx + 1]);
    } else {
      setCalMonth(availableMonths[0]);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (selectedRace && (selectedRace.parsedDate < new Date() || isRaceLive(selectedRace)) && selectedRace.series.toLowerCase() === 'f1') {
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
        if (isCancelled) return;
        setDriverStandings(Array.isArray(dRace) ? dRace : []);
        setTeamStandings(Array.isArray(tRace) ? tRace : []);

        if (Array.isArray(dCum) && Array.isArray(dRace)) {
          const racePointsMap = {};
          dRace.forEach(r => { racePointsMap[r.driver_name] = Number(r.points || 0); });
          setCumulativeDrivers(aggregateResults(dCum, 'driver_name').map(d => ({
            ...d,
            delta: racePointsMap[d.driver_name] || 0
          })));
        }

        if (Array.isArray(tCum) && Array.isArray(tRace)) {
          const raceTeamPointsMap = {};
          tRace.forEach(r => { raceTeamPointsMap[r.team_name] = Number(r.points || 0); });
          setCumulativeTeams(aggregateResults(tCum, 'team_name').map(t => ({
            ...t,
            delta: raceTeamPointsMap[t.team_name] || 0
          })));
        }
      }).catch(console.error).finally(() => {
        if (!isCancelled) setStandingsLoading(false);
      });
    } else {
      setDriverStandings([]);
      setTeamStandings([]);
      setCumulativeDrivers([]);
      setCumulativeTeams([]);
    }
    return () => { isCancelled = true; };
  }, [selectedRace, races]);

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

    try {
      const [dRes, tRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/driver_results?race_id=in.(${pastF1SeasonIds.join(',')})`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/team_results?race_id=in.(${pastF1SeasonIds.join(',')})`, {
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

  const activeOrNextRace = useMemo(() => {
    const live = races.find(r => isRaceLive(r));
    if (live) return { race: live, isLive: true };
    const upcoming = races.filter(r => r.parsedDate > currentTime).sort((a, b) => a.parsedDate - b.parsedDate)[0] || null;
    return { race: upcoming, isLive: false };
  }, [races, currentTime]);

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
    if (nextRaceRef.current && !racesLoading && viewMode === 'list') {
      setTimeout(() => nextRaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    }
  }, [racesLoading, viewMode]);

  const filteredRaces = useMemo(() => {
    return races.filter(r => {
      const isLive = isRaceLive(r);
      const matchS = activeSeries === 'all' || r.series.toLowerCase() === activeSeries.toLowerCase();
      const matchY = r.parsedDate.getFullYear().toString() === activeYear;
      const matchM = activeMonth === 'all' || (r.parsedDate.getMonth() + 1).toString() === activeMonth;
      const notPassed = showPast || activeYear !== currentTime.getFullYear().toString() || r.parsedDate >= currentTime || isLive;
      return matchS && matchY && matchM && notPassed;
    }).sort((a, b) => a.parsedDate - b.parsedDate);
  }, [races, activeSeries, activeYear, activeMonth, showPast, currentTime]);

  const handleAddToCalendar = (e, type, race) => {
    e.stopPropagation();
    const cInfo = getCircuitInfo(race);
    const start = race.parsedDate;
    const end = new Date(start.getTime() + getRaceDurationMs(race)); 
    const title = `${race.name} (${race.series.toUpperCase()})`;
    const loc = `${cInfo?.name || race.circuit}, ${race.country}`;
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

  const openDayModal = (racesList, initialIndex = 0) => {
    if (!racesList || racesList.length === 0) return;
    setDayRacesModal(racesList);
    setActiveRaceIndex(initialIndex);
    setIsStandingsExpanded(false);
    setStandingsTab('drivers');
    setStandingsScope('race');
  };

  const calendarDays = useMemo(() => {
    const year = parseInt(activeYear, 10);
    const month = calMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({ dayNumber: prevMonthLastDay - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ dayNumber: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ dayNumber: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    }

    return days.map(d => {
      const y = d.date.getFullYear();
      const m = d.date.getMonth();
      const dateNum = d.date.getDate();

      const racesOnDay = races.filter(r => {
        const matchSeries = activeSeries === 'all' || r.series.toLowerCase() === activeSeries.toLowerCase();
        return matchSeries && 
               r.parsedDate.getFullYear() === y && 
               r.parsedDate.getMonth() === m && 
               r.parsedDate.getDate() === dateNum;
      });
      return { ...d, races: racesOnDay };
    });
  }, [activeYear, calMonth, races, activeSeries]);

  return (
    <div className={`min-h-screen bg-black text-white font-sans selection:bg-red-500 pb-10 flex justify-center ${isDesktop ? 'items-center bg-[#050505] py-8' : ''}`}>
      <style>{`
        @keyframes appEntrance { from { opacity: 0; transform: translateY(12px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes modalScaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className={isDesktop ? 'w-full max-w-xl mx-auto rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-black min-h-[90vh]' : 'w-full max-w-full'} style={{ animation: 'appEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <Header 
          t={t} lang={lang} onToggleLang={changeLanguage}
          activeSeries={activeSeries} setActiveSeries={setActiveSeries}
          activeYear={activeYear} setActiveYear={setActiveYear}
          activeMonth={activeMonth} setActiveMonth={setActiveMonth}
          showPast={showPast} setShowPast={setShowPast}
          viewMode={viewMode} setViewMode={setViewMode}
          onRefresh={refetch} loading={racesLoading}
          onOpenSeason={fetchGlobalSeasonStandings}
        />

        <main className="p-4 space-y-4">
          {racesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">{t.loading}</p>
            </div>
          ) : racesError ? (
            <div className="bg-red-950/25 border border-red-500/30 rounded-2xl p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold text-red-200">{t.errorTitle}</h3>
              <p className="text-sm text-red-400 mx-auto">{racesError.message}</p>
            </div>
          ) : (
            <>
              {activeSeries === 'all' ? (
                activeOrNextRace.race && (
                  <div className={`border rounded-3xl p-5 shadow-2xl relative overflow-hidden mb-6 flex flex-col justify-center transition-all ${
                    activeOrNextRace.isLive 
                      ? 'bg-gradient-to-br from-red-950/40 via-red-900/10 to-transparent border-red-500/50 shadow-[0_0_35px_rgba(239,68,68,0.25)]' 
                      : 'bg-gradient-to-br from-white/[0.08] to-white/[0.01] border-white/10'
                  }`}>
                    <Timer className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 pointer-events-none" />
                    <div className="relative z-10">
                      
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                           <span className={`shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${SERIES_CONFIG[activeOrNextRace.race.series]?.activeClass || 'bg-white/20 text-white'}`}>
                              {SERIES_CONFIG[activeOrNextRace.race.series]?.label[lang] || activeOrNextRace.race.series}
                           </span>
                           
                           {activeOrNextRace.isLive ? (
                             <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]">
                               <Radio size={12} /> {t.liveSession}
                             </div>
                           ) : (
                             <div className="shrink-0 text-xs text-indigo-300 font-semibold uppercase tracking-wider hidden sm:block">
                               {t.closestRace}:
                             </div>
                           )}
                        </div>

                        <h2 className="text-base sm:text-lg font-bold text-white truncate text-right">
                          {activeOrNextRace.race.name}
                        </h2>
                      </div>
                      
                      {activeOrNextRace.isLive ? (
                        <LiveStopwatch startDate={activeOrNextRace.race.parsedDate} t={t} />
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { val: Math.floor((activeOrNextRace.race.parsedDate - currentTime) / 86400000), label: t.days },
                            { val: Math.floor(((activeOrNextRace.race.parsedDate - currentTime) / 3600000) % 24).toString().padStart(2, '0'), label: t.hours },
                            { val: Math.floor(((activeOrNextRace.race.parsedDate - currentTime) / 60000) % 60).toString().padStart(2, '0'), label: t.minutes },
                            { val: Math.floor(((activeOrNextRace.race.parsedDate - currentTime) / 1000) % 60).toString().padStart(2, '0'), label: t.seconds, color: 'text-indigo-400' }
                          ].map((b, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl py-2 px-1.5 flex flex-col items-center justify-center shadow-inner">
                              <span className={`text-lg sm:text-xl font-black ${b.color || 'text-white'}`}>{b.val}</span>
                              <span className="text-[8px] uppercase text-gray-400 mt-0.5 font-semibold tracking-wider">{b.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <SeasonTracker 
                  activeSeries={activeSeries}
                  races={races}
                  currentTime={currentTime}
                  lang={lang}
                  t={t}
                  onSelectRace={(race) => openDayModal([race])}
                />
              )}

              {viewMode === 'list' && (
                <>
                  {(() => {
                    let lastMonthYear = '';
                    return filteredRaces.map((race, index) => {
                      const isCurrentLive = isRaceLive(race);
                      const isNext = !isCurrentLive && activeOrNextRace.race && activeOrNextRace.race.id === race.id;
                      const currentMonthYear = race.parsedDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' });
                      const isNewMonth = lastMonthYear !== currentMonthYear;
                      lastMonthYear = currentMonthYear;
                      const cInfo = getCircuitInfo(race);

                      return (
                        <React.Fragment key={race.id || index}>
                          {isNewMonth && (
                            <div className="flex items-center gap-4 mt-8 mb-4 opacity-80" style={{ animation: `fadeIn 0.5s ease-out both` }}>
                              <div className="h-px bg-white/10 flex-1"></div>
                              <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{currentMonthYear}</span>
                              <div className="h-px bg-white/10 flex-1"></div>
                            </div>
                          )}
                          <RaceCard 
                            race={race}
                            isLive={isCurrentLive}
                            isNext={isNext}
                            cInfo={cInfo}
                            onClick={() => openDayModal([race])}
                            lang={lang}
                            t={t}
                          />
                        </React.Fragment>
                      );
                    });
                  })()}
                  
                  {filteredRaces.length === 0 && (
                    <div className="text-center text-gray-500 py-16 flex flex-col items-center gap-3">
                      <p>{t.noRaces}</p>
                    </div>
                  )}
                </>
              )}

              {viewMode === 'calendar' && (
                <CalendarView 
                  activeYear={activeYear}
                  calMonth={calMonth}
                  availableMonths={availableMonths}
                  handlePrevMonth={handlePrevMonth}
                  handleNextMonth={handleNextMonth}
                  setCalMonth={setCalMonth}
                  calendarDays={calendarDays}
                  isRaceLive={isRaceLive}
                  openDayModal={openDayModal}
                  lang={lang}
                  t={t}
                />
              )}
            </>
          )}
        </main>
      </div>

      <RaceModal 
        dayRacesModal={dayRacesModal}
        activeRaceIndex={activeRaceIndex}
        setActiveRaceIndex={setActiveRaceIndex}
        selectedRace={selectedRace}
        setDayRacesModal={setDayRacesModal}
        cInfo={selectedRace ? getCircuitInfo(selectedRace) : null}
        currentLive={selectedRace ? isRaceLive(selectedRace) : false}
        isPastRace={selectedRace ? selectedRace.parsedDate < new Date() && !isRaceLive(selectedRace) : false}
        isF1={selectedRace ? selectedRace.series.toLowerCase() === 'f1' : false}
        standingsScope={standingsScope}
        setStandingsScope={setStandingsScope}
        standingsLoading={standingsLoading}
        activeList={standingsScope === 'race' ? (standingsTab === 'drivers' ? driverStandings : teamStandings) : (standingsTab === 'drivers' ? cumulativeDrivers : cumulativeTeams)}
        isStandingsExpanded={isStandingsExpanded}
        setIsStandingsExpanded={setIsStandingsExpanded}
        standingsTab={standingsTab}
        setStandingsTab={setStandingsTab}
        driverStandings={driverStandings}
        cumulativeDrivers={cumulativeDrivers}
        handleAddToCalendar={handleAddToCalendar}
        lang={lang}
        t={t}
      />

      <SeasonModal 
        showSeasonStandingsModal={showSeasonStandingsModal}
        setShowSeasonStandingsModal={setShowSeasonStandingsModal}
        activeYear={activeYear}
        seasonStandingsTab={seasonStandingsTab}
        setSeasonStandingsTab={setSeasonStandingsTab}
        seasonLoading={seasonLoading}
        seasonDrivers={seasonDrivers}
        seasonTeams={seasonTeams}
        t={t}
      />
    </div>
  );
}

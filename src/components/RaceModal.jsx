import React, { useState, useEffect } from 'react';
import { getSeriesConfig } from '../constants/seriesConfig';
import { translations } from '../constants/translations';
import { Sun, CloudRain, CloudSun, CloudSnow, CloudFog, CloudLightning, Globe, X, MapPin, Calendar, Clock, CalendarPlus, ExternalLink, Users, Shield } from 'lucide-react';
import { getSeasonResults } from '../services/queries'; 

const resultsCache = new Map();
const weatherCache = new Map();

const Speedometer = ({ size, className }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.34 16A10 10 0 1120.66 16" />
  </svg>
);

const Repeat = ({ size, className }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <polyline points="17 1 21 5 17 9" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
);

const Turns = ({ size, className }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <polyline points="15 14 20 9 15 4" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20v-7a4 4 0 014-4h12" />
  </svg>
);

const Apple = ({ size, className }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 1.44S9.22 5 7 5a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 2c1 .5 2 2 2 5" />
  </svg>
);

const getWeatherIcon = (code) => {
  if ([0, 1].includes(code)) return <Sun size={16} className="text-yellow-400" />;
  if ([2, 3].includes(code)) return <CloudSun size={16} className="text-zinc-300" />;
  if ([45, 48].includes(code)) return <CloudFog size={16} className="text-zinc-400" />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={16} className="text-blue-400" />;
  if ([71, 73, 75, 85, 86].includes(code)) return <CloudSnow size={16} className="text-blue-200" />;
  if ([95, 96, 99].includes(code)) return <CloudLightning size={16} className="text-yellow-500" />;
  return <CloudSun size={16} className="text-zinc-400" />;
};

const TrackInfoRow = ({ Icon, iconElement, label, value, unit }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      {iconElement || <Icon size={16} className="text-zinc-400" />}
      <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{label}</span>
    </div>
    <span className="text-sm text-white font-bold">
      {value} {unit && <span className="text-xs text-zinc-500 font-medium">{unit}</span>}
    </span>
  </div>
);

export default function RaceModal({ race, onClose, allRaces = [], lang = 'ru' }) {
  const [resultsTab, setResultsTab] = useState('stage'); 
  const [standingsType, setStandingsType] = useState('drivers'); 
  const [weather, setWeather] = useState(null);
  const [raceResults, setRaceResults] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const circuit = race ? (Array.isArray(race.circuits) ? race.circuits[0] : (race.circuits || {})) : {};
  const rDate = race?.parsedDate instanceof Date && !isNaN(race.parsedDate) ? race.parsedDate : new Date(race?.date);

  useEffect(() => {
    if (!race?.id) return;
    
    const diffDays = (rDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    if (diffDays < -1 || diffDays > 10) return; 

    let isMounted = true;
    const fetchWeather = async () => {
      try {
        let lat = circuit.lat || race.lat;
        let lng = circuit.lng || race.lng;
        
        const cacheKey = lat && lng ? `${lat},${lng}` : circuit.name || race.name;
        if (weatherCache.has(cacheKey)) {
          setWeather(weatherCache.get(cacheKey));
          return;
        }

        if (!lat || !lng) {
          const query = circuit.name || circuit.country || race.name;
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`);
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lng = geoData.results[0].longitude;
          }
        }

        if (lat && lng) {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
          const data = await res.json();
          if (data.daily) {
            const dateStr = rDate.toISOString().split('T')[0];
            const idx = data.daily.time?.indexOf(dateStr) !== -1 ? data.daily.time.indexOf(dateStr) : 0;
            if (idx !== undefined && isMounted) {
              const wData = {
                maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
                minTemp: Math.round(data.daily.temperature_2m_min[idx]),
                code: data.daily.weathercode[idx]
              };
              weatherCache.set(cacheKey, wData);
              setWeather(wData);
            }
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки погоды:", err);
      }
    };
    fetchWeather();
    return () => { isMounted = false; };
  }, [race?.id]);

  useEffect(() => {
    if (!race?.id) return;
    
    const isPast = rDate < new Date();
    const isF1 = (race.series_id === 1 || String(race.series?.code || race.series).toLowerCase() === 'f1');
    
    if (!isPast || !isF1) {
      setRaceResults(null);
      return;
    }

    const seasonRacesIds = allRaces
      .filter(r => (Number(r.season) === Number(race.season)) && (new Date(r.date || r.parsedDate) <= rDate))
      .map(r => r.id);
    
    if (seasonRacesIds.length === 0) seasonRacesIds.push(race.id);

    const cacheKey = `standings_v2_${race.id}`;
    if (resultsCache.has(cacheKey)) {
      setRaceResults(resultsCache.get(cacheKey));
      return;
    }

    let isMounted = true;
    const loadResults = async () => {
      try {
        const { drivers, teams } = await getSeasonResults(seasonRacesIds);
        
        const stageDrivers = drivers.filter(d => d.race_id === race.id).sort((a, b) => a.position - b.position);
        const stageTeams = teams.filter(t => t.race_id === race.id).sort((a, b) => a.position - b.position);

        const afterDriversMap = {};
        drivers.forEach(d => {
            if (!afterDriversMap[d.driver_name]) afterDriversMap[d.driver_name] = { points: 0, pointsDiff: 0, team_name: d.team_name, driver_name: d.driver_name };
            afterDriversMap[d.driver_name].points += Number(d.points || 0);
            if (d.race_id === race.id) afterDriversMap[d.driver_name].pointsDiff = Number(d.points || 0);
        });
        const afterDrivers = Object.values(afterDriversMap).sort((a, b) => b.points - a.points).map((d, i) => ({ ...d, position: i + 1 }));

        const afterTeamsMap = {};
        teams.forEach(t => {
            if (!afterTeamsMap[t.team_name]) afterTeamsMap[t.team_name] = { points: 0, pointsDiff: 0, team_name: t.team_name };
            afterTeamsMap[t.team_name].points += Number(t.points || 0);
            if (t.race_id === race.id) afterTeamsMap[t.team_name].pointsDiff = Number(t.points || 0);
        });
        const afterTeams = Object.values(afterTeamsMap).sort((a, b) => b.points - a.points).map((t, i) => ({ ...t, position: i + 1 }));

        const res = {
          stage: { drivers: stageDrivers, teams: stageTeams },
          after: { drivers: afterDrivers, teams: afterTeams }
        };

        resultsCache.set(cacheKey, res);
        if (isMounted) setRaceResults(res);
      } catch (e) {
        console.error('Ошибка загрузки результатов:', e);
      }
    };
    
    loadResults();
    return () => { isMounted = false; };
  }, [race?.id, allRaces, rDate]);

  if (!race) return null;

  const t = translations?.[lang] || translations?.ru || {};
  const sCfg = getSeriesConfig(race.series_id || race.series);
  const bLabel = sCfg.shortLabel ? (sCfg.shortLabel[lang] || sCfg.shortLabel) : (sCfg.label?.[lang] || 'RACE');
  
  const formattedDate = rDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' });
  const moscowTime = rDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
  const localTime = race.local_time || rDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  const cName = circuit.country || race.country || race.location_country || '';
  const tName = circuit.name || race.circuit || race.location || '';
  const lapRecord = circuit.lap_record ? circuit.lap_record.replace(/\s*\(.*?\)/, '') : null;
  const lapsCount = circuit.laps || null;
  const lengthKm = circuit.length_km || null;
  const turnsCount = circuit.turns || null;
  
  // ИСПРАВЛЕНИЕ ДАННЫХ: В БД колонка называется wiki_url, а не wikipedia_url
  const wikiUrl = race.wiki_url || circuit.wiki_url || null;

  const showResults = raceResults && raceResults.stage && (raceResults.stage.drivers?.length > 0 || raceResults.stage.teams?.length > 0);

  const handleGoogleCalendar = () => {
    const start = rDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endRace = new Date(rDate.getTime() + 2 * 60 * 60 * 1000);
    const end = endRace.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(`${bLabel} - ${race.name}`);
    const loc = encodeURIComponent(`${cName}, ${tName}`);
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`, '_blank');
  };

  const handleAppleCalendar = () => {
    const start = rDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endRace = new Date(rDate.getTime() + 2 * 60 * 60 * 1000);
    const end = endRace.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = `${bLabel} - ${race.name}`;
    const loc = `${cName}, ${tName}`;
    const icsData = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Motorsport Tracker//RU',
      'BEGIN:VEVENT', `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${title}`, `LOCATION:${loc}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\n');
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    setIsExpanded(false);
  }, [resultsTab, standingsType]);

  const renderResultsList = (list, isAfter) => {
    if (!list || list.length === 0) return <div className="text-zinc-500 text-xs py-4 text-center">{lang === 'ru' ? 'Нет данных' : 'No data'}</div>;
    const displayList = isExpanded ? list : list.slice(0, 3);

    return (
      <div className="flex flex-col mt-1">
        {displayList.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-zinc-500 w-4 text-center">{item.position}</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-tight">{item.driver_name || item.team_name}</span>
                {item.driver_name && <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{item.team_name}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAfter && item.pointsDiff > 0 && (
                <span className="text-[11px] font-black text-emerald-400">+{item.pointsDiff}</span>
              )}
              <span className="text-sm font-black text-white w-6 text-right">{item.points}</span>
            </div>
          </div>
        ))}
        {list.length > 3 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors w-full text-center py-2.5 bg-white/5 hover:bg-white/10 rounded-xl"
          >
            {isExpanded ? (lang === 'ru' ? 'Свернуть' : 'Collapse') : (lang === 'ru' ? 'Развернуть весь список' : 'Show full list')}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto transition-opacity" onClick={onClose} />
      <div className="bg-surface-modal border border-white/10 w-full max-w-lg rounded-3xl p-6 sm:p-8 relative pointer-events-auto shadow-[0_25px_70px_rgba(0,0,0,0.7)] flex flex-col gap-6 backdrop-blur-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-start gap-3 pr-8">
          <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${sCfg.badgeClass}`}>{bLabel}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">{race.name}</h2>
          <div className="flex items-center gap-2 text-zinc-400 text-sm sm:text-base">
            <MapPin size={16} className="text-zinc-500 shrink-0" />
            <span>{cName}{cName && tName ? ', ' : ''}{tName || 'TBA'}</span>
          </div>
        </div>

        {/* ИСПРАВЛЕНИЕ ВЕРСТКИ: Жесткий Grid и min-w-0 чтобы блоки не сужались */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-surface-field border border-white/10 rounded-2xl p-4 sm:p-5 shadow-inner">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.6)]">
              <Calendar size={20} className="text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1.5">{lang === 'ru' ? 'Дата' : 'Date'}</span>
              <span className="text-white font-bold capitalize truncate text-sm sm:text-base">{formattedDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 bg-amber-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(217,119,6,0.6)]">
              <Clock size={20} className="text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1.5">{lang === 'ru' ? 'Время старта' : 'Start Time'}</span>
              <div className="flex items-center gap-3 mt-0.5">
                <div className="flex items-center gap-1.5" title={lang === 'ru' ? 'Местное время' : 'Local time'}>
                  <MapPin size={13} className="text-zinc-500 shrink-0" />
                  <span className="text-white font-bold text-sm sm:text-base">{localTime}</span>
                </div>
                <div className="flex items-center gap-1.5" title={lang === 'ru' ? 'Московское время' : 'Moscow time'}>
                  <Globe size={13} className="text-zinc-500 shrink-0" />
                  <span className="text-white font-bold text-sm sm:text-base">{moscowTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full -mt-2">
          <button onClick={handleGoogleCalendar} className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95">
            <CalendarPlus size={15} className="text-indigo-400 shrink-0" />
            <span className="truncate">Google</span>
          </button>
          <button onClick={handleAppleCalendar} className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95">
            <Apple size={15} className="text-zinc-400 shrink-0" />
            <span className="truncate">Apple</span>
          </button>
          {wikiUrl ? (
            <a href={wikiUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer">
              <ExternalLink size={15} className="text-zinc-400 shrink-0" />
              <span className="truncate">Вики</span>
            </a>
          ) : (
            <div className="flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-600 cursor-not-allowed">
              <ExternalLink size={15} className="text-zinc-600 shrink-0" />
              <span className="truncate">Вики</span>
            </div>
          )}
        </div>

        {showResults && (
          <div className="flex flex-col gap-2 mt-2">
            {/* ИСПРАВЛЕНИЕ КНОПОК: Единая строка, равная высота (h-8), фиолетовый акцент без рамок */}
            <div className="flex flex-wrap items-center justify-between gap-2 w-full pb-1">
              <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                <button 
                  onClick={() => setResultsTab('stage')} 
                  className={`h-8 px-2.5 sm:px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap ${resultsTab === 'stage' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-zinc-400 hover:text-white'}`}
                >
                  {t.stageResults || 'Итоги этапа'}
                </button>
                {raceResults.after && (
                  <button 
                    onClick={() => setResultsTab('after')} 
                    className={`h-8 px-2.5 sm:px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap ${resultsTab === 'after' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Общий зачёт
                  </button>
                )}
              </div>
              <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                <button 
                  onClick={() => setStandingsType('drivers')} 
                  className={`h-8 px-2.5 sm:px-3 rounded-lg text-[11px] font-bold tracking-wider transition-all flex items-center justify-center whitespace-nowrap ${standingsType === 'drivers' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-zinc-400 hover:text-white'}`}
                >
                  По пилотам
                </button>
                <button 
                  onClick={() => setStandingsType('teams')} 
                  className={`h-8 px-2.5 sm:px-3 rounded-lg text-[11px] font-bold tracking-wider transition-all flex items-center justify-center whitespace-nowrap ${standingsType === 'teams' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-zinc-400 hover:text-white'}`}
                >
                  По командам
                </button>
              </div>
            </div>
            {renderResultsList(raceResults[resultsTab]?.[standingsType], resultsTab === 'after')}
          </div>
        )}

        {!isExpanded && (
          <div className="flex flex-col gap-3 mt-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">{t.trackInfo || 'Информация о трассе'}</h3>
            <div className="flex flex-col gap-3 px-1">
              <TrackInfoRow Icon={Speedometer} label={t.lapRecord || 'Рекорд'} value={lapRecord || '—'} />
              <TrackInfoRow Icon={Repeat} label={lapsCount ? (t.laps || 'Круги') : (t.trackLength || 'Длина')} value={lapsCount ? lapsCount : lengthKm ? lengthKm : '?'} unit={lapsCount ? (t.lapsShort || 'круг.') : lengthKm ? 'км' : ''} />
              <TrackInfoRow Icon={Turns} label={t.turns || 'Повороты'} value={turnsCount || '?'} unit={t.turnsShort || 'пов.'} />
              {weather && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {getWeatherIcon(weather.code)}
                    <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{t.weather || 'Прогноз'}</span>
                  </div>
                  <span className="text-sm text-white font-bold">{weather.maxTemp}°C <span className="text-xs text-zinc-500 font-medium">/ {weather.minTemp}°C</span></span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { getSeriesConfig } from '../constants/seriesConfig';
import { translations } from '../constants/translations';
import { Sun, CloudRain, CloudSun, CloudSnow, CloudFog, CloudLightning, Globe, X, MapPin, Calendar, Clock, CalendarPlus, ExternalLink, Users, Shield } from 'lucide-react';

import { getDriverResults, getTeamResults } from '../services/queries'; 

// Локальные SVG-иконки (Оставлены только уникальные)
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

// DRY: Вспомогательный компонент для строк информации о трассе
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

export default function RaceModal({ race, onClose, standingsData, lang = 'ru' }) {
  const [resultsTab, setResultsTab] = useState('stage'); // 'stage' | 'after'
  const [standingsType, setStandingsType] = useState('drivers'); // 'drivers' | 'teams'
  const [weather, setWeather] = useState(null);
  const [raceResults, setRaceResults] = useState(null);

  const circuit = race ? (Array.isArray(race.circuits) ? race.circuits[0] : (race.circuits || {})) : {};
  // Единое вычисление даты для всех блоков
  const rDate = race?.parsedDate instanceof Date && !isNaN(race.parsedDate) ? race.parsedDate : new Date(race?.date);

  // --- 1. ХУК: ЗАГРУЗКА ПОГОДЫ ---
  useEffect(() => {
    if (!race?.id) return;
    let isMounted = true;

    const fetchWeather = async () => {
      const diffDays = (rDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      
      if (diffDays >= -1 && diffDays <= 10) {
        try {
          let lat = circuit.lat || race.lat;
          let lng = circuit.lng || race.lng;
          
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
                setWeather({
                  maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
                  minTemp: Math.round(data.daily.temperature_2m_min[idx]),
                  code: data.daily.weathercode[idx]
                });
              }
            }
          }
        } catch (err) {
          console.error("Ошибка загрузки погоды:", err);
        }
      }
    };
    
    fetchWeather();
    return () => { isMounted = false; };
  }, [race?.id, circuit.lat, circuit.lng]);

  // --- 2. ХУК: ЗАГРУЗКА РЕЗУЛЬТАТОВ ---
  useEffect(() => {
    if (!race?.id) return;
    let isMounted = true;
    
    const isPast = rDate < new Date();
    const isF1 = (race.series_id === 1 || String(race.series?.code || race.series).toLowerCase() === 'f1');
    
    if (isPast && isF1) {
      const loadResults = async () => {
        try {
          const [driversData, teamsData] = await Promise.all([
            getDriverResults(race.id),
            getTeamResults(race.id)
          ]);
          
          if (isMounted) {
            setRaceResults({
              stage: {
                drivers: driversData || [],
                teams: teamsData || []
              }
            });
          }
        } catch (e) {
          console.error('Ошибка загрузки результатов:', e);
        }
      };
      
      loadResults();
    } else {
      setRaceResults(null);
    }

    return () => { isMounted = false; };
  }, [race?.id]);

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
  const wikiUrl = race.wikipedia_url || circuit.wikipedia_url || null;

  const finalResults = (standingsData && standingsData.stage) ? standingsData : raceResults;
  const showResults = finalResults && finalResults.stage && (finalResults.stage.drivers?.length > 0 || finalResults.stage.teams?.length > 0);

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

  const renderResultsList = (list, isAfter) => {
    if (!list || list.length === 0) return <div className="text-zinc-500 text-xs py-4 text-center">{lang === 'ru' ? 'Нет данных' : 'No data'}</div>;
    return (
      <div className="flex flex-col gap-1.5 mt-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-zinc-500 w-4 text-center">{item.position}</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{item.driver_name || item.team_name}</span>
                {item.driver_name && <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{item.team_name}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAfter && item.pointsDiff > 0 && (
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-md">+{item.pointsDiff}</span>
              )}
              <span className="text-sm font-black text-white w-8 text-right">{item.points}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-surface-modal border border-white/10 w-full max-w-lg rounded-3xl p-6 sm:p-8 relative pointer-events-auto shadow-[0_25px_70px_rgba(0,0,0,0.7)] flex flex-col gap-6 backdrop-blur-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-start gap-3 pr-8">
          <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${sCfg.badgeClass}`}>
            {bLabel}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            {race.name}
          </h2>
          <div className="flex items-center gap-2 text-zinc-400 text-sm sm:text-base">
            <MapPin size={16} className="text-zinc-500 shrink-0" />
            <span>{cName}{cName && tName ? ', ' : ''}{tName || 'TBA'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-field border border-white/10 rounded-2xl p-5 shadow-inner">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.6)]">
              <Calendar size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">{lang === 'ru' ? 'Дата' : 'Date'}</span>
              <span className="text-white font-bold capitalize leading-tight text-sm sm:text-base">{formattedDate}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-600 text-white rounded-xl shrink-0 shadow-[0_0_15px_rgba(217,119,6,0.6)]">
              <Clock size={22} className="text-white" />
            </div>
            <div className="flex flex-col w-full">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">{lang === 'ru' ? 'Время старта' : 'Start Time'}</span>
              <div className="flex items-center gap-4 mt-0.5">
                <div className="flex items-center gap-1.5" title={lang === 'ru' ? 'Местное время' : 'Local time'}>
                  <MapPin size={14} className="text-zinc-500" />
                  <span className="text-white font-bold text-sm sm:text-base">{localTime}</span>
                </div>
                <div className="flex items-center gap-1.5" title={lang === 'ru' ? 'Московское время' : 'Moscow time'}>
                  <Globe size={14} className="text-zinc-500" />
                  <span className="text-white font-bold text-sm sm:text-base">{moscowTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full -mt-2">
          <button 
            onClick={handleGoogleCalendar}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <CalendarPlus size={15} className="text-indigo-400 shrink-0" />
            <span className="truncate">Google</span>
          </button>
          <button 
            onClick={handleAppleCalendar}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <Apple size={15} className="text-zinc-400 shrink-0" />
            <span className="truncate">Apple</span>
          </button>
          {wikiUrl ? (
            <a 
              href={wikiUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
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

        {/* --- Блок Результатов --- */}
        {showResults && (
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button 
                  onClick={() => setResultsTab('stage')} 
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${resultsTab === 'stage' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {t.stageResults || 'Итоги этапа'}
                </button>
                {finalResults.after && (
                  <button 
                    onClick={() => setResultsTab('after')} 
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${resultsTab === 'after' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {t.afterStage || 'Зачёт после этапа'}
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => setStandingsType('drivers')} className={`p-1.5 rounded-lg border transition-colors ${standingsType === 'drivers' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                  <Users size={16} />
                </button>
                <button onClick={() => setStandingsType('teams')} className={`p-1.5 rounded-lg border transition-colors ${standingsType === 'teams' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                  <Shield size={16} />
                </button>
              </div>
            </div>
            {renderResultsList(finalResults[resultsTab]?.[standingsType], resultsTab === 'after')}
          </div>
        )}

        {/* --- Инфо о трассе --- */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
            {t.trackInfo || 'Информация о трассе'}
          </h3>
          
          <div className="flex flex-col gap-3 px-1">
            <TrackInfoRow 
              Icon={Speedometer} 
              label={t.lapRecord || 'Рекорд'} 
              value={lapRecord || '—'} 
            />

            <TrackInfoRow 
              Icon={Repeat} 
              label={lapsCount ? (t.laps || 'Круги') : (t.trackLength || 'Длина')} 
              value={lapsCount ? lapsCount : lengthKm ? lengthKm : '?'} 
              unit={lapsCount ? (t.lapsShort || 'круг.') : lengthKm ? 'км' : ''} 
            />

            <TrackInfoRow 
              Icon={Turns} 
              label={t.turns || 'Повороты'} 
              value={turnsCount || '?'} 
              unit={t.turnsShort || 'пов.'} 
            />
            
            {/* Погода */}
            {weather && (
              <TrackInfoRow 
                iconElement={getWeatherIcon(weather.code)}
                label={lang === 'ru' ? 'Прогноз' : 'Weather'} 
                value={`${weather.maxTemp}°C`} 
                unit={`/ ${weather.minTemp}°C`} 
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

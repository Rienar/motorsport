import React, { useState } from 'react';
import { getSeriesConfig } from '../constants/seriesConfig';
import { translations } from '../constants/translations';
import { Sun, CloudRain, CloudSun, CloudSnow, CloudFog, CloudLightning, Globe } from 'lucide-react';

// Локальные SVG-иконки для дизайна
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

const XIcon = ({ size }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MapPinIcon = ({ size, className }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = ({ size, className }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = ({ size, className }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarPlusIcon = ({ size, className }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="14" x2="12" y2="18" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="16" x2="14" y2="16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExternalLinkIcon = ({ size, className }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3" />
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

export default function RaceModal({ race, onClose, standingsData, lang = 'ru' }) {
  const [activeTab, setActiveTab] = useState('race');
  const [weather, setWeather] = useState(null);

  React.useEffect(() => {
    if (!race) return;
    const rDate = race.parsedDate instanceof Date && !isNaN(race.parsedDate) ? race.parsedDate : new Date(race.date);
    const now = new Date();
    const diffDays = (rDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
    
    // Загружаем погоду только если гонка предстоит в ближайшие 7-10 дней
    if (diffDays >= -1 && diffDays <= 10 && race.circuits?.lat && race.circuits?.lng) {
      const { lat, lng } = race.circuits;
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`)
        .then(res => res.json())
        .then(data => {
          if (!data.daily) return;
          const dateStr = rDate.toISOString().split('T')[0];
          const idx = data.daily.time?.indexOf(dateStr) !== -1 ? data.daily.time.indexOf(dateStr) : 0;
          if (idx !== undefined) {
            setWeather({
              maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
              minTemp: Math.round(data.daily.temperature_2m_min[idx]),
              code: data.daily.weathercode[idx]
            });
          }
        })
        .catch(err => console.error("Ошибка загрузки погоды:", err));
    }
  }, [race]);

  if (!race) return null;

  const t = translations?.[lang] || translations?.ru || {};
  const sCfg = getSeriesConfig(race.series_id || race.series);
  const bLabel = sCfg.shortLabel ? (sCfg.shortLabel[lang] || sCfg.shortLabel) : (sCfg.label?.[lang] || 'RACE');
  
  const rDate = race.parsedDate instanceof Date && !isNaN(race.parsedDate) ? race.parsedDate : new Date(race.date);
  const formattedDate = rDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric', month: 'long'
  });
  const moscowTime = rDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
  const localTime = race.local_time || rDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  const cName = race.circuits?.country || race.country || race.location_country || '';
  const tName = race.circuits?.name || race.circuit || race.location || '';
  const lapRecord = race.circuits?.lap_record ? race.circuits.lap_record.replace(/\s*\(.*?\)/, '') : null;
  const lapsCount = race.circuits?.laps || null;
  const turnsCount = race.circuits?.turns || null;
  const wikiUrl = race.circuits?.wikipedia_url || null;

  const handleGoogleCalendar = () => {
    const start = rDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endRace = new Date(rDate.getTime() + 2 * 60 * 60 * 1000);
    const end = endRace.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(`${bLabel} - ${race.name}`);
    const loc = encodeURIComponent(`${cName}, ${tName}`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`;
    window.open(url, '_blank');
  };

  const handleAppleCalendar = () => {
    const start = rDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endRace = new Date(rDate.getTime() + 2 * 60 * 60 * 1000);
    const end = endRace.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = `${bLabel} - ${race.name}`;
    const loc = `${cName}, ${tName}`;

    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Motorsport Tracker//RU',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `LOCATION:${loc}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-surface-modal border border-white/10 w-full max-w-lg rounded-3xl p-6 sm:p-8 relative pointer-events-auto shadow-[0_25px_70px_rgba(0,0,0,0.7)] flex flex-col gap-6 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <XIcon size={20} />
        </button>

        <div className="flex flex-col items-start gap-3 pr-8">
          <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${sCfg.badgeClass}`}>
            {bLabel}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            {race.name}
          </h2>
          <div className="flex items-center gap-2 text-zinc-400 text-sm sm:text-base">
            <MapPinIcon size={16} className="text-zinc-500 shrink-0" />
            <span>{cName}{cName && tName ? ', ' : ''}{tName || 'TBA'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-field border border-white/10 rounded-2xl p-5 shadow-inner">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.6)]">
              <CalendarIcon size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">{lang === 'ru' ? 'Дата' : 'Date'}</span>
              <span className="text-white font-bold capitalize leading-tight text-sm sm:text-base">{formattedDate}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-600 text-white rounded-xl shrink-0 shadow-[0_0_15px_rgba(217,119,6,0.6)]">
              <ClockIcon size={22} className="text-white" />
            </div>
            <div className="flex flex-col w-full">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">{lang === 'ru' ? 'Время старта' : 'Start Time'}</span>
              <div className="flex items-center gap-4 mt-0.5">
                <div className="flex items-center gap-1.5" title={lang === 'ru' ? 'Местное время' : 'Local time'}>
                  <MapPinIcon size={14} className="text-zinc-500" />
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
            <CalendarPlusIcon size={15} className="text-indigo-400 shrink-0" />
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
              <ExternalLinkIcon size={15} className="text-zinc-400 shrink-0" />
              <span className="truncate">Вики</span>
            </a>
          ) : (
            <div className="flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-600 cursor-not-allowed">
              <ExternalLinkIcon size={15} className="text-zinc-600 shrink-0" />
              <span className="truncate">Вики</span>
            </div>
          )}
        </div>

        {/* Инфо о трассе */}
        {race.circuits && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
              {t.trackInfo || 'Информация о трассе'}
            </h3>
            
            <div className="flex flex-col gap-3 px-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Speedometer size={16} className="text-zinc-400" />
                  <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{t.lapRecord || 'Рекорд'}</span>
                </div>
                <span className="text-sm text-white font-bold">{lapRecord || '—'}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Repeat size={16} className="text-zinc-400" />
                  <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{t.laps || 'Круги'}</span>
                </div>
                <span className="text-sm text-white font-bold">{lapsCount || '?'} <span className="text-xs text-zinc-500 font-medium">{t.lapsShort || 'круг.'}</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Turns size={16} className="text-zinc-400" />
                  <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{t.turns || 'Повороты'}</span>
                </div>
                <span className="text-sm text-white font-bold">{turnsCount || '?'} <span className="text-xs text-zinc-500 font-medium">{t.turnsShort || 'пов.'}</span></span>
              </div>
              
              {/* Погода перенесена в блок трассы */}
              {weather && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {getWeatherIcon(weather.code)}
                    <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold tracking-wider mt-0.5">
                       {lang === 'ru' ? 'Прогноз' : 'Weather'}
                    </span>
                  </div>
                  <span className="text-sm text-white font-bold">
                    {weather.maxTemp}°C <span className="text-xs text-zinc-500 font-medium">/ {weather.minTemp}°C</span>
                  </span>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

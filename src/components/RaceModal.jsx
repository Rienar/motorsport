import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, ExternalLink, CalendarPlus } from 'lucide-react';
import { getSeriesConfig } from '../constants/seriesConfig';
import { translations } from '../constants/translations';

// Локальные SVG-иконки для дизайна
const Speedometer = ({ size, className }) => (
);
const Repeat = ({ size, className }) => (
);
const Turns = ({ size, className }) => (
);
const Apple = ({ size, className }) => (
);
export default function RaceModal({ race, onClose, standingsData, lang = 'ru' }) {
const [activeTab, setActiveTab] = useState('race');
const [activeSubTab, setActiveSubTab] = useState('drivers');

if (!race) return null;

const t = translations[lang] || translations.ru;
const sCfg = getSeriesConfig(race.series_id || race.series);
const raceDate = race.parsedDate instanceof Date && !isNaN(race.parsedDate) ? race.parsedDate : new Date(race.date);

const formattedDate = raceDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
day: 'numeric', month: 'short', year: 'numeric'
});

const trackLocalTime = race.local_time || raceDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' });
const moscowTime = raceDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });

const countryName = race.circuits?.country || race.country || race.location_country || '';
const circuitName = race.circuits?.name || race.circuit || race.location || '';
const fullLocation = [countryName, circuitName].filter(Boolean).join(', ');

const handleGoogleCalendar = () => {
const start = raceDate.toISOString().replace(/-|:|.\d\d\d/g, '');
const endRace = new Date(raceDate.getTime() + 2 * 60 * 60 * 1000);
const end = endRace.toISOString().replace(/-|:|.\d\d\d/g, '');
const title = encodeURIComponent(${sCfg.shortLabel?.[lang] || sCfg.label?.[lang] || 'Race'} - ${race.name});
const loc = encodeURIComponent(fullLocation);
const url = https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc};
window.open(url, '_blank');
};

const handleAppleCalendar = () => {
const start = raceDate.toISOString().replace(/-|:|.\d\d\d/g, '');
const endRace = new Date(raceDate.getTime() + 2 * 60 * 60 * 1000);
const end = endRace.toISOString().replace(/-|:|.\d\d\d/g, '');
const title = ${sCfg.shortLabel?.[lang] || sCfg.label?.[lang] || 'Race'} - ${race.name};

const icsData = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Motorsport Tracker//RU',
  'BEGIN:VEVENT',
  `DTSTART:${start}`,
  `DTEND:${end}`,
  `SUMMARY:${title}`,
  `LOCATION:${fullLocation}`,
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

{/* Backdrop */}


  {/* Modal Container */}
  <div className="bg-[#121216]/95 border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto hide-scrollbar rounded-3xl p-6 sm:p-8 relative pointer-events-auto shadow-[0_25px_70px_rgba(0,0,0,0.7)] flex flex-col gap-6 backdrop-blur-2xl">
    
    <button 
      onClick={onClose} 
      className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors z-10"
    >
      <X size={20} />
    </button>

    {/* Header */}
    <div className="flex flex-col items-start gap-3 pr-8">
      <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${sCfg.badgeClass}`}>
        {sCfg.label?.[lang] || sCfg.label || race.series}
      </span>
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
        {race.name}
      </h2>
      <div className="flex items-center gap-2 text-zinc-400 text-sm sm:text-base">
        <MapPin size={16} className="text-zinc-500 shrink-0" />
        <span>{fullLocation || 'TBA'}</span>
      </div>
    </div>

    {/* Date & Time */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#181820] border border-white/10 rounded-2xl p-5 shadow-inner">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-indigo-500 text-white rounded-xl shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.5)]">
          <Calendar size={22} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Дата</span>
          <span className="text-white font-bold capitalize leading-tight text-sm sm:text-base">{formattedDate}</span>
        </div>
      </div>
      
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.5)]">
          <Clock size={22} className="text-white" />
        </div>
        <div className="flex flex-col w-full">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Время старта</span>
          <div className="flex items-center w-full">
            <span className="text-zinc-500 w-16 shrink-0 font-semibold text-xs">Местное:</span>
            <span className="text-white font-bold text-sm sm:text-base">{trackLocalTime}</span>
          </div>
          <div className="flex items-center w-full mt-0.5">
            <span className="text-zinc-500 w-16 shrink-0 font-semibold text-xs">МСК:</span>
            <span className="text-white font-bold text-sm sm:text-base">{moscowTime}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Actions Grid */}
    <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full -mt-2">
      <button 
        onClick={handleGoogleCalendar}
        className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
      >
        <CalendarPlus size={15} className="text-indigo-400 shrink-0" />
        <span className="truncate">{t.addToGoogle || 'Google'}</span>
      </button>
      <button 
        onClick={handleAppleCalendar}
        className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
      >
        <Apple size={15} className="text-zinc-400 shrink-0" />
        <span className="truncate">{t.downloadApple || 'Apple'}</span>
      </button>
      {race.circuits?.wikipedia_url ? (
        <a 
          href={race.circuits.wikipedia_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
        >
          <ExternalLink size={15} className="text-zinc-400 shrink-0" />
          <span className="truncate">{t.wiki || 'Вики'}</span>
        </a>
      ) : (
        <div className="flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-600 cursor-not-allowed">
          <ExternalLink size={15} className="text-zinc-600 shrink-0" />
          <span className="truncate">{t.wiki || 'Вики'}</span>
        </div>
      )}
    </div>

    {/* Track Info */}
    {race.circuits && (
      <div className="flex flex-col gap-4 mt-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">{t.trackInfo || 'Информация о трассе'}</h3>
        
        <div className="flex flex-col gap-3 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Speedometer size={16} className="text-zinc-400" />
              <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{t.lapRecord || 'Рекорд'}</span>
            </div>
            <span className="text-sm text-white font-bold">{race.circuits.lap_record ? race.circuits.lap_record.replace(/\s*\(.*?\)/, '') : '—'}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Repeat size={16} className="text-zinc-400" />
              <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{t.laps || 'Круги'}</span>
            </div>
            <span className="text-sm text-white font-bold">{race.circuits.laps || '?'} <span className="text-xs text-zinc-500 font-medium">{t.lapsShort || 'круг.'}</span></span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Turns size={16} className="text-zinc-400" />
              <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{t.turns || 'Повороты'}</span>
            </div>
            <span className="text-sm text-white font-bold">{race.circuits.turns || '?'} <span className="text-xs text-zinc-500 font-medium">{t.turnsShort || 'пов.'}</span></span>
          </div>
        </div>
      </div>
    )}

    {/* Standings Integration Placeholder */}
    {standingsData && (
      <div className="mt-2 pt-4 border-t border-white/10 flex flex-col gap-4">
        <div className="flex items-center gap-2 bg-[#181820] p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('race')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'race' ? 'bg-[#2a2a35] text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            {t.tabRace || 'Этап'}
          </button>
          <button 
            onClick={() => setActiveTab('after')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'after' ? 'bg-[#2a2a35] text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            {t.tabAfterRace || 'После этапа'}
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-[#181820] p-1 rounded-xl">
          <button 
            onClick={() => setActiveSubTab('drivers')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeSubTab === 'drivers' ? 'bg-[#2a2a35] text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            {t.drivers || 'Пилоты'}
          </button>
          <button 
            onClick={() => setActiveSubTab('teams')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeSubTab === 'teams' ? 'bg-[#2a2a35] text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            {t.teams || 'Команды'}
          </button>
        </div>

        <div className="text-center text-sm text-zinc-500 py-6 bg-white/5 rounded-xl border border-white/5">
          {/* Here integrates original standings rendering logic */}
          {t.resultsNotReady || 'Результаты еще не добавлены'}
        </div>
      </div>
    )}

  </div>
</div>


);
}

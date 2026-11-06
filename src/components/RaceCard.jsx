import React from 'react';
import { Calendar, Clock, MapPin, Radio } from 'lucide-react';
import { getSeriesConfig } from '../constants/seriesConfig';

export default function RaceCard({ race, onClick, isNext = false, isLiveNow = false, lang = 'ru' }) {
if (!race) return null;

const sCfg = getSeriesConfig(race.series_id || race.series);
const seriesBadgeLabel = sCfg.shortLabel ? (sCfg.shortLabel[lang] || sCfg.shortLabel) : (sCfg.label?.[lang] || 'RACE');
const raceDate = race.parsedDate instanceof Date && !isNaN(race.parsedDate) ? race.parsedDate : new Date(race.date);

const formattedDate = raceDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
day: 'numeric', month: 'short', weekday: 'short'
});

const trackLocalTime = race.local_time || raceDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' });
const moscowTime = raceDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });

const countryName = race.circuits?.country || race.country || race.location_country || '';
const circuitName = race.circuits?.name || race.circuit || race.location || '';

return (
<div
onClick={onClick}
className={relative group bg-[#0c0c10] border rounded-2xl p-4 sm:p-5 flex flex-row items-start justify-between gap-4 transition-all duration-300 shadow-lg cursor-pointer ${ isLiveNow  ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]'  : isNext  ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]'  : 'border-white/5 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]' }}
>
{isLiveNow ? (

 LIVE

) : isNext && (

{lang === 'ru' ? 'Скоро' : 'Soon'}

)}

  {/* Левая часть */}
  <div className="flex flex-col items-start gap-2.5 flex-1 min-w-0">
    <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider ${sCfg.badgeClass}`} title={race.name}>
      {seriesBadgeLabel}
    </span>
    
    <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-1 truncate w-full" title={race.name}>{race.name || 'Race'}</h3>
    
    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 truncate w-full">
      <MapPin size={14} className="text-zinc-500 shrink-0" />
      <span className="truncate">{countryName}{countryName && circuitName ? ', ' : ''}{circuitName || 'TBA'}</span>
    </div>
  </div>

  {/* Правая часть */}
  <div className="flex flex-col items-end gap-3 shrink-0">
    <div className="flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-xl px-3 py-1.5 text-white text-[11px] shadow-sm font-semibold">
      <Calendar size={13} className="text-zinc-400" />
      <span>{formattedDate}</span>
    </div>

    <div className="flex flex-col gap-1 mt-auto">
      <div className="flex items-center justify-end gap-2 px-1">
        <Clock size={15} className="text-zinc-500 hidden sm:block" />
        <span className="text-zinc-500 text-xs sm:text-sm">{lang === 'ru' ? 'Местное:' : 'Local:'} <span className="text-white font-bold tracking-wide text-sm sm:text-base ml-1">{trackLocalTime}</span></span>
      </div>
      <div className="flex items-center justify-end gap-2 px-1">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 hidden sm:block"></span>
        <span className="text-zinc-500 text-xs sm:text-sm">{lang === 'ru' ? 'МСК:' : 'MSK:'} <span className="text-white font-bold tracking-wide text-sm sm:text-base ml-1">{moscowTime}</span></span>
      </div>
    </div>
  </div>
</div>


);
}

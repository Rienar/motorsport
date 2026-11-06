import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { getSeriesConfig } from '../constants/seriesConfig';

export default function RaceCard({ race, onClick, isNext = false, isLiveNow = false, lang = 'ru' }) {
  if (!race) return null;
  const sCfg = getSeriesConfig(race.series_id || race.series);
  const bLabel = sCfg.shortLabel ? (sCfg.shortLabel[lang] || sCfg.shortLabel) : (sCfg.label?.[lang] || 'RACE');
  const rDate = race.parsedDate instanceof Date && !isNaN(race.parsedDate) ? race.parsedDate : new Date(race.date);
  const fDate = rDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', weekday: 'short' });
  const tLocal = race.local_time || rDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const tMsk = rDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
  const cName = race.circuits?.country || race.country || race.location_country || '';
  const tName = race.circuits?.name || race.circuit || race.location || '';
  
  return (
    <div onClick={onClick} className={`relative group bg-surface-card border rounded-2xl p-4 sm:p-5 flex flex-row items-start justify-between gap-4 transition-all duration-300 shadow-lg cursor-pointer ${isLiveNow ? 'border-red-500/50 shadow-glow-red' : isNext ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-white/5 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}>
      {isNext && !isLiveNow && <div className="absolute top-0 right-1/2 translate-x-1/2 bg-blue-500 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-b-lg shadow-[0_0_10px_rgba(59,130,246,0.6)] z-10">{lang === 'ru' ? 'Скоро' : 'Soon'}</div>}
      {isLiveNow && <div className="absolute top-0 right-1/2 translate-x-1/2 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-b-lg shadow-glow-red z-10 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />{lang === 'ru' ? 'Лайв' : 'LIVE'}</div>}
      <div className="flex flex-col items-start gap-2.5 flex-1 min-w-0">
        <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider ${isLiveNow ? 'bg-red-600 text-white shadow-glow-red' : sCfg.badgeClass}`}>{bLabel}</span>
        <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-1 truncate w-full">{race.name || 'Race'}</h3>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 truncate w-full">
          <MapPin size={14} className="text-zinc-500 shrink-0" />
          <span className="truncate">{cName}{cName && tName ? ', ' : ''}{tName || 'TBA'}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3 shrink-0">
        <div className="flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-xl px-3 py-1.5 text-white text-[11px] shadow-sm font-semibold">
          <Calendar size={13} className="text-zinc-400" /><span>{fDate}</span>
        </div>
        <div className="flex flex-col gap-1 mt-auto">
          <div className="flex items-center justify-end gap-2 px-1">
            <Clock size={15} className="text-zinc-500 hidden sm:block" />
            <span className="text-zinc-500 text-xs sm:text-sm">{lang === 'ru' ? 'Местное:' : 'Local:'} <span className="text-white font-bold tracking-wide text-sm sm:text-base ml-1">{tLocal}</span></span>
          </div>
          <div className="flex items-center justify-end gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 hidden sm:block" />
            <span className="text-zinc-500 text-xs sm:text-sm">{lang === 'ru' ? 'МСК:' : 'MSK:'} <span className="text-white font-bold tracking-wide text-sm sm:text-base ml-1">{tMsk}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Calendar, Clock, MapPin, Globe } from 'lucide-react';
import { getSeriesConfig } from '../constants/seriesConfig';

export default function RaceCard({ race, onClick, isNext = false, isLiveNow = false, lang = 'ru' }) {
  if (!race) return null;

  const getSeriesCodeFromId = (seriesProp) => {
    if (!seriesProp) return 'all';
    if (typeof seriesProp === 'object') {
      return (seriesProp.code || seriesProp.short_name || '').toLowerCase();
    }
    const idMap = {
      1: 'f1',
      2: 'wec',
      3: 'dtm',
      4: 'super_gt',
      5: 'imsa'
    };
    if (idMap[Number(seriesProp)]) {
      return idMap[Number(seriesProp)];
    }
    return String(seriesProp).toLowerCase();
  };

  const seriesCodeKey = getSeriesCodeFromId(race.series_id ?? race.series);
  const sCfg = getSeriesConfig(seriesCodeKey);
  const bLabel = sCfg.shortLabel ? (sCfg.shortLabel[lang] || sCfg.shortLabel) : (sCfg.label?.[lang] || 'RACE');

  const circuit = Array.isArray(race.circuits) ? race.circuits[0] : (race.circuits || {});
  const circuitTz = circuit?.timezone || 'UTC';

  const rDate = race.parsedDate instanceof Date && !isNaN(race.parsedDate) ? race.parsedDate : new Date(race.date);
  const fDate = rDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', weekday: 'short' });
  const tLocal = race.local_time || rDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { timeZone: circuitTz, hour: '2-digit', minute: '2-digit' });
  const tMsk = rDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
  const cName = circuit?.country || race.country || race.location_country || '';
  const tName = circuit?.name || race.circuit || race.location || '';

  // Динамические цвета для плашки "Скоро" и обводки в зависимости от серии
  let seriesBorderColor = 'border-blue-500/50';
  let seriesShadow = 'shadow-[0_0_20px_rgba(59,130,246,0.3)]';
  let badgeBg = 'bg-blue-500';
  let badgeShadow = 'shadow-[0_0_10px_rgba(59,130,246,0.6)]';

  if (seriesCodeKey === 'f1') {
    seriesBorderColor = 'border-red-500/50';
    seriesShadow = 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
    badgeBg = 'bg-red-600';
    badgeShadow = 'shadow-[0_0_10px_rgba(239,68,68,0.6)]';
  } else if (seriesCodeKey === 'dtm') {
    seriesBorderColor = 'border-yellow-500/50';
    seriesShadow = 'shadow-[0_0_20px_rgba(234,179,8,0.3)]';
    badgeBg = 'bg-yellow-500 text-black';
    badgeShadow = 'shadow-[0_0_10px_rgba(234,179,8,0.6)]';
  } else if (seriesCodeKey === 'super_gt') {
    seriesBorderColor = 'border-emerald-500/50';
    seriesShadow = 'shadow-[0_0_20px_rgba(16,185,129,0.3)]';
    badgeBg = 'bg-emerald-500';
    badgeShadow = 'shadow-[0_0_10px_rgba(16,185,129,0.6)]';
  } else if (seriesCodeKey === 'wec') {
    seriesBorderColor = 'border-blue-500/50';
    seriesShadow = 'shadow-[0_0_20px_rgba(59,130,246,0.3)]';
    badgeBg = 'bg-blue-600';
    badgeShadow = 'shadow-[0_0_10px_rgba(59,130,246,0.6)]';
  }

  return (
    <div onClick={onClick} className={`relative group bg-surface-card border rounded-2xl p-4 sm:p-5 flex flex-col gap-2 transition-all duration-300 shadow-lg cursor-pointer ${isLiveNow ? 'border-red-500/50 shadow-glow-red' : isNext ? `${seriesBorderColor} ${seriesShadow}` : 'border-white/5 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]'}`}>
      
      {/* Плашка СКОРО с цветом серии */}
      {isNext && !isLiveNow && (
        <div className={`absolute top-0 right-1/2 translate-x-1/2 ${badgeBg} text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-b-lg ${badgeShadow} z-10`}>
          {lang === 'ru' ? 'Скоро' : 'Soon'}
        </div>
      )}

      {/* Плашка ЛАЙВ */}
      {isLiveNow && (
        <div className="absolute top-0 right-1/2 translate-x-1/2 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-b-lg shadow-glow-red z-10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          {lang === 'ru' ? 'Лайв' : 'LIVE'}
        </div>
      )}
      
      {/* 1. Строка: Бейдж серии */}
      <div className="flex items-start mb-1">
        <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider ${isLiveNow ? 'bg-red-600 text-white shadow-glow-red' : sCfg.badgeClass}`}>
          {bLabel}
        </span>
      </div>

      {/* 2. Строка: Название гонки (слева) и Дата (справа) */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate min-w-0">
          {race.name || 'Race'}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0 text-zinc-300">
          <Calendar size={14} className="text-zinc-500 shrink-0" />
          <span className="text-sm sm:text-base font-medium tracking-wide capitalize">
            {fDate}
          </span>
        </div>
      </div>

      {/* 3. Строка: Локация (слева) и Время (справа) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 truncate min-w-0">
          <MapPin size={14} className="text-zinc-500 shrink-0" />
          <span className="truncate">{cName}{cName && tName ? ', ' : ''}{tName || 'TBA'}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5" title={lang === 'ru' ? 'Местное время' : 'Local time'}>
            <MapPin size={13} className="text-zinc-500 shrink-0" />
            <span className="text-white font-bold tracking-wide text-sm sm:text-base">{tLocal}</span>
          </div>
          <div className="flex items-center gap-1.5" title={lang === 'ru' ? 'Московское время' : 'Moscow time'}>
            <Globe size={13} className="text-zinc-500 shrink-0" />
            <span className="text-white font-bold tracking-wide text-sm sm:text-base">{tMsk}</span>
          </div>
        </div>
      </div>

    </div>
  );
}

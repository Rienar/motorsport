import React, { useState, useEffect } from 'react';
import { getSeriesConfig } from '../constants/seriesConfig';

const StopwatchIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="M12 5V3" />
    <path d="M9 2h6" />
    <path d="M19 7l1.5-1.5" />
  </svg>
);

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

function LiveCountdownTimer({ nextRace, lang }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  let diff = nextRace ? nextRace.parsedDate.getTime() - now.getTime() : 0;
  const isLive = diff <= 0 && diff > -1000 * 60 * 180;

  if (isLive) {
    return (
      <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/40 px-3 py-1.5 rounded-xl text-red-400 text-xs font-black uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        {lang === 'ru' ? 'Лайв' : 'LIVE'}
      </div>
    );
  }

  if (diff < 0) diff = 0;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
  const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
  const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex flex-col items-center bg-white/5 rounded-xl px-3 py-2 min-w-[50px]">
        <span className="text-lg sm:text-xl font-black text-white font-mono leading-tight">{d}</span>
        <span className="text-[9px] font-bold text-amber-400/90 tracking-widest uppercase mt-0.5">{lang === 'ru' ? 'Дней' : 'Days'}</span>
      </div>
      <span className="text-zinc-600 font-bold text-lg">:</span>

      <div className="flex flex-col items-center bg-white/5 rounded-xl px-3 py-2 min-w-[50px]">
        <span className="text-lg sm:text-xl font-black text-white font-mono leading-tight">{h}</span>
        <span className="text-[9px] font-bold text-amber-400/90 tracking-widest uppercase mt-0.5">{lang === 'ru' ? 'Часов' : 'Hours'}</span>
      </div>
      <span className="text-zinc-600 font-bold text-lg">:</span>

      <div className="flex flex-col items-center bg-white/5 rounded-xl px-3 py-2 min-w-[50px]">
        <span className="text-lg sm:text-xl font-black text-white font-mono leading-tight">{m}</span>
        <span className="text-[9px] font-bold text-amber-400/90 tracking-widest uppercase mt-0.5">{lang === 'ru' ? 'Мин' : 'Mins'}</span>
      </div>
      <span className="text-zinc-600 font-bold text-lg">:</span>

      <div className="flex flex-col items-center bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 min-w-[50px] shadow-[0_0_12px_rgba(245,158,11,0.15)]">
        <span className="text-lg sm:text-xl font-black text-amber-400 font-mono leading-tight">{s}</span>
        <span className="text-[9px] font-bold text-amber-400 tracking-widest uppercase mt-0.5">{lang === 'ru' ? 'Сек' : 'Secs'}</span>
      </div>
    </div>
  );
}

export const SeasonTracker = ({ activeSeries = 'ALL', races = [], lang = 'ru', nextRace, activeYear }) => {
  const isAll = (activeSeries || 'ALL').toUpperCase() === 'ALL';
  const sCfg = getSeriesConfig(activeSeries);

  const seriesRaces = races.filter(r => {
    const sCode = (typeof r.series === 'object' ? r.series?.code || r.series?.short_name : r.series)?.toLowerCase() || '';
    const yr = Number(r.season) || (r.parsedDate instanceof Date ? r.parsedDate.getFullYear() : new Date(r.date).getFullYear());
    return sCode === activeSeries.toLowerCase() && yr === Number(activeYear);
  }).sort((a, b) => (a.parsedDate || new Date(a.date)) - (b.parsedDate || new Date(b.date)));

  const completedCount = seriesRaces.filter(r => (r.parsedDate || new Date(r.date)).getTime() < Date.now()).length;
  const totalCount = seriesRaces.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isCompleted = totalCount > 0 && completedCount >= totalCount;

  const nextSeriesRace = seriesRaces.find(r => (r.parsedDate || new Date(r.date)).getTime() + 1000 * 60 * 180 > Date.now());

  if (isAll) {
    if (!nextRace) return null;
    
    const seriesCodeKey = getSeriesCodeFromId(nextRace.series_id ?? nextRace.series);
    const nextCfg = getSeriesConfig(seriesCodeKey);
    const nextLabel = nextCfg.shortLabel ? (nextCfg.shortLabel[lang] || nextCfg.shortLabel) : (nextCfg.label?.[lang] || 'RACE');

    const nDate = nextRace.parsedDate || new Date(nextRace.date);
    const formattedDate = nDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });

    return (
      <div className="w-full bg-surface-card border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <StopwatchIcon size={22} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${nextCfg.badgeClass}`}>
                {nextLabel}
              </span>
              <span className="text-xs font-semibold text-zinc-400">{formattedDate}</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {nextRace.name}
            </h4>
          </div>
        </div>
        <div className="w-full sm:w-auto flex justify-end shrink-0">
          <LiveCountdownTimer nextRace={nextRace} lang={lang} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-card border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${sCfg.badgeClass}`}>
            {sCfg.label[lang] || activeSeries}
          </span>
          <span className="text-xs font-semibold text-zinc-400">
            {lang === 'ru' ? 'Этап' : 'Round'} {completedCount} / {totalCount}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isCompleted ? (
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {lang === 'ru' ? 'Чемпионат завершен' : 'Championship Completed'}
            </span>
          ) : (
            <>
              <span className="text-xs font-mono font-bold text-zinc-400">{progressPercent}%</span>
              {nextSeriesRace && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium truncate max-w-[220px] sm:max-w-xs">
                  <span className="text-zinc-500">{lang === 'ru' ? 'Далее:' : 'Next:'}</span>
                  <span className="text-white font-bold truncate">{nextSeriesRace.name}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 relative">
        <div 
          className={`h-full transition-all duration-500 ${sCfg.bg || 'bg-purple-600'}`} 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

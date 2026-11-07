import React, { useState, useEffect } from 'react';
import { Trophy, Clock, ChevronRight } from 'lucide-react';
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

const CheckeredFlagIcon = ({ className = "" }) => (
  <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} opacity="0.05">
    <path d="M10 20 Q 50 -10 90 20 T 170 20 L 170 130 Q 130 100 90 130 T 10 130 Z" fill="currentColor"/>
    <path d="M10 20 Q 50 -10 90 20 L 90 47 Q 50 17 10 47 Z" fill="#000" opacity="0.3"/>
    <path d="M90 20 Q 130 50 170 20 L 170 47 Q 130 77 90 47 Z" fill="#fff" opacity="0.8"/>
    <path d="M10 47 Q 50 17 90 47 L 90 74 Q 50 44 10 74 Z" fill="#fff" opacity="0.8"/>
    <path d="M90 47 Q 130 77 170 47 L 170 74 Q 130 104 90 74 Z" fill="#000" opacity="0.3"/>
    <path d="M10 74 Q 50 44 90 74 L 90 101 Q 50 71 10 101 Z" fill="#000" opacity="0.3"/>
    <path d="M90 74 Q 130 104 170 74 L 170 101 Q 130 131 90 101 Z" fill="#fff" opacity="0.8"/>
    <path d="M10 101 Q 50 71 90 101 L 90 130 Q 50 100 10 130 Z" fill="#fff" opacity="0.8"/>
    <path d="M90 101 Q 130 131 170 101 L 170 130 Q 130 160 90 130 Z" fill="#000" opacity="0.3"/>
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
      <div className="w-full bg-surface-card border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden h-[104px]">
        <StopwatchIcon className="absolute -left-6 top-1/2 -translate-y-1/2 w-40 h-40 text-amber-400 opacity-10 pointer-events-none transform -rotate-12 z-0" />
        
        <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0 relative z-10">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${nextCfg.badgeClass}`} style={{boxShadow: '0 0 10px rgba(255,255,255,0.15)'}}>
                {nextLabel}
              </span>
              <span className="text-xs font-semibold text-zinc-400">{formattedDate}</span>
            </div>
            <h4 className="text-lg sm:text-2xl font-bold text-white tracking-tight truncate">
              {nextRace.name}
            </h4>
          </div>
        </div>
        <div className="w-full sm:w-auto flex justify-end shrink-0 relative z-10">
          <LiveCountdownTimer nextRace={nextRace} lang={lang} />
        </div>
      </div>
    );
  }

  // Get watermark color logic based on series
  let watermarkColor = 'text-purple-500';
  if (sCfg.code === 'f1') watermarkColor = 'text-red-500';
  if (sCfg.code === 'dtm') watermarkColor = 'text-yellow-500';
  if (sCfg.code === 'wec') watermarkColor = 'text-blue-500';
  if (sCfg.code === 'super_gt') watermarkColor = 'text-emerald-500';

  return (
    <div className="w-full bg-surface-card border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden h-[104px]">
      
      {/* Background Watermark */}
      {isCompleted ? (
        <CheckeredFlagIcon className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 text-zinc-300 pointer-events-none z-0" />
      ) : (
        <div className={`absolute right-12 top-1/2 -translate-y-1/2 text-7xl sm:text-8xl font-black italic opacity-[0.03] pointer-events-none select-none z-0 ${watermarkColor}`}>
          {sCfg.label['en'] || sCfg.label['ru'] || activeSeries}
        </div>
      )}

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase shrink-0 ${sCfg.badgeClass}`} style={{boxShadow: '0 0 12px rgba(255,255,255,0.15)'}}>
            {sCfg.label[lang] || activeSeries}
          </span>
          {!isCompleted && nextSeriesRace && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-zinc-500 font-medium">
                {lang === 'ru' ? 'Далее:' : 'Next:'}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {nextSeriesRace.name}
              </h4>
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          {isCompleted ? (
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {lang === 'ru' ? 'Чемпионат завершен' : 'Championship Completed'}
            </span>
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-zinc-300">
              {lang === 'ru' ? 'Этап' : 'Round'} {completedCount} / {totalCount}
            </span>
          )}
        </div>
      </div>

      <div className="relative pt-4 pb-0.5 z-10 mt-auto">
        {!isCompleted && progressPercent > 0 && progressPercent < 100 && (
          <div 
            className="absolute top-0 flex flex-col items-center transform -translate-x-1/2 pointer-events-none transition-all duration-500"
            style={{ left: `${progressPercent}%` }}
          >
            <span className="text-[11px] sm:text-xs font-mono font-bold text-white mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]">
              {progressPercent}%
            </span>
            <div className="w-0.5 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9),0_0_20px_rgba(59,130,246,0.6)]" />
          </div>
        )}

        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full transition-all duration-500 ${sCfg.bg || 'bg-purple-600'}`} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

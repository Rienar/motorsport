import React, { useState, useEffect } from 'react';
import { Trophy, Clock, ChevronRight, Play } from 'lucide-react';
import { getSeriesConfig } from '../constants/seriesConfig';

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

function LiveCountdownTimer({ nextRace, lang, compact = false }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  let diff = nextRace ? (nextRace.parsedDate || new Date(nextRace.date)).getTime() - now.getTime() : 0;
  if (diff < 0) diff = 0;
  
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
  const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
  const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');

  if (compact) {
    return (
      <div className="flex items-start gap-2 font-light tabular-nums shrink-0 mt-1">
        <div className="flex flex-col items-center">
          <span className="text-white text-2xl sm:text-3xl leading-none tracking-tight">{d}</span>
          <span className="text-[7px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-1.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">{lang === 'ru' ? 'Дней' : 'Days'}</span>
        </div>
        <span className="text-xl leading-none text-zinc-600 relative top-[2px]">:</span>
        <div className="flex flex-col items-center">
          <span className="text-white text-2xl sm:text-3xl leading-none tracking-tight">{h}</span>
          <span className="text-[7px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-1.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">{lang === 'ru' ? 'Час' : 'Hr'}</span>
        </div>
        <span className="text-xl leading-none text-zinc-600 relative top-[2px]">:</span>
        <div className="flex flex-col items-center">
          <span className="text-white text-2xl sm:text-3xl leading-none tracking-tight">{m}</span>
          <span className="text-[7px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-1.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">{lang === 'ru' ? 'Мин' : 'Min'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 sm:gap-4 font-light tabular-nums mt-2 sm:mt-0">
      <div className="flex flex-col items-center">
        <span className="text-white text-4xl sm:text-[44px] leading-none tracking-tight">{d}</span>
        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">{lang === 'ru' ? 'Дней' : 'Days'}</span>
      </div>
      <span className="text-2xl sm:text-3xl leading-none text-zinc-600 relative top-[4px] sm:top-[6px]">:</span>
      <div className="flex flex-col items-center">
        <span className="text-white text-4xl sm:text-[44px] leading-none tracking-tight">{h}</span>
        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">{lang === 'ru' ? 'Часов' : 'Hours'}</span>
      </div>
      <span className="text-2xl sm:text-3xl leading-none text-zinc-600 relative top-[4px] sm:top-[6px]">:</span>
      <div className="flex flex-col items-center">
        <span className="text-white text-4xl sm:text-[44px] leading-none tracking-tight">{m}</span>
        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">{lang === 'ru' ? 'Мин' : 'Mins'}</span>
      </div>
      <span className="text-2xl sm:text-3xl leading-none text-zinc-600 relative top-[4px] sm:top-[6px]">:</span>
      <div className="flex flex-col items-center">
        <span className="text-amber-500 text-4xl sm:text-[44px] leading-none tracking-tight drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">{s}</span>
        <span className="text-[9px] text-amber-500/70 font-bold uppercase tracking-[0.2em] mt-2">{lang === 'ru' ? 'Сек' : 'Secs'}</span>
      </div>
    </div>
  );
}

// ЗАМЕНИТЕ ССЫЛКИ НА ВАШИ АКТУАЛЬНЫЕ
const getWatchLink = (seriesCode) => {
  switch (seriesCode) {
    case 'f1': return 'https://vkvideo.ru/@versportaa';
    case 'wec': return 'https://vkvideo.ru/@fia_wec';
    case 'dtm': return 'https://matchtv.ru/autosport/matchtvvideo_NI2333844_translation_DTM_Lauzicring_Gonka_1';
    case 'super_gt': return 'https://motorsport.tv/program/super-gt/1039';
    default: return 'https://vk.com/video';
  }
};

export const SeasonTracker = ({ activeSeries = 'ALL', races = [], lang = 'ru', activeYear }) => {
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

  const now = Date.now();
  
  const currentLiveRace = races.find(r => {
    const rTime = (r.parsedDate || new Date(r.date)).getTime();
    return rTime <= now && rTime > now - 1000 * 60 * 180;
  });

  const allFutureRaces = races.filter(r => (r.parsedDate || new Date(r.date)).getTime() > now).sort((a, b) => (a.parsedDate || new Date(a.date)) - (b.parsedDate || new Date(b.date)));
  const nextGlobalRace = allFutureRaces[0];
  const nextSeriesRace = seriesRaces.find(r => (r.parsedDate || new Date(r.date)).getTime() > now);

  if (isAll) {
    if (currentLiveRace) {
      const liveSeriesCode = getSeriesCodeFromId(currentLiveRace.series_id ?? currentLiveRace.series);
      const liveCfg = getSeriesConfig(liveSeriesCode);
      const liveLabel = liveCfg.shortLabel ? (liveCfg.shortLabel[lang] || liveCfg.shortLabel) : (liveCfg.label?.[lang] || 'RACE');
      const watchUrl = getWatchLink(liveSeriesCode);

      let nextLabel = '';
      let nextRaceName = '';
      if (nextGlobalRace) {
        const nextCfg = getSeriesConfig(getSeriesCodeFromId(nextGlobalRace.series_id ?? nextGlobalRace.series));
        nextLabel = nextCfg.shortLabel ? (nextCfg.shortLabel[lang] || nextCfg.shortLabel) : (nextCfg.label?.[lang] || 'RACE');
        nextRaceName = nextGlobalRace.name;
      }

      return (
        <div className="w-full bg-surface-card border border-red-500/30 rounded-2xl p-4 sm:p-5 flex flex-row items-center justify-between shadow-[0_0_20px_rgba(220,38,38,0.15)] relative overflow-hidden h-[104px]">
          <div className="flex flex-col justify-center flex-1 pr-4 min-w-0 h-full relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${liveCfg.badgeClass}`} style={{boxShadow: `0 0 12px rgba(255,255,255,0.2)`}}>
                {liveLabel}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-lg sm:text-xl font-bold text-white truncate leading-tight">{currentLiveRace.name}</h4>
              <a href={watchUrl} target="_blank" rel="noopener noreferrer" className={`text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${liveCfg.bg || 'bg-red-600 hover:bg-red-500'}`} style={{boxShadow: `0 0 12px rgba(255,255,255,0.2)`}}>
                <Play className="w-3.5 h-3.5 fill-current" />
                {lang === 'ru' ? 'Смотреть' : 'Watch'}
              </a>
            </div>
          </div>

          {nextGlobalRace && <div className="w-px h-12 bg-white/10 mx-4 shrink-0 hidden sm:block"></div>}

          {nextGlobalRace && (
            <div className="flex flex-row items-center justify-between flex-1 pl-4 min-w-0 h-full relative z-10 hidden sm:flex">
              <div className="flex flex-col justify-center min-w-0 pr-4">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5">{lang === 'ru' ? 'Далее в календаре' : 'Next in Calendar'}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${getSeriesConfig(getSeriesCodeFromId(nextGlobalRace.series_id ?? nextGlobalRace.series)).badgeClass}`} style={{boxShadow: `0 0 8px rgba(255,255,255,0.2)`}}>
                    {nextLabel}
                  </span>
                  <span className="text-sm font-bold text-zinc-300 truncate">{nextRaceName}</span>
                </div>
              </div>
              <LiveCountdownTimer nextRace={nextGlobalRace} lang={lang} compact={true} />
            </div>
          )}
        </div>
      );
    }

    if (!nextGlobalRace) return null;
    
    const seriesCodeKey = getSeriesCodeFromId(nextGlobalRace.series_id ?? nextGlobalRace.series);
    const nextCfg = getSeriesConfig(seriesCodeKey);
    const nextLabel = nextCfg.shortLabel ? (nextCfg.shortLabel[lang] || nextCfg.shortLabel) : (nextCfg.label?.[lang] || 'RACE');
    const nDate = nextGlobalRace.parsedDate || new Date(nextGlobalRace.date);
    const formattedDate = nDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });

    return (
      <div className="w-full bg-surface-card border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full border-[30px] border-amber-500/5 pointer-events-none"></div>
        
        <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0 relative z-10">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-wider ${nextCfg.badgeClass}`} style={{boxShadow: '0 0 10px rgba(255,255,255,0.15)'}}>
                {nextLabel}
              </span>
              <span className="text-xs sm:text-sm font-medium text-zinc-400">{formattedDate}</span>
            </div>
            <h4 className="text-xl sm:text-3xl font-bold text-white tracking-tight truncate">
              {nextGlobalRace.name}
            </h4>
          </div>
        </div>
        <div className="w-full sm:w-auto flex justify-end shrink-0 relative z-10">
          <LiveCountdownTimer nextRace={nextGlobalRace} lang={lang} />
        </div>
      </div>
    );
  }

  let watermarkColor = 'text-purple-500';
  if (sCfg.code === 'f1') watermarkColor = 'text-red-500';
  if (sCfg.code === 'dtm') watermarkColor = 'text-yellow-500';
  if (sCfg.code === 'wec') watermarkColor = 'text-blue-500';
  if (sCfg.code === 'super_gt') watermarkColor = 'text-emerald-500';

  return (
    <div className="w-full bg-surface-card border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden h-[104px]">
      {isCompleted ? (
        <CheckeredFlagIcon className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 text-zinc-300 pointer-events-none z-0" />
      ) : (
        <div className={`absolute right-12 top-1/2 -translate-y-1/2 text-7xl sm:text-8xl font-black italic opacity-[0.10] pointer-events-none select-none z-0 ${watermarkColor}`}>
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
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
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

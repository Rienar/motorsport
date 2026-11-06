import React, { useState, useEffect } from 'react';
import { Trophy, Radio } from 'lucide-react';
import { getSeriesConfig } from '../constants/seriesConfig';

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
      <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/40 px-4 py-2 rounded-2xl animate-pulse shrink-0">
        <Radio size={16} className="text-red-500 animate-spin" />
        <span className="text-sm font-black text-red-400 tracking-wider uppercase">
          {lang === 'ru' ? 'Лайв' : 'LIVE'}
        </span>
      </div>
    );
  }

  if (diff < 0) diff = 0;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
  const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
  const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');

  return (
    <div className="flex items-start gap-2 sm:gap-4 shrink-0">
      <div className="flex flex-col items-center">
        <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-lg">{d}</span>
        <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold mt-1">{lang === 'ru' ? 'Дней' : 'Days'}</span>
      </div>
      <span className="text-2xl sm:text-3xl font-bold text-white/20 mt-1">:</span>
      <div className="flex flex-col items-center">
        <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-lg">{h}</span>
        <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold mt-1">{lang === 'ru' ? 'Часов' : 'Hours'}</span>
      </div>
      <span className="text-2xl sm:text-3xl font-bold text-white/20 mt-1">:</span>
      <div className="flex flex-col items-center">
        <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-lg">{m}</span>
        <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold mt-1">{lang === 'ru' ? 'Мин' : 'Mins'}</span>
      </div>
      <span className="text-2xl sm:text-3xl font-bold text-white/20 mt-1">:</span>
      <div className="flex flex-col items-center">
        <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">{s}</span>
        <span className="text-[9px] sm:text-[10px] text-amber-500/70 uppercase font-bold mt-1">{lang === 'ru' ? 'Сек' : 'Secs'}</span>
      </div>
    </div>
  );
}

export const SeasonTracker = ({
  activeSeries = 'ALL',
  races = [],
  lang = 'ru',
  nextRace,
  activeYear
}) => {
  const isAll = activeSeries.toLowerCase() === 'all';
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.01] backdrop-blur-xl flex flex-col justify-center mb-2">
      <Trophy className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 pointer-events-none" />
      
      <div className="relative z-10">
        {isAll ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col items-start justify-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest drop-shadow-md">
                  {lang === 'ru' ? 'Ближайшая гонка' : 'Next Race'}
                </span>
                {nextRace && nextRace.parsedDate.getTime() <= currentTime.getTime() && nextRace.parsedDate.getTime() + 1000 * 60 * 180 > currentTime.getTime() && (
                  <div className="flex items-center gap-1 bg-red-600/20 border border-red-500/40 px-2 py-0.5 rounded-md text-red-400 text-[10px] font-black tracking-wider uppercase">
                    <Radio size={10} className="text-red-500 animate-spin" />
                    <span>LIVE</span>
                  </div>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {nextRace ? nextRace.name : (lang === 'ru' ? 'Нет гонок' : 'No races')} 
                <span className="text-gray-400 text-sm sm:text-base font-semibold ml-1">
                  ({nextRace ? (getSeriesConfig(nextRace.series_id || nextRace.series).shortLabel[lang] || nextRace.series) : ''})
                </span>
              </div>
            </div>

            <LiveCountdownTimer nextRace={nextRace} lang={lang} />
          </div>
        ) : (
          <div>
            {(() => {
              const activeConfig = getSeriesConfig(activeSeries);
              const targetYearStr = activeYear ? String(activeYear) : String(currentTime.getFullYear());
              const seriesRaces = races.filter(r => {
                if (!r) return false;
                const sCode = (typeof r.series === 'object' ? r.series.code : String(r.series)).toLowerCase();
                const matchSeries = sCode === activeSeries.toLowerCase();
                const rDate = r.parsedDate || new Date(r.date);
                return matchSeries && String(rDate.getFullYear()) === targetYearStr;
              }).sort((a, b) => (a.parsedDate || new Date(a.date)) - (b.parsedDate || new Date(b.date)));

              const totalRounds = seriesRaces.length;
              const nowMs = currentTime.getTime();
              const passedCount = seriesRaces.filter(r => (r.parsedDate || new Date(r.date)).getTime() <= nowMs).length;
              const nextIndex = seriesRaces.findIndex(r => (r.parsedDate || new Date(r.date)).getTime() > nowMs);
              const activeNextRace = nextIndex !== -1 ? seriesRaces[nextIndex] : null;

              return (
                <>
                  <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="text-lg sm:text-xl font-bold text-white truncate max-w-full">
                      <span className="text-amber-400">{lang === 'ru' ? 'Далее: ' : 'Next: '}</span> 
                      {activeNextRace ? activeNextRace.name : (lang === 'ru' ? 'Сезон завершён' : 'Season finished')}
                    </div>
                    {totalRounds > 0 && (
                      <div className="flex items-baseline gap-2 shrink-0">
                        <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">{passedCount + (activeNextRace ? 1 : 0)}</span>
                        <span className="text-sm sm:text-base font-bold text-gray-500 uppercase tracking-widest">/ {totalRounds}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto py-2 hide-scrollbar">
                    {seriesRaces.map((r, idx) => {
                      const isPassed = idx < passedCount;
                      const isNext = idx === nextIndex;
                      let colorCls = 'bg-white/20';
                      
                      if (isPassed) {
                        colorCls = 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]';
                      } else if (isNext) {
                        colorCls = `${activeConfig?.bg || 'bg-white'} ${activeConfig?.glow || ''} animate-pulse`;
                      }

                      return (
                        <div 
                          key={r.id || idx}
                          title={r.name}
                          className={`h-2.5 rounded-full transition-all ${isNext ? 'w-8' : 'w-2.5'} ${colorCls}`}
                        />
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { Trophy } from 'lucide-react';

const getSeriesCode = (series) => {
  if (!series) return '';
  if (typeof series === 'object') return (series.code || series.short_name || '').toLowerCase();
  return String(series).toLowerCase();
};

export const SeasonTracker = ({ 
  activeSeries = 'all', 
  races = [], 
  currentTime = new Date(), 
  lang = 'ru', 
  t = {}, 
  onSelectRace, 
  activeYear 
}) => {
  // Фильтруем гонки по выбранной серии И строго по выбранному году
  const seriesRaces = useMemo(() => {
    if (!races || !activeSeries || activeSeries.toLowerCase() === 'all') return [];
    const targetYearStr = activeYear ? String(activeYear) : null;
    const filterSeries = activeSeries.toLowerCase();

    return races
      .filter(r => {
        if (!r) return false;

        const seriesCode = getSeriesCode(r.series);
        const matchSeries = seriesCode === filterSeries;

        // Безопасная работа с датой (Date или ISO string)
        const dateObj = r.parsedDate instanceof Date && !isNaN(r.parsedDate)
          ? r.parsedDate
          : (r.date ? new Date(r.date) : null);

        if (!dateObj || isNaN(dateObj.getTime())) return false;

        const matchYear = targetYearStr ? dateObj.getFullYear().toString() === targetYearStr : true;
        return matchSeries && matchYear;
      })
      .map(r => ({
        ...r,
        parsedDate: r.parsedDate instanceof Date && !isNaN(r.parsedDate) ? r.parsedDate : new Date(r.date)
      }))
      .sort((a, b) => a.parsedDate - b.parsedDate);
  }, [races, activeSeries, activeYear]);

  const trackerData = useMemo(() => {
    if (!seriesRaces || seriesRaces.length === 0) return null;

    const nowTime = currentTime instanceof Date && !isNaN(currentTime) ? currentTime : new Date();
    const currentYearNum = nowTime.getFullYear();
    const selectedYearNum = parseInt(activeYear, 10) || currentYearNum;
    
    // Проверяем отношения годов
    const isFutureYear = selectedYearNum > currentYearNum;
    const isPastYear = selectedYearNum < currentYearNum;

    const now = nowTime.getTime();
    
    // Если год прошлый — все гонки пройдены. Если будущий — ни одна. Если текущий — считаем по времени.
    const passedRacesCount = isPastYear 
      ? seriesRaces.length 
      : (isFutureYear ? 0 : seriesRaces.filter(r => r.parsedDate.getTime() <= now).length);

    const nextIndex = isPastYear || isFutureYear 
      ? (isFutureYear ? 0 : -1) 
      : seriesRaces.findIndex(r => r.parsedDate.getTime() > now);

    const hasUpcomingRaces = nextIndex !== -1;
    const nextRace = hasUpcomingRaces && !isPastYear && !isFutureYear ? seriesRaces[nextIndex] : null;

    let subtitle = '';
    let currentRoundNum = 0;

    if (isFutureYear) {
      currentRoundNum = 0;
      subtitle = lang === 'ru' ? `Сезон ${selectedYearNum} (ожидание)` : `Season ${selectedYearNum} (upcoming)`;
    } else if (isPastYear) {
      currentRoundNum = seriesRaces.length;
      subtitle = lang === 'ru' ? 'Сезон завершен' : 'Season finished';
    } else if (hasUpcomingRaces) {
      currentRoundNum = passedRacesCount;
      const diffDays = Math.ceil((nextRace.parsedDate - nowTime) / (1000 * 60 * 60 * 24));
      const timeStr = nextRace.parsedDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
      
      if (diffDays <= 0) {
        subtitle = lang === 'ru' ? `Далее: ${nextRace.name} сегодня` : `Next: ${nextRace.name} today`;
      } else if (diffDays === 1) {
        subtitle = lang === 'ru' ? `Далее: ${nextRace.name} завтра` : `Next: ${nextRace.name} tomorrow`;
      } else {
        subtitle = lang === 'ru' ? `Далее: ${nextRace.name} (${timeStr})` : `Next: ${nextRace.name} (${timeStr})`;
      }
    } else {
      currentRoundNum = seriesRaces.length;
      subtitle = lang === 'ru' ? 'Сезон завершен' : 'Season finished';
    }

    return {
      currentRound: currentRoundNum,
      totalRounds: seriesRaces.length,
      subtitle,
      nextRaceIndex: isPastYear || isFutureYear ? (isFutureYear ? 0 : -1) : nextIndex,
      roundsList: seriesRaces,
      isFutureYear,
      isPastYear,
      hasUpcomingRaces
    };
  }, [seriesRaces, currentTime, lang, activeYear]);

  if (!trackerData || trackerData.totalRounds === 0) return null;

  const getActiveDotStyle = (seriesKey) => {
    switch (seriesKey?.toLowerCase()) {
      case 'f1': return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse';
      case 'wec': return 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-pulse';
      case 'dtm': return 'bg-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.8)] animate-pulse';
      case 'super_gt': return 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse';
      default: return 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse';
    }
  };

  const activeDotClass = getActiveDotStyle(activeSeries);

  return (
    <div className="border rounded-3xl p-5 shadow-2xl relative overflow-hidden mb-6 flex flex-col justify-center bg-gradient-to-br from-white/[0.08] to-white/[0.01] border-white/10 backdrop-blur-xl">
      <Trophy className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {trackerData.currentRound}
            </span>
            <span className="text-lg sm:text-xl font-bold text-gray-500">
              / {trackerData.totalRounds}
            </span>
          </div>

          <div className={`text-xs sm:text-sm font-semibold truncate max-w-[220px] sm:max-w-xs ${(!trackerData.hasUpcomingRaces && !trackerData.isFutureYear) || trackerData.isPastYear ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
            {trackerData.subtitle}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-2 hide-scrollbar">
          {trackerData.roundsList.map((race, idx) => {
            const nowTime = currentTime instanceof Date && !isNaN(currentTime) ? currentTime : new Date();
            const isPassed = trackerData.isPastYear || (!trackerData.isFutureYear && race.parsedDate.getTime() <= nowTime.getTime());
            const isNext = !trackerData.isPastYear && !trackerData.isFutureYear && trackerData.hasUpcomingRaces && idx === trackerData.nextRaceIndex;

            let dotColor = 'bg-white/20';
            if (isPassed) {
              dotColor = 'bg-white';
            } else if (isNext) {
              dotColor = activeDotClass;
            }

            return (
              <div 
                key={race.id || idx}
                onClick={() => onSelectRace && onSelectRace(race)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${isNext ? 'w-6' : 'w-2.5'} ${dotColor}`}
                title={`${idx + 1}. ${race.name || ''} (${race.circuit || ''})`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

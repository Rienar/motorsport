import React, { useMemo } from 'react';
import { Trophy } from 'lucide-react';

export const SeasonTracker = ({ activeSeries, races, currentTime, lang, t, onSelectRace, activeYear }) => {
  const seriesRaces = useMemo(() => {
    if (!races || activeSeries === 'all') return [];
    return races
      .filter(r => r && r.series && r.series.toLowerCase() === activeSeries.toLowerCase() && r.parsedDate instanceof Date && !isNaN(r.parsedDate))
      .sort((a, b) => a.parsedDate - b.parsedDate);
  }, [races, activeSeries]);

  const trackerData = useMemo(() => {
    if (!seriesRaces || seriesRaces.length === 0) return null;

    const currentYearNum = new Date().getFullYear();
    const selectedYearNum = parseInt(activeYear, 10) || currentYearNum;
    
    // Является ли выбранный год будущим по отношению к реальному текущему году
    const isFutureYear = selectedYearNum > currentYearNum;

    const now = currentTime.getTime();
    
    // Фильтруем прошедшие гонки только если это не будущий год
    const passedRacesCount = isFutureYear 
      ? 0 
      : seriesRaces.filter(r => r.parsedDate.getTime() <= now).length;

    // Ищем индекс ближайшей предстоящей гонки
    const nextIndex = isFutureYear 
      ? 0 
      : seriesRaces.findIndex(r => r.parsedDate.getTime() > now);

    const hasUpcomingRaces = nextIndex !== -1;
    const nextRace = hasUpcomingRaces && !isFutureYear ? seriesRaces[nextIndex] : (isFutureYear ? seriesRaces[0] : null);

    let subtitle = '';
    let currentRoundNum = 0;

    if (isFutureYear) {
      currentRoundNum = 0;
      subtitle = lang === 'ru' ? `Сезон ${selectedYearNum} (ожидание)` : `Season ${selectedYearNum} (upcoming)`;
    } else if (hasUpcomingRaces) {
      currentRoundNum = passedRacesCount; // Кол-во пройденных этапов
      const diffDays = Math.ceil((nextRace.parsedDate - currentTime) / (1000 * 60 * 60 * 24));
      const timeStr = nextRace.parsedDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
      
      if (diffDays <= 0) {
        subtitle = lang === 'ru' ? `Далее: ${nextRace.name} сегодня` : `Next: ${nextRace.name} today`;
      } else if (diffDays === 1) {
        subtitle = lang === 'ru' ? `Далее: ${nextRace.name} завтра` : `Next: ${nextRace.name} tomorrow`;
      } else {
        subtitle = lang === 'ru' ? `Далее: ${nextRace.name} (${timeStr})` : `Next: ${nextRace.name} (${timeStr})`;
      }
    } else {
      // Гонки в текущем году завершились
      currentRoundNum = seriesRaces.length;
      subtitle = lang === 'ru' ? 'Сезон завершен' : 'Season finished';
    }

    return {
      currentRound: currentRoundNum,
      totalRounds: seriesRaces.length,
      subtitle,
      nextRaceIndex: isFutureYear ? 0 : nextIndex,
      roundsList: seriesRaces,
      isFutureYear,
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

          <div className={`text-xs sm:text-sm font-semibold truncate max-w-[220px] sm:max-w-xs ${!trackerData.hasUpcomingRaces && !trackerData.isFutureYear ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
            {trackerData.subtitle}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-2 hide-scrollbar">
          {trackerData.roundsList.map((race, idx) => {
            const isPassed = !trackerData.isFutureYear && race.parsedDate.getTime() <= currentTime.getTime();
            const isNext = !trackerData.isFutureYear && trackerData.hasUpcomingRaces && idx === trackerData.nextRaceIndex;
            const isFuture = trackerData.isFutureYear || (!isPassed && !isNext);

            let dotColor = 'bg-white/20'; // По умолчанию для будущих / не пройденных
            if (isPassed) {
              dotColor = 'bg-white'; // Прошедшие гонки (белые точки)
            } else if (isNext) {
              dotColor = activeDotClass; // Ближайшая гонка (цветная с анимацией)
            }

            return (
              <div 
                key={race.id || idx}
                onClick={() => onSelectRace && onSelectRace(race)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${isNext ? 'w-6' : 'w-2.5'} ${dotColor}`}
                title={`${idx + 1}. ${race.name} (${race.circuit})`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { Trophy } from 'lucide-react';

export const SeasonTracker = ({ activeSeries, races, currentTime, lang, t, onSelectRace }) => {
  const seriesRaces = useMemo(() => {
    if (!races || activeSeries === 'all') return [];
    return races
      .filter(r => r && r.series && r.series.toLowerCase() === activeSeries.toLowerCase() && r.parsedDate instanceof Date && !isNaN(r.parsedDate))
      .sort((a, b) => a.parsedDate - b.parsedDate);
  }, [races, activeSeries]);

  const trackerData = useMemo(() => {
    if (!seriesRaces || seriesRaces.length === 0) return null;

    const now = currentTime.getTime();
    let nextIndex = seriesRaces.findIndex(r => r.parsedDate.getTime() > now);
    
    // Проверяем, есть ли еще гонки в этом году (или вообще в списке)
    const hasUpcomingRaces = nextIndex !== -1;
    
    if (!hasUpcomingRaces) {
      nextIndex = seriesRaces.length;
    }

    const completedCount = seriesRaces.filter(r => r.parsedDate.getTime() <= now).length;
    const currentRoundNum = Math.min(completedCount + 1, seriesRaces.length);

    const nextRace = hasUpcomingRaces ? seriesRaces[nextIndex] : null;

    let subtitle = '';
    if (nextRace) {
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
      // Сообщение, если гонки в данном сезоне завершены
      subtitle = lang === 'ru' ? '🏁 Гонки в этом сезоне завершены' : '🏁 Races this season are completed';
    }

    return {
      currentRound: hasUpcomingRaces ? Math.min(currentRoundNum, seriesRaces.length) : seriesRaces.length,
      totalRounds: seriesRaces.length,
      subtitle,
      nextRace,
      roundsList: seriesRaces,
      hasUpcomingRaces
    };
  }, [seriesRaces, currentTime, lang]);

  if (!trackerData) return null;

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

          <div className={`text-xs sm:text-sm font-semibold truncate max-w-[220px] sm:max-w-xs ${!trackerData.hasUpcomingRaces ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
            {trackerData.subtitle}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-2 hide-scrollbar">
          {trackerData.roundsList.map((race, idx) => {
            const isPassed = race.parsedDate.getTime() <= currentTime.getTime();
            const isNext = trackerData.hasUpcomingRaces && idx === trackerData.currentRound - 1;

            let dotColor = 'bg-white/20';
            if (isPassed) {
              dotColor = 'bg-white';
            }
            if (isNext) {
              dotColor = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse';
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

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSeriesConfig } from '../constants/seriesConfig';

export const CalendarView = ({
  activeYear, calMonth, setCalMonth,
  availableMonths, handlePrevMonth, handleNextMonth,
  calendarDays, isRaceLive, openDayModal, lang, t
}) => {
  const monthNames = lang === 'ru' ? t.months : t.months;
  const weekDays = t.weekDays || [];

  return (
    <div className="bg-surface-card border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {monthNames[calMonth]} <span className="text-zinc-500">{activeYear}</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((d, i) => (
          <div key={i} className="text-center text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider pb-2">
            {d}
          </div>
        ))}
        {calendarDays.map((day, idx) => {
          const hasRaces = day.races && day.races.length > 0;
          const isToday = new Date().toDateString() === day.date.toDateString();
          
          return (
            <div
              key={idx}
              onClick={() => hasRaces && openDayModal(day.races)}
              className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-1.5 rounded-xl border flex flex-col items-center sm:items-start transition-all ${
                !day.isCurrentMonth ? 'opacity-30 border-transparent bg-transparent pointer-events-none' :
                hasRaces ? 'border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-white/20 shadow-sm' :
                'border-transparent bg-transparent'
              } ${isToday ? 'ring-1 ring-indigo-500/50 bg-indigo-500/5' : ''}`}
            >
              <span className={`text-xs sm:text-sm font-semibold mb-1 ${isToday ? 'text-indigo-400' : hasRaces ? 'text-white' : 'text-zinc-600'}`}>
                {day.dayNumber}
              </span>
              
              <div className="mt-auto w-full flex flex-col gap-1 items-center sm:items-start">
                {day.races.map((r, i) => {
                  // Надежно достаем код серии для конфига
                  const seriesCode = (typeof r.series === 'object' ? r.series?.code || r.series?.short_name : r.series)?.toLowerCase() || '';
                  const sCfg = getSeriesConfig(seriesCode || r.series_id) || {};
                  const isLive = isRaceLive(r);
                  
                  // Формируем текст метки и сокращаем SUPER GT до GT
                  let rawLabel = sCfg.shortLabel?.[lang] || sCfg.label?.[lang] || seriesCode || 'ALL';
                  let displayLabel = String(rawLabel).toUpperCase();
                  if (displayLabel === 'SUPER GT') displayLabel = 'GT';

                  return (
                    <div key={i} className="w-full flex items-center justify-center sm:justify-start">
                      <span 
                        className={`px-1.5 py-0.5 rounded-[4px] text-[9px] sm:text-[10px] font-black tracking-wider uppercase transition-all ${
                          isLive 
                            ? 'bg-red-600 text-white animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]' 
                            : `${sCfg.bg || 'bg-white/20'} text-white`
                        }`}
                      >
                        {displayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

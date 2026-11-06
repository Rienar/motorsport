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
              className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 rounded-xl border flex flex-col items-center sm:items-start transition-all ${
                !day.isCurrentMonth ? 'opacity-30 border-transparent bg-transparent pointer-events-none' :
                hasRaces ? 'border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-white/20 shadow-sm' :
                'border-transparent bg-transparent'
              } ${isToday ? 'ring-1 ring-indigo-500/50 bg-indigo-500/5' : ''}`}
            >
              <span className={`text-xs sm:text-sm font-semibold ${isToday ? 'text-indigo-400' : hasRaces ? 'text-white' : 'text-zinc-600'}`}>
                {day.dayNumber}
              </span>
              
              <div className="mt-auto w-full flex flex-col gap-1 sm:gap-1.5 items-center sm:items-start pt-1">
                {day.races.map((r, i) => {
                  const sCfg = getSeriesConfig(r.series_id || r.series);
                  const isLive = isRaceLive(r);
                  return (
                    <div key={i} className="w-full flex items-center justify-center sm:justify-start gap-1.5">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${isLive ? 'bg-red-500 animate-ping' : sCfg.dotColor || 'bg-white'}`} />
                      <span className={`hidden sm:block text-[9px] font-bold uppercase truncate ${isLive ? 'text-red-400' : 'text-zinc-400'}`}>
                        {sCfg.shortLabel?.[lang] || sCfg.label?.[lang] || r.series}
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

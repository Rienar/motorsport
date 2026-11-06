import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSeriesConfig, DEFAULT_CONFIG } from '../constants/seriesConfig';

export const CalendarView = ({ 
  activeYear, 
  calMonth = 0, 
  availableMonths = [], 
  handlePrevMonth, 
  handleNextMonth, 
  setCalMonth, 
  calendarDays = [], 
  isRaceLive = () => false, 
  openDayModal, 
  lang = 'ru', 
  t = {} 
}) => {
  const monthsList = t.months || [];
  const weekDaysList = t.weekDays || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all active:scale-95"
            title="Предыдущий месяц"
          >
            <ChevronLeft size={18} />
          </button>
          
          <select 
            value={calMonth} 
            onChange={(e) => setCalMonth?.(parseInt(e.target.value, 10))}
            className="appearance-none bg-white/5 border border-white/10 text-white font-bold text-base rounded-xl px-4 py-2 pr-8 focus:outline-none cursor-pointer hover:bg-white/10 transition-colors"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: 'right 0.75rem center', 
              backgroundSize: '1em 1em' 
            }}
          >
            {availableMonths.map(mIdx => (
              <option key={mIdx} value={mIdx} className="bg-gray-900 text-white">
                {monthsList[mIdx] || `Месяц ${mIdx + 1}`} {activeYear}
              </option>
            ))}
          </select>

          <button 
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all active:scale-95"
            title="Следующий месяц"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> F1</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> WEC</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> DTM</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Super GT</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
        {weekDaysList.map((dName, i) => (
          <div key={i} className="text-xs font-bold text-gray-500 uppercase tracking-wider py-1">
            {dName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((item, idx) => {
          const races = item?.races || [];
          const hasRaces = races.length > 0;
          const itemDate = item?.date instanceof Date ? item.date : new Date(item?.date || Date.now());
          const isToday = itemDate.toDateString() === new Date().toDateString();

          return (
            <div 
              key={idx}
              className={`min-h-[72px] sm:min-h-[85px] p-1.5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                !item?.isCurrentMonth 
                  ? 'border-transparent opacity-25' 
                  : hasRaces 
                  ? 'bg-white/[0.07] border-white/20 hover:border-white/40 cursor-pointer shadow-lg hover:scale-[1.02]' 
                  : 'bg-white/[0.02] border-white/5'
              } ${isToday ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => {
                if (hasRaces && typeof openDayModal === 'function') {
                  openDayModal(races, 0);
                }
              }}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-xs font-bold ${hasRaces ? 'text-white' : 'text-gray-400'}`}>
                  {item?.dayNumber}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                )}
              </div>

              <div className="flex flex-col gap-1 mt-1 w-full">
                {races.map((r, rIdx) => {
                  const sCfg = getSeriesConfig(r?.series_id || r?.series) || DEFAULT_CONFIG;
                  const isLive = Boolean(isRaceLive(r));
                  const seriesTitle = sCfg.shortName || (typeof r.series === 'object' ? r.series?.short_name : r.series) || 'RACE';
                  const badgeStyle = sCfg.badgeClass || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';

                  return (
                    <div 
                      key={r.id || rIdx}
                      className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md truncate uppercase border flex items-center justify-between gap-1 shadow-sm ${
                        isLive ? 'bg-red-600 text-white border-red-500 animate-pulse' : badgeStyle
                      }`}
                      title={`${r.name || ''} (${sCfg.name || seriesTitle})`}
                    >
                      <span className="truncate">{seriesTitle}</span>
                      {isLive && <span className="w-1 h-1 rounded-full bg-white animate-ping"></span>}
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

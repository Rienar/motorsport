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
  const monthsList = t.months || [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const weekDaysList = t.weekDays || ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

  return (
    <div className="bg-[#0a0b0f]/80 border border-white/[0.07] rounded-3xl p-3 sm:p-6 shadow-2xl backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button 
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-[#12141c] hover:bg-[#1a1d28] border border-white/10 text-gray-300 hover:text-white transition-all active:scale-95"
            title="Предыдущий месяц"
          >
            <ChevronLeft size={18} />
          </button>
          
          <select 
            value={calMonth} 
            onChange={(e) => setCalMonth && setCalMonth(parseInt(e.target.value, 10))}
            className="appearance-none bg-[#12141c] border border-white/10 text-white font-bold text-sm sm:text-base rounded-xl px-4 py-2 pr-8 focus:outline-none cursor-pointer hover:bg-[#1a1d28] transition-colors"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: 'right 0.75rem center', 
              backgroundSize: '1em 1em' 
            }}
          >
            {availableMonths.map(mIdx => (
              <option key={mIdx} value={mIdx} className="bg-gray-900 text-white">
                {monthsList[mIdx]} {activeYear}
              </option>
            ))}
          </select>

          <button 
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-[#12141c] hover:bg-[#1a1d28] border border-white/10 text-gray-300 hover:text-white transition-all active:scale-95"
            title="Следующий месяц"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> F1</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span> WEC</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span> DTM</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Super GT</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
        {weekDaysList.map((dName, i) => (
          <div key={i} className="text-[11px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider py-1 font-mono">
            {dName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((item, idx) => {
          const races = item.races || [];
          const hasRaces = races.length > 0;
          const isToday = item.date?.toDateString() === new Date().toDateString();

          return (
            <div 
              key={idx}
              className={`min-h-[64px] sm:min-h-[85px] p-1.5 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                !item.isCurrentMonth 
                  ? 'border-transparent opacity-20' 
                  : hasRaces 
                  ? 'bg-white/[0.05] border-white/15 hover:border-white/35 cursor-pointer shadow-lg hover:scale-[1.02]' 
                  : 'bg-white/[0.015] border-white/[0.04]'
              } ${isToday ? 'ring-2 ring-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]' : ''}`}
              onClick={() => {
                if (hasRaces && openDayModal) {
                  openDayModal(races, 0);
                }
              }}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[11px] sm:text-xs font-bold font-mono ${hasRaces ? 'text-white' : 'text-zinc-500'}`}>
                  {item.dayNumber}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                )}
              </div>

              <div className="flex flex-col gap-1 mt-1 w-full">
                {races.map((r, rIdx) => {
                  const sCfg = getSeriesConfig(r.series_id || r.series) || DEFAULT_CONFIG;
                  const isLive = isRaceLive(r);
                  const shortTitle = sCfg.shortLabel ? (sCfg.shortLabel[lang] || sCfg.shortLabel) : (sCfg.label?.[lang] || r.series);

                  return (
                    <div 
                      key={r.id || rIdx}
                      className={`text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md truncate uppercase border flex items-center justify-between gap-1 shadow-sm ${
                        isLive ? 'bg-red-600 text-white border-red-500 animate-pulse' : sCfg.badgeClass
                      }`}
                      title={`${r.name} (${sCfg.label?.[lang] || r.series})`}
                    >
                      <span className="truncate">{shortTitle}</span>
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

import React from 'react';
import { Flag, Eye, EyeOff, List, LayoutGrid, Calendar, Trophy } from 'lucide-react';
import { SERIES_CONFIG } from '../constants/seriesConfig';

export const Header = ({
  lang, onToggleLang, activeSeries, setActiveSeries,
  activeYear, setActiveYear, availableYears,
  activeMonth, setIsMonthModalOpen,
  showPast, setShowPast, viewMode, setViewMode,
  onOpenSeason
}) => {
  const EN_MONTHS = ['Months', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const RU_MONTHS = ['Месяцы', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  const currentMonthLabel = lang === 'ru' ? RU_MONTHS[activeMonth] : EN_MONTHS[activeMonth];
  const yearsToDisplay = availableYears && availableYears.length > 0 ? availableYears : ['2026', '2027'];

  return (
    <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-4">
      {/* Top Row: Title + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
            <Flag className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Race Tracker</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setShowPast(!showPast)} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title={lang === 'ru' ? 'Показывать прошедшие' : 'Show past'}>
            {showPast ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}><List size={15} /></button>
            <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}><LayoutGrid size={15} /></button>
          </div>
          <button onClick={() => onToggleLang(lang === 'ru' ? 'en' : 'ru')} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors uppercase">
            {lang}
          </button>
        </div>
      </div>
      {/* Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap gap-1.5">
            {Object.values(SERIES_CONFIG).map(s => (
              <button
                key={s.code}
                onClick={() => setActiveSeries(s.code.toUpperCase())}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all tracking-wider ${
                  (activeSeries || 'ALL').toLowerCase() === s.code 
                    ? `${s.bg} text-white ${s.glow}` 
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {s.label[lang]}
              </button>
            ))}
          </div>
          <div className="hidden sm:block w-px h-5 bg-white/10"></div>
          <div className="flex flex-wrap gap-1.5">
            {yearsToDisplay.map(y => (
              <button
                key={y}
                onClick={() => setActiveYear(y)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                  String(activeYear) === String(y) 
                    ? 'bg-purple-600 text-white shadow-glow-purple' 
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {(activeSeries || 'ALL').toLowerCase() === 'f1' && (
            <button onClick={onOpenSeason} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all shadow-glow-amber active:scale-95">
              <Trophy size={14} className="text-amber-400" />
              <span className="hidden sm:inline">{lang === 'ru' ? 'Зачёт' : 'Standings'}</span>
            </button>
          )}
          <button onClick={() => setIsMonthModalOpen(true)} className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-2">
            <Calendar size={14} className="text-zinc-400" />
            {currentMonthLabel}
          </button>
        </div>
      </div>
    </header>
  );
};

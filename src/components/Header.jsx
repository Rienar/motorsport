import React from 'react';
import { Flag, Eye, EyeOff, List, LayoutGrid, Calendar, Trophy } from 'lucide-react';
import { SERIES_CONFIG } from '../constants/seriesConfig';

export const Header = ({
  lang, onToggleLang, activeSeries, setActiveSeries,
  activeYear, setActiveYear, availableYears,
  activeMonth, setIsMonthModalOpen,
  showPast, setShowPast, viewMode, setViewMode,
  onOpenStandings // Новый пропс для открытия модалки зачёта
}) => {
  const EN_MONTHS = ['Months', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const RU_MONTHS = ['Месяцы', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  // Используем "Мес" вместо полного названия
  const currentMonthLabel = lang === 'ru' ? 'Мес' : 'Mon';
  const yearsToDisplay = availableYears && availableYears.length > 0 ? availableYears : ['2026', '2027'];
  
  const isF1Active = (activeSeries || 'ALL').toLowerCase() === 'f1';

  return (
    <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex flex-col gap-4 relative">
      
      {/* 1 СТРОКА: Логотип и переключение языка */}
      <div className="flex items-center justify-between w-full">
        {/* Слева: Логотип */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
            <Flag className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Race Tracker</h1>
        </div>

        {/* Справа: Язык (Размер w-8 h-8 для точного выравнивания над глазиком) */}
        <button 
          onClick={() => onToggleLang(lang === 'ru' ? 'en' : 'ru')}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[10px] sm:text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase"
        >
          {lang}
        </button>
      </div>

      {/* 2 СТРОКА: Все фильтры и режимы */}
      <div className="flex items-center justify-between w-full">
        
        {/* Левый и центральный блоки (Серии + Года) */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* 1. Серии */}
          <div className="relative flex items-center gap-1.5">
            {/* Кнопка Зачёт F1 (Абсолютно спозиционирована над правым краем блока серий, видна только для F1) */}
            {isF1Active && (
              <button 
                onClick={onOpenStandings}
                className="absolute bottom-[calc(100%+0.75rem)] right-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/25 transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)] whitespace-nowrap active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-300 z-10"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ru' ? 'Зачёт F1' : 'F1 Standings'}</span>
              </button>
            )}

            {Object.values(SERIES_CONFIG).map(s => (
              <button
                key={s.code}
                onClick={() => setActiveSeries(s.code.toUpperCase())}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all tracking-wider ${
                  (activeSeries || 'ALL').toLowerCase() === s.code 
                    ? `${s.bg} text-white font-black ${s.glow}` 
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {s.label[lang]}
              </button>
            ))}
          </div>

          {/* Разделитель */}
          <div className="w-px h-4 bg-white/10 hidden sm:block"></div>

          {/* 2. Года и Месяц */}
          <div className="flex items-center gap-1.5">
            {yearsToDisplay.map(y => (
              <button
                key={y}
                onClick={() => setActiveYear(y)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all ${
                  String(activeYear) === String(y) 
                    ? 'bg-purple-600 text-white shadow-[0_0_14px_rgba(168,85,247,0.45)]' 
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {y}
              </button>
            ))}
            <button 
              onClick={() => setIsMonthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>{currentMonthLabel}</span>
            </button>
          </div>
        </div>

        {/* 3. Режимы и видимость (Справа) */}
        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={() => setViewMode('list')}
            className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-[0_0_14px_rgba(168,85,247,0.45)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title={lang === 'ru' ? 'Список' : 'List'}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={() => setViewMode('calendar')}
            className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${viewMode === 'calendar' ? 'bg-purple-600 text-white shadow-[0_0_14px_rgba(168,85,247,0.45)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title={lang === 'ru' ? 'Сетка' : 'Calendar'}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-white/10 mx-1"></div>
          
          <button 
            onClick={() => setShowPast(!showPast)} 
            className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all" 
            title={lang === 'ru' ? 'Показывать прошедшие' : 'Show past'}
          >
            {showPast ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </header>
  );
};

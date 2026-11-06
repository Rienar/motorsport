import React, { useState } from 'react';
import { Trophy, Award, RefreshCw, LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { getSeriesConfig, YEARS } from '../constants/seriesConfig';
import { MonthModal } from './MonthModal';

export const Header = ({
  t, 
  lang, 
  onToggleLang, 
  seriesList = [], // Получаем список серий из БД (App.jsx)
  activeSeries, 
  setActiveSeries,
  activeYear, 
  setActiveYear, 
  activeMonth, 
  setActiveMonth,
  showPast, 
  setShowPast, 
  viewMode, 
  setViewMode,
  onRefresh, 
  loading, 
  onOpenSeason
}) => {
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);

  // Текст для кнопки месяца в шапке
  const getMonthButtonLabel = () => {
    if (activeMonth === 'all') return lang === 'ru' ? 'Все месяцы' : 'All Months';
    const idx = parseInt(activeMonth, 10) - 1;
    return t?.months?.[idx] || t?.monthAll || 'Месяц';
  };

  // Фолбэк на случай, если seriesList еще не загрузился из БД
  const displaySeries = seriesList.length > 0 
    ? seriesList 
    : [
        { code: 'f1', short_name: 'F1' },
        { code: 'wec', short_name: 'WEC' },
        { code: 'dtm', short_name: 'DTM' },
        { code: 'super_gt', short_name: 'Super GT' }
      ];

  // Проверка активности Формулы 1 (по коду или ID)
  const isF1Active = activeSeries === 'f1' || activeSeries === 'F1' || activeSeries === 1;

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 p-4 pt-8 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 bg-red-600/20 border border-red-500/40 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Trophy className="text-red-500 w-4 h-4 animate-pulse" />
            </div>
            {t?.appTitle || 'Motorsport Calendar'}
          </h1>

          <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/10 text-xs">
            <button onClick={() => onToggleLang('ru')} className={`px-2 py-1 rounded-lg font-bold transition-all ${lang === 'ru' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>RU</button>
            <button onClick={() => onToggleLang('en')} className={`px-2 py-1 rounded-lg font-bold transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>EN</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/10 text-xs">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
              <LayoutList size={16} />
            </button>
            <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
              <CalendarIcon size={16} />
            </button>
          </div>

          <button onClick={onRefresh} disabled={loading} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/10">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Навигация по сериям */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {/* Кнопка "Все" */}
        <button 
          onClick={() => setActiveSeries('ALL')} 
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            activeSeries === 'ALL' || !activeSeries 
              ? 'bg-white text-black border-white shadow-md' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
          }`}
        >
          {lang === 'ru' ? 'Все' : 'All'}
        </button>

        {displaySeries.map((series) => {
          // Получаем стили для конкретной серии (по id или code)
          const config = getSeriesConfig(series.id || series.code);
          const isActive = activeSeries === series.code || activeSeries === series.id || activeSeries === series.code?.toUpperCase();
          const activeClasses = config.badgeClass || config.activeClass || 'bg-indigo-500 text-white border-indigo-500';

          return (
            <button 
              key={series.code || series.id} 
              onClick={() => setActiveSeries(series.code)} 
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                isActive 
                  ? activeClasses 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              {series.short_name || config.shortName}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 mt-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          {YEARS.map(year => (
            <button key={year} onClick={() => setActiveYear(year)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeYear === year ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {year}
            </button>
          ))}
          
          {viewMode === 'list' && (
            <>
              <div className="w-px h-5 bg-white/20 mx-1 shrink-0"></div>
              <button 
                onClick={() => setIsMonthModalOpen(true)}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold rounded-xl px-3.5 py-1.5 transition-all shadow-sm"
              >
                <CalendarIcon size={13} className="text-red-500" />
                <span>{getMonthButtonLabel()}</span>
              </button>
            </>
          )}

          {isF1Active && (
            <button onClick={onOpenSeason} className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Award size={13} className="text-amber-400" />
              <span>{t?.standingsBtn || 'Standings'} {activeYear}</span>
            </button>
          )}
        </div>
        
        {viewMode === 'list' && (
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setShowPast(!showPast)}>
            <span className="text-xs font-semibold text-gray-400">{t?.pastRaces || 'Past Races'}</span>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 border ${showPast ? 'bg-indigo-500 border-indigo-500' : 'bg-white/5 border-white/10'}`}>
              <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300" style={{ transform: showPast ? 'translateX(18px)' : 'translateX(3px)' }} />
            </div>
          </div>
        )}
      </div>

      <MonthModal 
        isOpen={isMonthModalOpen} 
        onClose={() => setIsMonthModalOpen(false)}
        activeMonth={activeMonth}
        setActiveMonth={setActiveMonth}
        t={t}
        lang={lang}
      />
    </header>
  );
};

export default Header;

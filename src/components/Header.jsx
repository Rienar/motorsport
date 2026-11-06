import React, { useState } from 'react';
import { Trophy, RefreshCw, LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { getSeriesConfig, YEARS } from '../constants/seriesConfig';
import { MonthModal } from './MonthModal';

export const Header = ({
  t = {},
  lang = 'ru',
  onToggleLang,
  seriesList = [],
  activeSeries = 'ALL',
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

  // Список серий для фильтров, исключая IMSA
  const availableSeries = [
    { code: 'ALL', name: lang === 'ru' ? 'Все' : 'All' },
    { code: 'f1', name: 'F1' },
    { code: 'wec', name: 'WEC' },
    { code: 'dtm', name: 'DTM' },
    { code: 'super_gt', name: 'GT' }
  ];

  const monthLabel = activeMonth === 'all'
    ? (t.monthAll || (lang === 'ru' ? 'Все' : 'All'))
    : (t.months?.[parseInt(activeMonth, 10) - 1] || activeMonth);

  return (
    <header className="border-b border-white/10 bg-[#0d0f12]/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Верхняя строка: Логотип, Язык, Управление видом и Обновление */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
              <Trophy size={20} />
            </div>
            <h1 className="text-lg font-black tracking-wider uppercase text-white">
              {t.appTitle || 'Motorsport Tracker'}
            </h1>
            
            {/* Переключатель языка */}
            <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => onToggleLang('ru')}
                className={`px-2 py-0.5 rounded ${lang === 'ru' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => onToggleLang('en')}
                className={`px-2 py-0.5 rounded ${lang === 'en' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Таблица сезона */}
            <button
              type="button"
              onClick={onOpenSeason}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Trophy size={14} className="text-amber-400" />
              <span>{t.standingsBtn || (lang === 'ru' ? 'Зачёт' : 'Standings')}</span>
            </button>

            {/* Вид: Список / Календарь */}
            <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                title={lang === 'ru' ? 'Список' : 'List'}
              >
                <LayoutList size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                title={lang === 'ru' ? 'Календарь' : 'Calendar'}
              >
                <CalendarIcon size={16} />
              </button>
            </div>

            {/* Обновление */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all disabled:opacity-50"
              title={lang === 'ru' ? 'Обновить данные' : 'Refresh'}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-emerald-400' : ''} />
            </button>
          </div>
        </div>

        {/* Нижняя строка: Кнопки серий, Года, Месяц и Тумблер прошедших */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Серии */}
          <div className="flex flex-wrap items-center gap-1.5">
            {availableSeries.map((s) => {
              const isActive = activeSeries.toLowerCase() === s.code.toLowerCase();
              const cfg = getSeriesConfig(s.code);
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => setActiveSeries(s.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                    isActive
                      ? s.code === 'super_gt'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-white text-black shadow-lg shadow-white/10'
                      : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Года (из константы YEARS: 2026, 2027) */}
            <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-0.5">
              {YEARS.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setActiveYear(year)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeYear === year
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Выбор месяца */}
            <button
              type="button"
              onClick={() => setIsMonthModalOpen(true)}
              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <CalendarIcon size={14} className="text-red-400" />
              <span>{monthLabel}</span>
            </button>

            {/* Тумблер прошедших */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-400 select-none">
              <span>{t.pastRaces || (lang === 'ru' ? 'Прошедшие' : 'Past')}</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPast}
                  onChange={(e) => setShowPast(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Селектор месяца */}
      {isMonthModalOpen && (
        <MonthModal
          isOpen={isMonthModalOpen}
          activeMonth={activeMonth}
          onSelectMonth={(m) => {
            setActiveMonth(m);
            setIsMonthModalOpen(false);
          }}
          onClose={() => setIsMonthModalOpen(false)}
          lang={lang}
          t={t}
        />
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { Trophy, RefreshCw, LayoutList, Calendar as CalendarIcon, Calendar } from 'lucide-react';
import { YEARS } from '../constants/seriesConfig';
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

  const seriesButtons = [
    { code: 'ALL', label: lang === 'ru' ? 'ВСЕ' : 'ALL' },
    { code: 'f1', label: 'F1' },
    { code: 'wec', label: 'WEC' },
    { code: 'dtm', label: 'DTM' },
    { code: 'super_gt', label: 'GT' }
  ];

  const monthLabel = activeMonth === 'all'
    ? (t.monthAll || (lang === 'ru' ? 'Все' : 'All'))
    : (t.months?.[parseInt(activeMonth, 10) - 1] || activeMonth);

  return (
    <header className="w-full px-6 py-4 flex flex-col gap-4">
      {/* Верхняя строка */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Trophy size={18} />
          </div>
          <span className="font-black text-lg tracking-wider text-white uppercase font-mono">
            {t.appTitle || 'MOTORSPORT TRACKER'}
          </span>
          <div className="flex items-center bg-[#181a20] rounded-xl p-0.5 border border-white/5 text-xs font-bold ml-2">
            <button
              type="button"
              onClick={() => onToggleLang('ru')}
              className={`px-2 py-1 rounded-lg transition-all ${lang === 'ru' ? 'bg-[#2b2d35] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => onToggleLang('en')}
              className={`px-2 py-1 rounded-lg transition-all ${lang === 'en' ? 'bg-[#2b2d35] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSeason}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#14161b] hover:bg-[#1c1f26] border border-white/10 text-xs font-bold text-amber-400 transition-all"
          >
            <Trophy size={14} />
            <span>{t.standingsBtn || (lang === 'ru' ? 'Зачёт' : 'Standings')}</span>
          </button>

          <div className="flex items-center bg-[#14161b] rounded-xl p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#242731] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <LayoutList size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-[#242731] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <CalendarIcon size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-[#14161b] hover:bg-[#1c1f26] border border-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Нижняя строка управления */}
      <div className="flex items-center justify-between">
        {/* Кнопки-пилюли серий слева */}
        <div className="flex items-center gap-2">
          {seriesButtons.map((btn) => {
            const isActive = activeSeries.toLowerCase() === btn.code.toLowerCase();
            const isGT = btn.code === 'super_gt';

            return (
              <button
                key={btn.code}
                type="button"
                onClick={() => setActiveSeries(btn.code)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
                  isActive
                    ? isGT
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                      : 'bg-white text-black shadow-lg shadow-white/20'
                    : 'bg-[#14161b] hover:bg-[#1e222a] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Правый блок: Года, Месяц и Тогл прошедших */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#14161b] rounded-full p-1 border border-white/10">
            {YEARS.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setActiveYear(year)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeYear === year
                    ? 'bg-[#242731] text-white shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsMonthModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14161b] hover:bg-[#1e222a] border border-white/10 text-xs font-bold text-zinc-300 transition-all"
          >
            <Calendar size={13} className="text-red-400" />
            <span>{monthLabel}</span>
          </button>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-400 select-none ml-1">
            <span>{t.pastRaces || (lang === 'ru' ? 'Прошедшие' : 'Past')}</span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={showPast}
                onChange={(e) => setShowPast(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#14161b] border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
          </label>
        </div>
      </div>

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

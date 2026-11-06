import React, { useState } from 'react';
import { Trophy, RefreshCw, LayoutList, Calendar as CalendarIcon, Calendar } from 'lucide-react';
import { getSeriesConfig, YEARS } from '../constants/seriesConfig';
import { MonthModal } from './MonthModal';

export const Header = ({
  t = {},
  lang = 'ru',
  onToggleLang,
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
    { code: 'ALL', label: lang === 'ru' ? 'Все' : 'All' },
    { code: 'f1', label: 'F1' },
    { code: 'wec', label: 'WEC' },
    { code: 'dtm', label: 'DTM' },
    { code: 'super_gt', label: 'GT' }
  ];

  const monthLabel = activeMonth === 'all'
    ? (t.monthAll || (lang === 'ru' ? 'Все' : 'All'))
    : (t.months?.[parseInt(activeMonth, 10) - 1] || activeMonth);

  return (
    <header className="w-full bg-[#050608]/90 border-b border-white/[0.06] backdrop-blur-2xl sticky top-0 z-40 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col gap-3.5">
        
        {/* Верхняя строка */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/5 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Trophy size={18} />
            </div>
            <span className="font-black text-base sm:text-lg tracking-wider text-white uppercase font-mono">
              {t.appTitle || 'MOTORSPORT TRACKER'}
            </span>

            <div className="flex items-center bg-[#0d0e12] rounded-xl p-0.5 border border-white/10 text-xs font-bold ml-1">
              <button
                type="button"
                onClick={() => onToggleLang('ru')}
                className={`px-2 py-0.5 rounded-lg transition-all ${lang === 'ru' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => onToggleLang('en')}
                className={`px-2 py-0.5 rounded-lg transition-all ${lang === 'en' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenSeason}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#0e1015] hover:bg-[#151821] border border-amber-500/20 hover:border-amber-500/40 text-xs font-bold text-amber-400 transition-all shadow-[0_0_12px_rgba(245,158,11,0.1)] active:scale-95"
            >
              <Trophy size={14} className="text-amber-400" />
              <span className="hidden sm:inline">{t.standingsBtn || (lang === 'ru' ? 'Зачёт' : 'Standings')}</span>
            </button>

            <div className="flex items-center bg-[#0e1015] rounded-xl p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                title={lang === 'ru' ? 'Список' : 'List'}
              >
                <LayoutList size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                title={lang === 'ru' ? 'Календарь' : 'Calendar'}
              >
                <CalendarIcon size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-[#0e1015] hover:bg-[#151821] border border-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-50 active:scale-95"
              title={lang === 'ru' ? 'Обновить' : 'Refresh'}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-400' : ''} />
            </button>
          </div>
        </div>

        {/* Нижняя строка: серии, года, месяц, тогл */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {seriesButtons.map((btn) => {
              const isActive = activeSeries.toLowerCase() === btn.code.toLowerCase();
              const cfg = getSeriesConfig(btn.code);

              return (
                <button
                  key={btn.code}
                  type="button"
                  onClick={() => setActiveSeries(btn.code)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide border transition-all active:scale-95 ${
                    isActive
                      ? cfg.activeBtn
                      : 'bg-[#0e1015] text-zinc-400 hover:text-zinc-200 border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
            <div className="flex items-center bg-[#0e1015] rounded-xl p-1 border border-white/10">
              {YEARS.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setActiveYear(year)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeYear === year
                      ? 'bg-zinc-800 text-white shadow-[0_0_10px_rgba(255,255,255,0.15)]'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1015] hover:bg-[#151821] border border-white/10 text-xs font-semibold text-zinc-300 transition-all active:scale-95"
            >
              <Calendar size={13} className="text-red-400" />
              <span>{monthLabel}</span>
            </button>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-400 select-none">
              <span className="hidden md:inline">{t.pastRaces || (lang === 'ru' ? 'Прошедшие' : 'Past')}</span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showPast}
                  onChange={(e) => setShowPast(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 sm:w-9 sm:h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 sm:after:h-4 sm:after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
              </div>
            </label>
          </div>
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

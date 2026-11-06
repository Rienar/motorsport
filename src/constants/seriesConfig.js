// Список активных годов для переключателя в интерфейсе
export const YEARS = [2026, 2027];

export const SERIES_CONFIG = {
  all: {
    code: 'all',
    label: { ru: 'Все', en: 'All' },
    shortLabel: { ru: 'Все', en: 'All' },
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    dotColor: 'bg-zinc-400'
  },
  f1: {
    code: 'f1',
    label: { ru: 'Формула-1', en: 'Formula 1' },
    shortLabel: { ru: 'F1', en: 'F1' },
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    dotColor: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
  },
  wec: {
    code: 'wec',
    label: { ru: 'WEC', en: 'WEC' },
    shortLabel: { ru: 'WEC', en: 'WEC' },
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]'
  },
  dtm: {
    code: 'dtm',
    label: { ru: 'DTM', en: 'DTM' },
    shortLabel: { ru: 'DTM', en: 'DTM' },
    badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    dotColor: 'bg-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.8)]'
  },
  super_gt: {
    code: 'super_gt',
    label: { ru: 'Super GT', en: 'Super GT' },
    shortLabel: { ru: 'GT', en: 'GT' },
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
  }
};

export const DEFAULT_CONFIG = SERIES_CONFIG.all;

export const getSeriesConfig = (series) => {
  if (!series) return DEFAULT_CONFIG;
  const key = (typeof series === 'object' ? series.code || series.short_name : series)?.toString().toLowerCase();
  
  if (key === 'gt' || key === 'super_gt' || key === 'supergt') {
    return SERIES_CONFIG.super_gt;
  }
  
  return SERIES_CONFIG[key] || DEFAULT_CONFIG;
};

export const SERIES_CONFIG = {
  all: { 
    code: 'all', 
    label: { ru: 'ВСЕ', en: 'ALL' }, 
    shortLabel: { ru: 'ВСЕ', en: 'ALL' }, 
    bg: 'bg-purple-600', 
    glow: 'shadow-[0_0_8px_rgba(168,85,247,0.5)]', 
    badgeClass: 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]',
    dotColor: 'bg-purple-600' 
  },
  f1: { 
    code: 'f1', 
    label: { ru: 'F1', en: 'F1' }, 
    shortLabel: { ru: 'F1', en: 'F1' }, 
    bg: 'bg-red-500', 
    glow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]', 
    badgeClass: 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    dotColor: 'bg-red-500' 
  },
  wec: { 
    code: 'wec', 
    label: { ru: 'WEC', en: 'WEC' }, 
    shortLabel: { ru: 'WEC', en: 'WEC' }, 
    bg: 'bg-blue-600', 
    glow: 'shadow-[0_0_8px_rgba(37,99,235,0.5)]', 
    badgeClass: 'bg-blue-600 text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]',
    dotColor: 'bg-blue-600' 
  },
  dtm: { 
    code: 'dtm', 
    label: { ru: 'DTM', en: 'DTM' }, 
    shortLabel: { ru: 'DTM', en: 'DTM' }, 
    bg: 'bg-yellow-500', 
    glow: 'shadow-[0_0_8px_rgba(234,179,8,0.5)]', 
    badgeClass: 'bg-yellow-500 text-white shadow-[0_0_8px_rgba(234,179,8,0.5)]',
    dotColor: 'bg-yellow-500' 
  },
  super_gt: { 
    code: 'super_gt', 
    label: { ru: 'SUPER GT', en: 'SUPER GT' }, 
    shortLabel: { ru: 'SUPER GT', en: 'SUPER GT' }, 
    bg: 'bg-emerald-500', 
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]', 
    badgeClass: 'bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    dotColor: 'bg-emerald-500' 
  }
};

export const DEFAULT_CONFIG = SERIES_CONFIG.all;

export const getSeriesConfig = (series) => {
  if (!series) return DEFAULT_CONFIG;
  const key = (typeof series === 'object' ? series.code || series.short_name : series)?.toString().toLowerCase();
  if (key === 'gt' || key === 'super_gt' || key === 'supergt') return SERIES_CONFIG.super_gt;
  if (key === 'all') return SERIES_CONFIG.all;
  return SERIES_CONFIG[key] || DEFAULT_CONFIG;
};

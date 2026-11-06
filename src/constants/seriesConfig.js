export const YEARS = [2024, 2025, 2026];

export const DEFAULT_CONFIG = {
  id: 1,
  name: 'Formula 1',
  shortName: 'F1',
  color: '#E10600',
  badgeClass: 'bg-red-500/10 text-red-500 border-red-500/30',
  borderClass: 'border-l-[#E10600]',
  bgClass: 'bg-[#E10600]/10',
  textClass: 'text-[#E10600]',
};

export const SERIES_CONFIG = {
  f1: {
    id: 1,
    name: 'Formula 1',
    shortName: 'F1',
    color: '#E10600',
    badgeClass: 'bg-red-500/10 text-red-500 border-red-500/30',
    borderClass: 'border-l-[#E10600]',
    bgClass: 'bg-[#E10600]/10',
    textClass: 'text-[#E10600]',
  },
  wec: {
    id: 2,
    name: 'World Endurance Championship',
    shortName: 'WEC',
    color: '#00A3E0',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderClass: 'border-l-[#00A3E0]',
    bgClass: 'bg-[#00A3E0]/10',
    textClass: 'text-[#00A3E0]',
  },
  dtm: {
    id: 3,
    name: 'Deutsche Tourenwagen Masters',
    shortName: 'DTM',
    color: '#FFCC00',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderClass: 'border-l-[#FFCC00]',
    bgClass: 'bg-[#FFCC00]/10',
    textClass: 'text-[#FFCC00]',
  },
  super_gt: {
    id: 4,
    name: 'Super GT',
    shortName: 'Super GT',
    color: '#ED1B24',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    borderClass: 'border-l-[#ED1B24]',
    bgClass: 'bg-[#ED1B24]/10',
    textClass: 'text-[#ED1B24]',
  },
  // Обратная совместимость для ключей в верхнем регистре
  F1: {
    id: 1,
    name: 'Formula 1',
    shortName: 'F1',
    color: '#E10600',
    badgeClass: 'bg-red-500/10 text-red-500 border-red-500/30',
    borderClass: 'border-l-[#E10600]',
    bgClass: 'bg-[#E10600]/10',
    textClass: 'text-[#E10600]',
  },
  WEC: {
    id: 2,
    name: 'World Endurance Championship',
    shortName: 'WEC',
    color: '#00A3E0',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderClass: 'border-l-[#00A3E0]',
    bgClass: 'bg-[#00A3E0]/10',
    textClass: 'text-[#00A3E0]',
  },
  DTM: {
    id: 3,
    name: 'Deutsche Tourenwagen Masters',
    shortName: 'DTM',
    color: '#FFCC00',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderClass: 'border-l-[#FFCC00]',
    bgClass: 'bg-[#FFCC00]/10',
    textClass: 'text-[#FFCC00]',
  },
  'Super GT': {
    id: 4,
    name: 'Super GT',
    shortName: 'Super GT',
    color: '#ED1B24',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    borderClass: 'border-l-[#ED1B24]',
    bgClass: 'bg-[#ED1B24]/10',
    textClass: 'text-[#ED1B24]',
  },
};

export const getSeriesConfig = (seriesInput) => {
  if (!seriesInput) return DEFAULT_CONFIG;

  if (typeof seriesInput === 'object') {
    const code = seriesInput.code?.toLowerCase();
    if (code && SERIES_CONFIG[code]) return SERIES_CONFIG[code];
    const matchById = Object.values(SERIES_CONFIG).find(s => s.id === seriesInput.id);
    if (matchById) return matchById;
  }

  if (typeof seriesInput === 'number') {
    return Object.values(SERIES_CONFIG).find(s => s.id === seriesInput) || DEFAULT_CONFIG;
  }

  const key = String(seriesInput).toLowerCase();
  return (
    SERIES_CONFIG[key] ||
    Object.values(SERIES_CONFIG).find(s => s.shortName.toLowerCase() === key) ||
    DEFAULT_CONFIG
  );
};

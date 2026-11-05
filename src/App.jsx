import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, Clock, Timer, X, Gauge, Ruler, Cloud, Navigation, 
  Trophy, RefreshCw, AlertCircle, CalendarPlus, Download, 
  ChevronDown, ChevronUp, Users, User, Loader2, Award, ExternalLink, 
  Radio, Calendar as CalendarIcon, LayoutList, ChevronLeft, ChevronRight
} from 'lucide-react';

const SUPABASE_URL = 'https://qugdovsytjqjawsesdix.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DrPG1dGhbIWU2EARd9v88g_X3c_pPvX';

const SERIES_CONFIG = {
  all: { 
    label: { ru: 'Все', en: 'All' }, 
    shortLabel: { ru: 'Все', en: 'All' },
    activeClass: 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]',
    badgeClass: 'bg-white/20 text-white border-white/30'
  },
  f1: { 
    label: { ru: 'F1', en: 'F1' }, 
    shortLabel: { ru: 'F1', en: 'F1' },
    activeClass: 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40'
  },
  wec: { 
    label: { ru: 'WEC', en: 'WEC' }, 
    shortLabel: { ru: 'WEC', en: 'WEC' },
    activeClass: 'bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  },
  dtm: { 
    label: { ru: 'DTM', en: 'DTM' }, 
    shortLabel: { ru: 'DTM', en: 'DTM' },
    activeClass: 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]',
    badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
  },
  super_gt: { 
    label: { ru: 'Super GT', en: 'Super GT' }, 
    shortLabel: { ru: 'Sup GT', en: 'Sup GT' },
    activeClass: 'bg-green-500 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]',
    badgeClass: 'bg-green-500/20 text-green-300 border-green-500/40'
  },
};

const TRANSLATIONS = {
  ru: {
    appTitle: 'Motorsport Tracker',
    closestRace: 'Ближайший этап',
    liveSession: 'ПРЯМОЙ ЭФИР',
    onAir: 'В эфире:',
    soon: 'Скоро',
    pastRaces: 'Прошедшие',
    noRaces: 'Нет запланированных гонок',
    localTime: 'Местное',
    yourTime: 'Ваше время',
    trackLength: 'Длина',
    lapRecord: 'Рекорд круга',
    turns: 'Повороты',
    weather: 'Погода',
    loading: 'Загрузка...',
    errorTitle: 'Ошибка',
    days: 'Дней',
    hours: 'Часов',
    minutes: 'Минут',
    seconds: 'Секунд',
    stageResults: 'Итоги этапа',
    afterStage: 'Зачёт после этапа',
    tabRace: 'Этап',
    tabAfterRace: 'После этапа',
    drivers: 'Пилоты',
    teams: 'Команды',
    fullStandings: 'Полный зачет',
    collapse: 'Свернуть',
    pointsCalculating: 'Подсчет очков...',
    resultsNotReady: 'Результаты еще не добавлены',
    resultsInProgress: 'Заезд ещё не финишировал, результаты формируются',
    seasonStandings: 'Турнирная таблица',
    seasonSubtitle: 'Текущий общий зачёт по сумме завершённых этапов',
    individualStandings: 'Личный зачёт',
    constructorsCup: 'Кубок конструкторов',
    noPastRacesInSeason: 'В этом сезоне еще нет завершенных гонок',
    calendarView: 'Календарь',
    listView: 'Список',
    monthAll: 'Все',
    weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    standingsBtn: 'Зачёт',
    wikiLink: 'Википедия',
    eventsOnDay: 'Этапы этого дня'
  },
  en: {
    appTitle: 'Motorsport Tracker',
    closestRace: 'Upcoming Round',
    liveSession: 'LIVE ON AIR',
    onAir: 'On Air:',
    soon: 'Soon',
    pastRaces: 'Completed',
    noRaces: 'No scheduled races found',
    localTime: 'Local',
    yourTime: 'Your Time',
    trackLength: 'Length',
    lapRecord: 'Lap Record',
    turns: 'Turns',
    weather: 'Weather',
    loading: 'Loading...',
    errorTitle: 'Error',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Mins',
    seconds: 'Secs',
    stageResults: 'Round Results',
    afterStage: 'Standings Post-Round',
    tabRace: 'Round',
    tabAfterRace: 'Post-Round',
    drivers: 'Drivers',
    teams: 'Teams',
    fullStandings: 'Full Standings',
    collapse: 'Collapse',
    pointsCalculating: 'Calculating championship points...',
    resultsNotReady: 'Results not yet available',
    resultsInProgress: 'Session currently active, results updating',
    seasonStandings: 'Championship Standings',
    seasonSubtitle: 'Current cumulative standings of all completed rounds',
    individualStandings: 'Drivers Championship',
    constructorsCup: 'Constructors Championship',
    noPastRacesInSeason: 'No completed races in this season yet',
    calendarView: 'Calendar',
    listView: 'List',
    monthAll: 'All',
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    standingsBtn: 'Standings',
    wikiLink: 'Wikipedia',
    eventsOnDay: 'Events on this day'
  }
};

const YEARS = ['2026', '2027'];

const getRaceDurationMs = (race) => {
  const s = race.series?.toLowerCase() || '';
  const name = race.name?.toLowerCase() || '';

  if (s === 'f1') return 2 * 60 * 60 * 1000;
  if (s === 'dtm') return 75 * 60 * 1000;
  if (s === 'super_gt') return 150 * 60 * 1000;
  if (s === 'wec') {
    if (name.includes('24')) return 24 * 60 * 60 * 1000;
    if (name.includes('1812') || name.includes('10')) return 10 * 60 * 60 * 1000;
    if (name.includes('8') || name.includes('сах') || name.includes('бах') || name.includes('bahrain')) return 8 * 60 * 60 * 1000;
    return 6 * 60 * 60 * 1000;
  }
  return 2 * 60 * 60 * 1000;
};

const LiveStopwatch = ({ startDate, t }) => {
  const [elapsed, setElapsed] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, new Date().getTime() - startDate.getTime());
      setElapsed({
        h: Math.floor(diff / 3600000).

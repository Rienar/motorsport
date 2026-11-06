import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { SeasonTracker } from './components/SeasonTracker';
import { SeasonModal } from './components/SeasonModal';
import RaceModal from './components/RaceModal';

import { getRaces, getSeries } from './services/queries';
import { useRaceStandings } from './hooks/useRaceStandings';
import { translations } from './constants/translations';

export default function App() {
  const [races, setRaces] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lang, setLang] = useState('ru');
  const [selectedSeries, setSelectedSeries] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [viewMode, setViewMode] = useState('calendar');
  const [showPast, setShowPast] = useState(true);

  const [selectedRace, setSelectedRace] = useState(null);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);

  const t = translations?.[lang] || translations?.ru || {};

  const isRaceLive = (race) => {
    if (!race || !race.date) return false;
    const today = new Date().toDateString();
    const raceDay = (race.parsedDate || new Date(race.date)).toDateString();
    return today === raceDay;
  };

  const standingsData = useRaceStandings(selectedRace, races, selectedYear, isRaceLive);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [racesData, seriesData] = await Promise.all([
        getRaces(),
        getSeries(),
      ]);

      const formattedRaces = (racesData || []).map(r => ({
        ...r,
        parsedDate: r.date ? new Date(r.date) : new Date()
      }));

      // Исключаем IMSA
      const cleanRaces = formattedRaces.filter(r => {
        const code = (typeof r.series === 'object' ? r.series?.code : r.series)?.toLowerCase();
        return code !== 'imsa';
      });

      const cleanSeries = (seriesData || []).filter(s => {
        const code = (s.code || s.short_name || '').toLowerCase();
        return code !== 'imsa';
      });

      setRaces(cleanRaces);
      setSeriesList(cleanSeries);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Фильтрация гонок
  const filteredRaces = useMemo(() => {
    return races.filter((race) => {
      const seriesCode = (typeof race.series === 'object' ? race.series?.code || race.series?.short_name : race.series)?.toLowerCase() || '';
      const filterVal = selectedSeries.toLowerCase();
      const matchesSeries = selectedSeries === 'ALL' || seriesCode === filterVal;

      const raceDate = race.parsedDate || new Date(race.date);
      const raceYear = Number(race.season) || raceDate.getFullYear();
      const matchesYear = raceYear === Number(selectedYear);

      const raceMonth = raceDate.getMonth() + 1;
      const matchesMonth = selectedMonth === 'all' || raceMonth === parseInt(selectedMonth, 10);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPast = raceDate < today;
      const matchesPast = showPast ? true : !isPast;

      return matchesSeries && matchesYear && matchesMonth && matchesPast;
    });
  }, [races, selectedSeries, selectedYear, selectedMonth, showPast]);

  // Расчет календарной сетки для CalendarView
  const calendarDays = useMemo(() => {
    const year = Number(selectedYear);
    const month = calMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Понедельник = 0
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Предыдущий месяц
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        races: []
      });
    }

    // Текущий месяц с привязкой гонок
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const dayRaces = filteredRaces.filter(r => {
        const rDate = r.parsedDate || new Date(r.date);
        return rDate.getFullYear() === year && rDate.getMonth() === month && rDate.getDate() === i;
      });

      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        races: dayRaces
      });
    }

    // Хвост следующего месяца до полной сетки (кратной 7)
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const d = new Date(year, month + 1, i);
        days.push({
          date: d,
          dayNumber: i,
          isCurrentMonth: false,
          races: []
        });
      }
    }

    return days;
  }, [selectedYear, calMonth, filteredRaces]);

  const availableMonths = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  const handlePrevMonth = () => {
    setCalMonth(prev => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setCalMonth(prev => (prev === 11 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans selection:bg-red-500/30">
      <Header
        t={t}
        lang={lang}
        onToggleLang={setLang}
        seriesList={seriesList}
        activeSeries={selectedSeries}
        setActiveSeries={setSelectedSeries}
        activeYear={selectedYear}
        setActiveYear={setSelectedYear}
        activeMonth={selectedMonth}
        setActiveMonth={setSelectedMonth}
        showPast={showPast}
        setShowPast={setShowPast}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onRefresh={fetchData}
        loading={isLoading}
        onOpenSeason={() => setIsSeasonModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">{lang === 'ru' ? 'Загрузка календаря...' : 'Loading calendar...'}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-400 space-y-2">
            <p className="font-semibold">{lang === 'ru' ? 'Не удалось загрузить данные' : 'Failed to load data'}</p>
            <p className="text-xs text-zinc-500">{error.message}</p>
            <button
              onClick={fetchData}
              className="mt-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 rounded-lg transition-colors"
            >
              {lang === 'ru' ? 'Попробовать снова' : 'Try again'}
            </button>
          </div>
        ) : (
          <>
            <SeasonTracker
              races={races}
              activeSeries={selectedSeries}
              activeYear={selectedYear}
              currentTime={new Date()}
              lang={lang}
              t={t}
              onSelectRace={setSelectedRace}
            />

            <CalendarView
              activeYear={selectedYear}
              calMonth={calMonth}
              setCalMonth={setCalMonth}
              availableMonths={availableMonths}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              calendarDays={calendarDays}
              isRaceLive={isRaceLive}
              openDayModal={(racesOnDay) => {
                if (racesOnDay && racesOnDay[0]) setSelectedRace(racesOnDay[0]);
              }}
              lang={lang}
              t={t}
            />
          </>
        )}
      </main>

      {selectedRace && (
        <RaceModal
          race={selectedRace}
          onClose={() => setSelectedRace(null)}
          standingsData={standingsData}
        />
      )}

      {isSeasonModalOpen && (
        <SeasonModal
          isOpen={isSeasonModalOpen}
          onClose={() => setIsSeasonModalOpen(false)}
          year={selectedYear}
          standingsData={standingsData}
          lang={lang}
          t={t}
        />
      )}
    </div>
  );
}

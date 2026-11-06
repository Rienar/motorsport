import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { SeasonTracker } from './components/SeasonTracker';
import { RaceModal } from './components/RaceModal';
import { SeasonModal } from './components/SeasonModal';
import { getRaces, getSeries } from './services/queries';
import { useRaceStandings } from './hooks/useRaceStandings';
import translations from './constants/translations';

export default function App() {
  // Базовые состояния данных
  const [races, setRaces] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния фильтров и UI
  const [lang, setLang] = useState('ru');
  const [selectedSeries, setSelectedSeries] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [showPast, setShowPast] = useState(true);

  // Состояния модальных окон
  const [selectedRace, setSelectedRace] = useState(null);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);

  // Текущий словарь локализации
  const t = translations?.[lang] || translations?.ru || {};

  // Турнирная таблица для модалки итогов сезона
  const { data: standings } = useRaceStandings(selectedYear);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [racesData, seriesData] = await Promise.all([
        getRaces(),
        getSeries(),
      ]);
      setRaces(racesData);
      setSeriesList(seriesData);
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

  // Многоуровневая фильтрация гонок
  const filteredRaces = races.filter((race) => {
    // 1. Фильтр по серии
    const code = race.series?.code?.toLowerCase();
    const shortName = (race.series?.short_name || race.series)?.toString().toUpperCase();
    const filterVal = selectedSeries.toLowerCase();
    const matchesSeries = selectedSeries === 'ALL' || code === filterVal || shortName === selectedSeries.toUpperCase();

    // 2. Фильтр по году
    const raceYear = race.season || new Date(race.date).getFullYear();
    const matchesYear = raceYear === selectedYear;

    // 3. Фильтр по месяцу
    const raceMonth = new Date(race.date).getMonth() + 1; // getMonth() возвращает 0-11
    const matchesMonth = selectedMonth === 'all' || raceMonth === parseInt(selectedMonth, 10);

    // 4. Фильтр прошедших гонок
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const raceDate = new Date(race.date);
    const isPast = raceDate < today;
    const matchesPast = showPast ? true : !isPast;

    return matchesSeries && matchesYear && matchesMonth && matchesPast;
  });

  return (
    <div className="min-h-screen bg-[#0d0f12] text-zinc-100 flex flex-col font-sans selection:bg-red-500/30">
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
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
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
        ) : filteredRaces.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
            {lang === 'ru' ? 'Нет гонок по выбранным критериям.' : 'No races match the selected criteria.'}
          </div>
        ) : (
          <>
            <SeasonTracker
              races={filteredRaces}
              onSelectRace={setSelectedRace}
              onSelectMonth={setSelectedMonth}
            />

            <CalendarView
              races={filteredRaces}
              viewMode={viewMode}
              onSelectRace={setSelectedRace}
            />
          </>
        )}
      </main>

      {/* Модальное окно гонки */}
      {selectedRace && (
        <RaceModal
          race={selectedRace}
          onClose={() => setSelectedRace(null)}
        />
      )}

      {/* Модальное окно турнирной таблицы */}
      {isSeasonModalOpen && (
        <SeasonModal
          isOpen={isSeasonModalOpen}
          onClose={() => setIsSeasonModalOpen(false)}
          year={selectedYear}
          standings={standings}
        />
      )}
    </div>
  );
}

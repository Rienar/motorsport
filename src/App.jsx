import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { SeasonTracker } from './components/SeasonTracker';
import { RaceModal } from './components/RaceModal';
import { MonthModal } from './components/MonthModal';
import { SeasonModal } from './components/SeasonModal';
import { getRaces, getSeries } from './services/queries';
import { useRaceStandings } from './hooks/useRaceStandings';

// Если у вас есть файл переводов, импортируйте его. 
// В качестве fallback можно использовать пустой объект или подставить импорт:
// import { translations } from './constants/translations';

export default function App() {
  // Базовые состояния данных
  const [races, setRaces] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния фильтров и UI (синхронизировано с Header.jsx)
  const [selectedSeries, setSelectedSeries] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Текущий год по умолчанию
  const [viewMode, setViewMode] = useState('list');
  const [showPast, setShowPast] = useState(true); // Показывать ли прошедшие гонки
  const [lang, setLang] = useState('ru'); 

  // Состояния модальных окон
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);

  // Получение словаря (заглушка на случай отсутствия импорта)
  // const t = translations?.[lang] || { appTitle: 'Motorsport', months: [] }; 
  const t = { appTitle: 'Motorsport', months: [], standingsBtn: 'Таблица', pastRaces: 'Прошедшие' };

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
  }, []); // Перезапрашиваем данные только при маунте, фильтрация идет на клиенте

  // Многоуровневая фильтрация гонок (Серия + Год + Прошедшие)
  const filteredRaces = races.filter((race) => {
    // 1. Фильтр по серии
    const code = race.series?.code?.toLowerCase();
    const shortName = (race.series?.short_name || race.series)?.toString().toUpperCase();
    const filterVal = selectedSeries.toLowerCase();
    const matchesSeries = selectedSeries === 'ALL' || code === filterVal || shortName === selectedSeries.toUpperCase();

    // 2. Фильтр по году (используем поле season из БД или вычисляем из даты)
    const raceYear = race.season || new Date(race.date).getFullYear();
    const matchesYear = raceYear === selectedYear;

    // 3. Фильтр прошедших гонок
    // Устанавливаем начало сегодняшнего дня для корректного сравнения
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const raceDate = new Date(race.date);
    const isPast = raceDate < today;
    const matchesPast = showPast ? true : !isPast;

    return matchesSeries && matchesYear && matchesPast;
  });

  return (
    <div className="min-h-screen bg-[#0d0f12] text-zinc-100 flex flex-col font-sans selection:bg-red-500/30">
      {/* Пропсы строго соответствуют сигнатуре Header.jsx */}
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
            <p className="text-sm">Загрузка календаря...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-400 space-y-2">
            <p className="font-semibold">Не удалось загрузить данные</p>
            <p className="text-xs text-zinc-500">{error.message}</p>
            <button
              onClick={fetchData}
              className="mt-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 rounded-lg transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        ) : filteredRaces.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
            Нет гонок по выбранным критериям.
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

      {/* Модальное окно месяца (открывается из SeasonTracker) */}
      {selectedMonth && selectedMonth !== 'all' && (
        <MonthModal
          month={selectedMonth}
          races={filteredRaces}
          onClose={() => setSelectedMonth('all')}
          onSelectRace={setSelectedRace}
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

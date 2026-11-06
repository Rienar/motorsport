import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { SeasonTracker } from './components/SeasonTracker';
import { RaceModal } from './components/RaceModal';
import { MonthModal } from './components/MonthModal';
import { SeasonModal } from './components/SeasonModal';
import { getRaces, getSeries } from './services/queries';
import { useRaceStandings } from './hooks/useRaceStandings';

export default function App() {
  const [races, setRaces] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [viewMode, setViewMode] = useState('list');
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [selectedYear]);

  // Фильтрация этапов с поддержкой структуры series:series_id
  const filteredRaces = selectedSeries === 'ALL'
    ? races
    : races.filter((race) => {
        const code = race.series?.code?.toLowerCase();
        const shortName = (race.series?.short_name || race.series)?.toString().toUpperCase();
        const filterVal = selectedSeries.toLowerCase();
        return code === filterVal || shortName === selectedSeries.toUpperCase();
      });

  return (
    <div className="min-h-screen bg-[#0d0f12] text-zinc-100 flex flex-col font-sans selection:bg-red-500/30">
      <Header
        seriesList={seriesList}
        selectedSeries={selectedSeries}
        onSelectSeries={setSelectedSeries}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'list' ? 'calendar' : 'list'))}
        onOpenSeasonModal={() => setIsSeasonModalOpen(true)}
        onRefresh={fetchData}
        isRefreshing={isLoading}
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

      {selectedRace && (
        <RaceModal
          race={selectedRace}
          onClose={() => setSelectedRace(null)}
        />
      )}

      {selectedMonth !== null && (
        <MonthModal
          month={selectedMonth}
          races={filteredRaces}
          onClose={() => setSelectedMonth(null)}
          onSelectRace={setSelectedRace}
        />
      )}

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

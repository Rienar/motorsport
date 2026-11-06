import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CalendarView from './components/CalendarView';
import RaceModal from './components/RaceModal';
import SeasonTracker from './components/SeasonTracker';
import { getRaces, getSeries } from './services/queries';

export default function App() {
  const [races, setRaces] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState('ALL');
  const [selectedRace, setSelectedRace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [racesData, seriesData] = await Promise.all([
          getRaces(),
          getSeries(),
        ]);
        setRaces(racesData);
        setSeriesList(seriesData);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRaces = selectedSeries === 'ALL'
    ? races
    : races.filter((race) => {
        const code = race.series?.code?.toLowerCase();
        const shortName = race.series?.short_name?.toUpperCase();
        const filterVal = selectedSeries.toLowerCase();
        return code === filterVal || shortName === selectedSeries.toUpperCase();
      });

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      <Header
        seriesList={seriesList}
        selectedSeries={selectedSeries}
        onSelectSeries={setSelectedSeries}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-zinc-500">
            Загрузка календаря...
          </div>
        ) : (
          <>
            <SeasonTracker races={filteredRaces} onSelectRace={setSelectedRace} />
            <CalendarView races={filteredRaces} onSelectRace={setSelectedRace} />
          </>
        )}
      </main>

      {selectedRace && (
        <RaceModal race={selectedRace} onClose={() => setSelectedRace(null)} />
      )}
    </div>
  );
}

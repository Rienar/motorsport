import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { SeasonTracker } from './components/SeasonTracker';
import { SeasonModal } from './components/SeasonModal';
import { StandingsModal } from './components/StandingsModal';

import RaceModal from './components/RaceModal';
import RaceCard from './components/RaceCard';

// Импорты методов кэшированной загрузки
import { getAvailableYears, getRacesByYear, getSeries } from './services/queries';
import { translations } from './constants/translations';

const EN_MONTHS = ['Months', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const RU_MONTHS = ['Месяцы', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export default function App() {
  // Кэш и метаданные
  const [racesCache, setRacesCache] = useState({});
  const [availableYears, setAvailableYears] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Стейты интерфейса и фильтров
  const [lang, setLang] = useState('ru');
  const [selectedSeries, setSelectedSeries] = useState('ALL');
  
  const currentYearStr = String(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [selectedMonth, setSelectedMonth] = useState(0); 
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState('list');
  const [showPast, setShowPast] = useState(false);

  // Стейты модалок
  const [selectedRace, setSelectedRace] = useState(null);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isStandingsModalOpen, setIsStandingsModalOpen] = useState(false);

  const t = translations?.[lang] || translations?.ru || {};

  const isRaceLive = (race) => {
    if (!race || !race.date) return false;
    const raceTime = (race.parsedDate || new Date(race.date)).getTime();
    const nowMs = Date.now();
    return nowMs >= raceTime && nowMs <= raceTime + 1000 * 60 * 180;
  };

  // 1. Загрузка мета-данных при старте
  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [seriesData, yearsData] = await Promise.all([
          getSeries(),
          getAvailableYears(),
        ]);

        const cleanSeries = (seriesData || []).filter(s => {
          const code = (s.code || s.short_name || '').toLowerCase();
          return code !== 'imsa';
        });

        setSeriesList(cleanSeries);
        setAvailableYears(yearsData);
      } catch (err) {
        console.error('Ошибка инициализации:', err);
        setError(err);
      }
    };
    initApp();
  }, []);

  // 2. Ленивая загрузка гонок при смене года
  useEffect(() => {
    const fetchYearRaces = async () => {
      if (racesCache[selectedYear]) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const racesData = await getRacesByYear(selectedYear);

        const formattedRaces = (racesData || []).map(r => ({
          ...r,
          parsedDate: r.date ? new Date(r.date) : new Date()
        }));

        const cleanRaces = formattedRaces.filter(r => {
          const code = (typeof r.series === 'object' ? r.series?.code : r.series)?.toLowerCase();
          return code !== 'imsa';
        });

        setRacesCache(prev => ({
          ...prev,
          [selectedYear]: cleanRaces
        }));
      } catch (err) {
        console.error('Ошибка загрузки гонок:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchYearRaces();
  }, [selectedYear, racesCache]);

  // Базовый массив гонок текущего года
  const activeYearRaces = racesCache[selectedYear] || [];

  const nextRace = useMemo(() => {
    const currentMs = Date.now();
    const futureRaces = activeYearRaces
      .filter(r => (r.parsedDate || new Date(r.date)).getTime() + 1000 * 60 * 180 > currentMs)
      .sort((a,b) => (a.parsedDate || new Date(a.date)) - (b.parsedDate || new Date(b.date)));
    return futureRaces.length > 0 ? futureRaces[0] : null;
  }, [activeYearRaces]);

  // Отфильтрованные гонки (используются только для списка, не для календаря)
  const filteredRaces = useMemo(() => {
    return activeYearRaces.filter((race) => {
      const seriesCode = (typeof race.series === 'object' ? race.series?.code || race.series?.short_name : race.series)?.toLowerCase() || '';
      const filterVal = selectedSeries.toLowerCase();
      const matchesSeries = selectedSeries === 'ALL' || seriesCode === filterVal;

      const raceDate = race.parsedDate || new Date(race.date);
      const raceYear = Number(race.season) || raceDate.getFullYear();
      const matchesYear = raceYear === Number(selectedYear);

      const raceMonth = raceDate.getMonth() + 1;
      const matchesMonth = selectedMonth === 0 || raceMonth === selectedMonth;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPast = raceDate < today;
      const matchesPast = showPast ? true : !isPast;

      return matchesSeries && matchesYear && matchesMonth && matchesPast;
    });
  }, [activeYearRaces, selectedSeries, selectedYear, selectedMonth, showPast]);

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-purple-500/30">
      <Header
        lang={lang}
        onToggleLang={setLang}
        activeSeries={selectedSeries}
        setActiveSeries={setSelectedSeries}
        activeYear={selectedYear}
        setActiveYear={setSelectedYear}
        availableYears={availableYears}
        activeMonth={selectedMonth}
        setIsMonthModalOpen={setIsMonthModalOpen}
        showPast={showPast}
        setShowPast={setShowPast}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenStandings={() => setIsStandingsModalOpen(true)}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">{lang === 'ru' ? 'Загрузка календаря...' : 'Loading calendar...'}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-400 space-y-2">
            <p className="font-semibold">{lang === 'ru' ? 'Ошибка загрузки' : 'Failed to load'}</p>
            <p className="text-xs text-zinc-500">{error.message}</p>
            <button onClick={() => setRacesCache({})} className="mt-2 px-3 py-1.5 bg-[#0e1015] border border-white/10 hover:bg-zinc-800 text-xs text-zinc-200 rounded-lg transition-colors">
              {lang === 'ru' ? 'Повторить' : 'Retry'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            <SeasonTracker
              races={activeYearRaces}
              activeSeries={selectedSeries}
              activeYear={selectedYear}
              lang={lang}
              nextRace={nextRace}
            />

            {viewMode === 'list' ? (
              filteredRaces.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
                  {lang === 'ru' ? 'Нет гонок по выбранным критериям.' : 'No races match the selected criteria.'}
                </div>
              ) : (
                <div className="flex flex-col gap-4 w-full">
                  {filteredRaces.map((race) => {
                    const isLiveNow = isRaceLive(race);
                    return (
                      <RaceCard
                        key={race.id}
                        race={race}
                        onClick={() => setSelectedRace(race)}
                        isNext={nextRace && race.id === nextRace.id}
                        isLiveNow={isLiveNow}
                        lang={lang}
                      />
                    );
                  })}
                </div>
              )
            ) : (
              // Вызов нового CalendarView с корректными пропсами
              <CalendarView
                activeYear={selectedYear}
                races={activeYearRaces}
                activeSeries={selectedSeries}
                showPast={showPast}
                isRaceLive={isRaceLive}
                openDayModal={(racesOnDay) => { if (racesOnDay && racesOnDay[0]) setSelectedRace(racesOnDay[0]); }}
                lang={lang}
                t={t}
              />
            )}
          </div>
        )}
      </main>

      {/* Инлайновая модалка месяцев (если вы её не вынесли в отдельный компонент) */}
      {isMonthModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121216] border border-white/10 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsMonthModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">{lang === 'ru' ? 'Выберите месяц' : 'Select Month'}</h3>
            
            <button 
              onClick={() => { setSelectedMonth(0); setIsMonthModalOpen(false); }}
              className={`w-full py-2.5 rounded-xl text-sm font-bold mb-3 transition-colors ${selectedMonth === 0 ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              {lang === 'ru' ? 'Все месяцы' : 'All Months'}
            </button>

            <div className="grid grid-cols-3 gap-2">
              {(lang === 'ru' ? RU_MONTHS : EN_MONTHS).slice(1).map((m, idx) => {
                const monthIndex = idx + 1;
                return (
                  <button
                    key={m}
                    onClick={() => { setSelectedMonth(monthIndex); setIsMonthModalOpen(false); }}
                    className={`py-2 rounded-xl text-sm font-bold transition-all ${
                      selectedMonth === monthIndex 
                        ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedRace && (
        <RaceModal
          race={selectedRace}
          onClose={() => setSelectedRace(null)}
          allRaces={activeYearRaces}
          lang={lang}
        />
      )}

      {isSeasonModalOpen && (
        <SeasonModal
          isOpen={isSeasonModalOpen}
          onClose={() => setIsSeasonModalOpen(false)}
          year={selectedYear}
          allRaces={activeYearRaces}
          lang={lang}
          t={t}
        />
      )}

      <StandingsModal 
        isOpen={isStandingsModalOpen} 
        onClose={() => setIsStandingsModalOpen(false)} 
        lang={lang}
        year={selectedYear}
        allRaces={activeYearRaces}
      />
    </div>
  );
}

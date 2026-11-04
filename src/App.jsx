import React, { useState, useEffect } from 'react';
import { Trophy, Calendar as CalendarIcon, MapPin, Globe, Clock, AlertCircle, RefreshCw } from 'lucide-react';

const SUPABASE_URL = "https://qugdovsytjqjawsesdix.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DrPG1dGhbIWU2EARd9v88g_X3c_pPvX";

export default function App() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [viewMode, setViewMode] = useState('upcoming'); // 'all' или 'upcoming'

  const fetchRaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/races?select=*&order=date.asc`, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRaces(data || []);
    } catch (err) {
      console.error("Ошибка загрузки из Supabase:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  const now = new Date();

  const filteredRaces = races.filter(race => {
    const raceDate = new Date(race.date);
    const raceYear = raceDate.getFullYear().toString();

    // Фильтр по году
    if (raceYear !== selectedYear) return false;

    // Фильтр по серии
    if (selectedSeries !== 'all' && race.series.toLowerCase() !== selectedSeries.toLowerCase()) {
      return false;
    }

    // Фильтр по режиму (все / только предстоящие)
    if (viewMode === 'upcoming' && raceDate < now) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0a0c] to-[#121218] text-slate-100 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Шапка с градиентными акцентами */}
        <div className="bg-[#121216]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white shadow-lg shadow-red-500/25">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Motorsport Tracker</h1>
              <p className="text-sm text-slate-400">Календарь мировых гоночных серий</p>
            </div>
          </div>
          
          <button 
            onClick={fetchRaces}
            disabled={loading}
            className="relative z-10 flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-sm font-medium rounded-xl transition-all border border-slate-700/50 shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>

        {/* Панель фильтров */}
        <div className="bg-[#121216]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          
          {/* Серии с градиентным выделением активной кнопки */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Все серии' },
              { id: 'f1', label: 'Formula 1' },
              { id: 'wec', label: 'WEC' },
              { id: 'dtm', label: 'DTM' },
              { id: 'super_gt', label: 'Super GT' }
            ].map(series => {
              const isActive = selectedSeries === series.id;
              return (
                <button
                  key={series.id}
                  onClick={() => setSelectedSeries(series.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25 border border-red-500/30' 
                      : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  {series.label}
                </button>
              );
            })}
          </div>

          <hr className="border-slate-800/60" />

          {/* Годы и переключатель режима */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {['2026', '2027'].map(year => {
                const isActive = selectedYear === year;
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30' 
                        : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Все гонки
              </button>
              <button
                onClick={() => setViewMode('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'upcoming' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Только предстоящие
              </button>
            </div>
          </div>

        </div>

        {/* Контент */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Загрузка данных из базы...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-200">Ошибка загрузки данных</h3>
            <p className="text-sm text-red-400 max-w-md mx-auto">{error}</p>
          </div>
        ) : filteredRaces.length === 0 ? (
          <div className="bg-[#121216]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-16 text-center space-y-3 shadow-xl">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-300">Гонок не найдено</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              По выбранным фильтрам нет доступных событий.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRaces.map((race, index) => {
              const raceDate = new Date(race.date);
              const isPast = raceDate < now;
              
              return (
                <div 
                  key={race.id || index}
                  className={`bg-[#121216]/90 backdrop-blur-md border rounded-2xl p-5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${
                    isPast ? 'border-slate-800/40 opacity-60' : 'border-slate-800/80 hover:border-slate-700/80 hover:shadow-red-950/10'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700/50">
                        {race.series}
                      </span>
                      {isPast && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800/50 text-zinc-500">
                          Прошло
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-wide">{race.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{race.circuit}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <span>{race.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-start md:self-center bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-800/60 shadow-inner">
                    <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                      <CalendarIcon className="w-4 h-4 text-red-500" />
                      <span>
                        {raceDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-800"></div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{race.time || '14:00'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

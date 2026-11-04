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
  const [showPastRaces, setShowPastRaces] = useState(false); // Переключатель отображения прошедших гонок

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
  const currentYearNumber = now.getFullYear().toString();

  const filteredRaces = races.filter(race => {
    const raceDate = new Date(race.date);
    const raceYear = raceDate.getFullYear().toString();

    // Фильтр по выбранному году
    if (raceYear !== selectedYear) return false;

    // Фильтр по серии
    if (selectedSeries !== 'all' && race.series.toLowerCase() !== selectedSeries.toLowerCase()) {
      return false;
    }

    // Если это текущий год и выключен показ прошедших — скрываем гонки, которые уже прошли
    if (!showPastRaces && raceYear === currentYearNumber && raceDate < now) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Шапка */}
        <div className="bg-[#121216] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600 rounded-xl text-white">
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
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>

        {/* Панель фильтров */}
        <div className="bg-[#121216] border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
          
          {/* Серии (без полупрозрачных градиентов) */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Все' },
              { id: 'f1', label: 'F1' },
              { id: 'wec', label: 'WEC' },
              { id: 'dtm', label: 'DTM' },
              { id: 'super_gt', label: 'Super GT' }
            ].map(series => {
              const isActive = selectedSeries === series.id;
              return (
                <button
                  key={series.id}
                  onClick={() => setSelectedSeries(series.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive 
                      ? 'bg-red-600 text-white' 
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {series.label}
                </button>
              );
            })}
          </div>

          <hr className="border-slate-800/60" />

          {/* Годы и чекбокс прошедших гонок */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {['2026', '2027'].map(year => {
                const isActive = selectedYear === year;
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      isActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowPastRaces(!showPastRaces)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                showPastRaces 
                  ? 'bg-slate-800 text-white border-slate-700' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {showPastRaces ? '✓ Показаны прошедшие гонки' : 'Скрыть прошедшие гонки'}
            </button>
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
          <div className="bg-[#121216] border border-slate-800/80 rounded-2xl p-16 text-center space-y-3">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-300">Нет предстоящих гонок</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              По выбранным фильтрам нет актуальных событий или все гонки уже завершились.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRaces.map((race, index) => {
              const raceDate = new Date(race.date);
              
              return (
                <div 
                  key={race.id || index}
                  className="bg-[#121216] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/50">
                        {race.series}
                      </span>
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

                  <div className="flex items-center gap-4 self-start md:self-center bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-800/60">
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

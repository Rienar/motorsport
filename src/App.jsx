import React, { useState } from 'react';
import { Calendar, MapPin, Flag } from 'lucide-react';

const RACES = [
  { id: 1, series: 'f1', name: 'Гран-при Бахрейна', date: '2027-03-14', circuit: 'Сахир' },
  { id: 2, series: 'wec', name: 'Qatar 1812km', date: '2027-03-27', circuit: 'Лусаил' },
  { id: 3, series: 'dtm', name: 'Red Bull Ring', date: '2027-04-25', circuit: 'Шпильберг' },
  { id: 4, series: 'super_gt', name: 'Okayama GT 300km', date: '2027-04-18', circuit: 'Окаяма' },
];

const SERIES_INFO = {
  all: { label: 'Все серии', color: 'bg-gray-700' },
  f1: { label: 'Formula 1', color: 'bg-red-600' },
  wec: { label: 'FIA WEC', color: 'bg-blue-600' },
  dtm: { label: 'DTM', color: 'bg-yellow-500' },
  super_gt: { label: 'Super GT', color: 'bg-green-600' },
};

export default function App() {
  const [activeSeries, setActiveSeries] = useState('all');

  const filteredRaces = RACES.filter(r => activeSeries === 'all' || r.series === activeSeries)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-red-500 pb-10">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-4 pt-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flag className="text-red-500" /> Motorsport 2027
        </h1>
        
        {/* Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(SERIES_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setActiveSeries(key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSeries === key 
                  ? `${info.color} text-white` 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {info.label}
            </button>
          ))}
        </div>
      </header>

      {/* Race List */}
      <main className="p-4 space-y-4">
        {filteredRaces.map((race) => (
          <div key={race.id} className="bg-gray-800 rounded-2xl p-4 shadow-lg active:scale-95 transition-transform flex flex-col gap-3 border border-gray-700">
            <div className="flex justify-between items-start">
              <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${SERIES_INFO[race.series].color}`}>
                {SERIES_INFO[race.series].label}
              </span>
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <Calendar size={16} />
                <span>{new Date(race.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold">{race.name}</h2>
              <div className="flex items-center gap-1 text-gray-400 mt-1">
                <MapPin size={16} />
                <span className="text-sm">{race.circuit}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredRaces.length === 0 && (
          <div className="text-center text-gray-500 py-10">Нет гонок для выбранных фильтров</div>
        )}
      </main>
    </div>
  );
}

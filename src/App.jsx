import React, { useState } from 'react';
import { Calendar, MapPin, Flag } from 'lucide-react';

const RACES = [
  // ================= FORMULA 1 (24 этапа) =================
  { id: 1, series: 'f1', name: 'Гран-при Бахрейна', date: '2027-03-14', circuit: 'Сахир' },
  { id: 2, series: 'f1', name: 'Гран-при Саудовской Аравии', date: '2027-03-21', circuit: 'Джидда' },
  { id: 3, series: 'f1', name: 'Гран-при Австралии', date: '2027-04-04', circuit: 'Альберт-Парк' },
  { id: 4, series: 'f1', name: 'Гран-при Японии', date: '2027-04-11', circuit: 'Сузука' },
  { id: 5, series: 'f1', name: 'Гран-при Китая', date: '2027-04-18', circuit: 'Шанхай' },
  { id: 6, series: 'f1', name: 'Гран-при Майами', date: '2027-05-02', circuit: 'Майами' },
  { id: 7, series: 'f1', name: 'Гран-при Канады', date: '2027-05-23', circuit: 'Монреаль' },
  { id: 8, series: 'f1', name: 'Гран-при Монако', date: '2027-06-06', circuit: 'Монте-Карло' },
  { id: 9, series: 'f1', name: 'Гран-при Португалии', date: '2027-06-20', circuit: 'Портиман' },
  { id: 10, series: 'f1', name: 'Гран-при Великобритании', date: '2027-07-04', circuit: 'Сильверстоун' },
  { id: 11, series: 'f1', name: 'Гран-при Австрии', date: '2027-07-11', circuit: 'Шпильберг' },
  { id: 12, series: 'f1', name: 'Гран-при Бельгии', date: '2027-07-25', circuit: 'Спа-Франкоршам' },
  { id: 13, series: 'f1', name: 'Гран-при Венгрии', date: '2027-08-01', circuit: 'Хунгароринг' },
  { id: 14, series: 'f1', name: 'Гран-при Италии', date: '2027-09-05', circuit: 'Монца' },
  { id: 15, series: 'f1', name: 'Гран-при Испании', date: '2027-09-12', circuit: 'Мадрид' },
  { id: 16, series: 'f1', name: 'Гран-при Азербайджана', date: '2027-09-26', circuit: 'Баку' },
  { id: 17, series: 'f1', name: 'Гран-при Турции', date: '2027-10-03', circuit: 'Истанбул Парк' },
  { id: 18, series: 'f1', name: 'Гран-при Сингапура', date: '2027-10-10', circuit: 'Марина Бэй' },
  { id: 19, series: 'f1', name: 'Гран-при США', date: '2027-10-24', circuit: 'Остин' },
  { id: 20, series: 'f1', name: 'Гран-при Мехико', date: '2027-10-31', circuit: 'Мехико' },
  { id: 21, series: 'f1', name: 'Гран-при Сан-Паулу', date: '2027-11-07', circuit: 'Интерлагос' },
  { id: 22, series: 'f1', name: 'Гран-при Лас-Вегаса', date: '2027-11-20', circuit: 'Лас-Вегас' },
  { id: 23, series: 'f1', name: 'Гран-при Катара', date: '2027-12-05', circuit: 'Лусаил' },
  { id: 24, series: 'f1', name: 'Гран-при Абу-Даби', date: '2027-12-12', circuit: 'Яс Марина' },

  // ================= FIA WEC (9 этапов) =================
  { id: 25, series: 'wec', name: 'Qatar 1812km', date: '2027-03-27', circuit: 'Лусаил' },
  { id: 26, series: 'wec', name: 'Imola 6 Hours', date: '2027-04-11', circuit: 'Имола' },
  { id: 27, series: 'wec', name: 'Silverstone 6 Hours', date: '2027-04-25', circuit: 'Сильверстоун' },
  { id: 28, series: 'wec', name: 'Spa 6 Hours', date: '2027-05-15', circuit: 'Спа-Франкоршам' },
  { id: 29, series: 'wec', name: 'Le Mans 24 Hours', date: '2027-06-13', circuit: 'Сарта' },
  { id: 30, series: 'wec', name: '6 Hours of São Paulo', date: '2027-07-11', circuit: 'Интерлагос' },
  { id: 31, series: 'wec', name: 'Lone Star Le Mans', date: '2027-09-12', circuit: 'Остин (COTA)' },
  { id: 32, series: 'wec', name: '6 Hours of Fuji', date: '2027-09-26', circuit: 'Фудзи' },
  { id: 33, series: 'wec', name: '8 Hours of Bahrain', date: '2027-11-06', circuit: 'Бахрейн' },

  // ================= DTM (8 этапов) =================
  { id: 34, series: 'dtm', name: 'Red Bull Ring', date: '2027-04-25', circuit: 'Шпильберг' },
  { id: 35, series: 'dtm', name: 'Motorsport Arena', date: '2027-05-09', circuit: 'Ошерслебен' },
  { id: 36, series: 'dtm', name: 'Lausitzring', date: '2027-06-20', circuit: 'Лаузицринг' },
  { id: 37, series: 'dtm', name: 'Norisring', date: '2027-07-04', circuit: 'Нюрнберг' },
  { id: 38, series: 'dtm', name: 'Circuit Zandvoort', date: '2027-08-08', circuit: 'Зандворт' },
  { id: 39, series: 'dtm', name: 'Nürburgring', date: '2027-08-22', circuit: 'Нюрбургринг' },
  { id: 40, series: 'dtm', name: 'Sachsenring', date: '2027-09-26', circuit: 'Заксенринг' },
  { id: 41, series: 'dtm', name: 'Hockenheimring', date: '2027-10-10', circuit: 'Хоккенхайм' },

  // ================= SUPER GT (9 этапов) =================
  { id: 42, series: 'super_gt', name: 'Okayama GT', date: '2027-04-04', circuit: 'Окаяма' },
  { id: 43, series: 'super_gt', name: 'Fuji GT 1', date: '2027-05-04', circuit: 'Фудзи' },
  { id: 44, series: 'super_gt', name: 'Sepang GT', date: '2027-06-19', circuit: 'Сепанг' },
  { id: 45, series: 'super_gt', name: 'Suzuka GT 1', date: '2027-08-01', circuit: 'Сузука' },
  { id: 46, series: 'super_gt', name: '1000 km of Suzuka', date: '2027-09-05', circuit: 'Сузука (GT300 Special)' },
  { id: 47, series: 'super_gt', name: 'Sugo GT', date: '2027-09-19', circuit: 'Суго' },
  { id: 48, series: 'super_gt', name: 'Autopolis GT', date: '2027-10-17', circuit: 'Автополис' },
  { id: 49, series: 'super_gt', name: 'Fuji GT 2', date: '2027-11-07', circuit: 'Фудзи' },
  { id: 50, series: 'super_gt', name: 'Motegi GT', date: '2027-11-21', circuit: 'Мотеги' },
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

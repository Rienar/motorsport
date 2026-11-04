import React, { useState } from 'react';
import { Calendar, MapPin, Flag } from 'lucide-react';

const RACES = [
  // ================= FORMULA 1 - 2026 =================
  { id: 101, series: 'f1', name: 'Гран-при Бахрейна', date: '2026-03-01', circuit: 'Сахир', country: 'Бахрейн', time: '18:00' },
  { id: 102, series: 'f1', name: 'Гран-при Саудовской Аравии', date: '2026-03-08', circuit: 'Джидда', country: 'С. Аравия', time: '20:00' },
  { id: 103, series: 'f1', name: 'Гран-при Австралии', date: '2026-03-22', circuit: 'Альберт-Парк', country: 'Австралия', time: '07:00' },
  { id: 104, series: 'f1', name: 'Гран-при Японии', date: '2026-04-05', circuit: 'Сузука', country: 'Япония', time: '08:00' },
  { id: 105, series: 'f1', name: 'Гран-при Китая', date: '2026-04-19', circuit: 'Шанхай', country: 'Китай', time: '10:00' },
  { id: 106, series: 'f1', name: 'Гран-при Майами', date: '2026-05-03', circuit: 'Майами', country: 'США', time: '23:00' },
  { id: 107, series: 'f1', name: 'Гран-при Эмилии-Романьи', date: '2026-05-17', circuit: 'Имола', country: 'Италия', time: '16:00' },
  { id: 108, series: 'f1', name: 'Гран-при Монако', date: '2026-05-24', circuit: 'Монте-Карло', country: 'Монако', time: '16:00' },
  { id: 109, series: 'f1', name: 'Гран-при Канады', date: '2026-06-07', circuit: 'Монреаль', country: 'Канада', time: '21:00' },
  { id: 110, series: 'f1', name: 'Гран-при Испании', date: '2026-06-21', circuit: 'Мадрид', country: 'Испания', time: '16:00' },
  { id: 111, series: 'f1', name: 'Гран-при Австрии', date: '2026-07-05', circuit: 'Шпильберг', country: 'Австрия', time: '16:00' },
  { id: 112, series: 'f1', name: 'Гран-при Великобритании', date: '2026-07-12', circuit: 'Сильверстоун', country: 'Великобритания', time: '17:00' },
  { id: 113, series: 'f1', name: 'Гран-при Бельгии', date: '2026-07-26', circuit: 'Спа-Франкоршам', country: 'Бельгия', time: '16:00' },
  { id: 114, series: 'f1', name: 'Гран-при Венгрии', date: '2026-08-02', circuit: 'Хунгароринг', country: 'Венгрия', time: '16:00' },
  { id: 115, series: 'f1', name: 'Гран-при Нидерландов', date: '2026-08-30', circuit: 'Зандворт', country: 'Нидерланды', time: '16:00' },
  { id: 116, series: 'f1', name: 'Гран-при Италии', date: '2026-09-06', circuit: 'Монца', country: 'Италия', time: '16:00' },
  { id: 117, series: 'f1', name: 'Гран-при Азербайджана', date: '2026-09-20', circuit: 'Баку', country: 'Азербайджан', time: '14:00' },
  { id: 118, series: 'f1', name: 'Гран-при Сингапура', date: '2026-10-04', circuit: 'Марина Бэй', country: 'Сингапур', time: '15:00' },
  { id: 119, series: 'f1', name: 'Гран-при США', date: '2026-10-25', circuit: 'Остин', country: 'США', time: '22:00' },
  { id: 120, series: 'f1', name: 'Гран-при Мехико', date: '2026-11-01', circuit: 'Мехико', country: 'Мексика', time: '23:00' },
  { id: 121, series: 'f1', name: 'Гран-при Сан-Паулу', date: '2026-11-08', circuit: 'Интерлагос', country: 'Бразилия', time: '20:00' },
  { id: 122, series: 'f1', name: 'Гран-при Лас-Вегаса', date: '2026-11-21', circuit: 'Лас-Вегас', country: 'США', time: '09:00' },
  { id: 123, series: 'f1', name: 'Гран-при Катара', date: '2026-11-29', circuit: 'Лусаил', country: 'Катар', time: '19:00' },
  { id: 124, series: 'f1', name: 'Гран-при Абу-Даби', date: '2026-12-06', circuit: 'Яс Марина', country: 'ОАЭ', time: '16:00' },

  // ================= WEC - 2026 =================
  { id: 125, series: 'wec', name: 'Qatar 1812km', date: '2026-02-28', circuit: 'Лусаил', country: 'Катар', time: '11:00' },
  { id: 126, series: 'wec', name: 'Imola 6 Hours', date: '2026-04-19', circuit: 'Имола', country: 'Италия', time: '14:00' },
  { id: 127, series: 'wec', name: 'Spa 6 Hours', date: '2026-05-09', circuit: 'Спа-Франкоршам', country: 'Бельгия', time: '14:00' },
  { id: 128, series: 'wec', name: 'Le Mans 24 Hours', date: '2026-06-14', circuit: 'Сарта', country: 'Франция', time: '16:00' },
  { id: 129, series: 'wec', name: 'São Paulo 6 Hours', date: '2026-07-19', circuit: 'Интерлагос', country: 'Бразилия', time: '17:30' },
  { id: 130, series: 'wec', name: 'Lone Star Le Mans', date: '2026-09-06', circuit: 'Остин', country: 'США', time: '21:00' },
  { id: 131, series: 'wec', name: 'Fuji 6 Hours', date: '2026-09-27', circuit: 'Фудзи', country: 'Япония', time: '05:00' },
  { id: 132, series: 'wec', name: 'Bahrain 8 Hours', date: '2026-11-07', circuit: 'Бахрейн', country: 'Бахрейн', time: '14:00' },

  // ================= DTM - 2026 =================
  { id: 133, series: 'dtm', name: 'Motorsport Arena', date: '2026-04-26', circuit: 'Ошерслебен', country: 'Германия', time: '13:30' },
  { id: 134, series: 'dtm', name: 'Lausitzring', date: '2026-05-24', circuit: 'Лаузицринг', country: 'Германия', time: '13:30' },
  { id: 135, series: 'dtm', name: 'Circuit Zandvoort', date: '2026-06-07', circuit: 'Зандворт', country: 'Нидерланды', time: '13:30' },
  { id: 136, series: 'dtm', name: 'Norisring', date: '2026-07-05', circuit: 'Нюрнберг', country: 'Германия', time: '13:30' },
  { id: 137, series: 'dtm', name: 'Nürburgring', date: '2026-08-09', circuit: 'Нюрбургринг', country: 'Германия', time: '13:30' },
  { id: 138, series: 'dtm', name: 'Sachsenring', date: '2026-08-23', circuit: 'Заксенринг', country: 'Германия', time: '13:30' },
  { id: 139, series: 'dtm', name: 'Red Bull Ring', date: '2026-09-13', circuit: 'Шпильберг', country: 'Австрия', time: '13:30' },
  { id: 140, series: 'dtm', name: 'Hockenheimring', date: '2026-10-04', circuit: 'Хоккенхайм', country: 'Германия', time: '13:30' },

  // ================= SUPER GT - 2026 =================
  { id: 141, series: 'super_gt', name: 'Okayama GT 300km', date: '2026-04-12', circuit: 'Окаяма', country: 'Япония', time: '07:30' },
  { id: 142, series: 'super_gt', name: 'Fuji GT 3 Hours', date: '2026-05-04', circuit: 'Фудзи', country: 'Япония', time: '07:30' },
  { id: 143, series: 'super_gt', name: 'Suzuka GT 3 Hours', date: '2026-06-28', circuit: 'Сузука', country: 'Япония', time: '07:30' },
  { id: 144, series: 'super_gt', name: 'Fuji GT 350km', date: '2026-08-02', circuit: 'Фудзи', country: 'Япония', time: '07:30' },
  { id: 145, series: 'super_gt', name: 'Suzuka GT 350km', date: '2026-08-23', circuit: 'Сузука', country: 'Япония', time: '07:30' },
  { id: 146, series: 'super_gt', name: 'Sugo GT 300km', date: '2026-09-20', circuit: 'Суго', country: 'Япония', time: '07:30' },
  { id: 147, series: 'super_gt', name: 'Autopolis GT 3 Hours', date: '2026-10-18', circuit: 'Автополис', country: 'Япония', time: '07:30' },
  { id: 148, series: 'super_gt', name: 'Motegi GT 300km', date: '2026-11-01', circuit: 'Мотеги', country: 'Япония', time: '07:00' },

  // ================= FORMULA 1 - 2027 =================
  { id: 201, series: 'f1', name: 'Гран-при Бахрейна', date: '2027-03-14', circuit: 'Сахир', country: 'Бахрейн', time: '18:00' },
  { id: 202, series: 'f1', name: 'Гран-при Саудовской Аравии', date: '2027-03-21', circuit: 'Джидда', country: 'С. Аравия', time: '20:00' },
  { id: 203, series: 'f1', name: 'Гран-при Австралии', date: '2027-04-04', circuit: 'Альберт-Парк', country: 'Австралия', time: '07:00' },
  { id: 204, series: 'f1', name: 'Гран-при Японии', date: '2027-04-11', circuit: 'Сузука', country: 'Япония', time: '08:00' },
  { id: 205, series: 'f1', name: 'Гран-при Китая', date: '2027-04-18', circuit: 'Шанхай', country: 'Китай', time: '10:00' },
  { id: 206, series: 'f1', name: 'Гран-при Майами', date: '2027-05-02', circuit: 'Майами', country: 'США', time: '23:00' },
  { id: 207, series: 'f1', name: 'Гран-при Канады', date: '2027-05-23', circuit: 'Монреаль', country: 'Канада', time: '21:00' },
  { id: 208, series: 'f1', name: 'Гран-при Монако', date: '2027-06-06', circuit: 'Монте-Карло', country: 'Монако', time: '16:00' },
  { id: 209, series: 'f1', name: 'Гран-при Португалии', date: '2027-06-20', circuit: 'Портиман', country: 'Португалия', time: '17:00' },
  { id: 210, series: 'f1', name: 'Гран-при Великобритании', date: '2027-07-04', circuit: 'Сильверстоун', country: 'Великобритания', time: '17:00' },
  { id: 211, series: 'f1', name: 'Гран-при Австрии', date: '2027-07-11', circuit: 'Шпильберг', country: 'Австрия', time: '16:00' },
  { id: 212, series: 'f1', name: 'Гран-при Бельгии', date: '2027-07-25', circuit: 'Спа-Франкоршам', country: 'Бельгия', time: '16:00' },
  { id: 213, series: 'f1', name: 'Гран-при Венгрии', date: '2027-08-01', circuit: 'Хунгароринг', country: 'Венгрия', time: '16:00' },
  { id: 214, series: 'f1', name: 'Гран-при Италии', date: '2027-09-05', circuit: 'Монца', country: 'Италия', time: '16:00' },
  { id: 215, series: 'f1', name: 'Гран-при Испании', date: '2027-09-12', circuit: 'Мадрид', country: 'Испания', time: '16:00' },
  { id: 216, series: 'f1', name: 'Гран-при Азербайджана', date: '2027-09-26', circuit: 'Баку', country: 'Азербайджан', time: '14:00' },
  { id: 217, series: 'f1', name: 'Гран-при Турции', date: '2027-10-03', circuit: 'Истанбул Парк', country: 'Турция', time: '15:00' },
  { id: 218, series: 'f1', name: 'Гран-при Сингапура', date: '2027-10-10', circuit: 'Марина Бэй', country: 'Сингапур', time: '15:00' },
  { id: 219, series: 'f1', name: 'Гран-при США', date: '2027-10-24', circuit: 'Остин', country: 'США', time: '22:00' },
  { id: 220, series: 'f1', name: 'Гран-при Мехико', date: '2027-10-31', circuit: 'Мехико', country: 'Мексика', time: '23:00' },
  { id: 221, series: 'f1', name: 'Гран-при Сан-Паулу', date: '2027-11-07', circuit: 'Интерлагос', country: 'Бразилия', time: '20:00' },
  { id: 222, series: 'f1', name: 'Гран-при Лас-Вегаса', date: '2027-11-20', circuit: 'Лас-Вегас', country: 'США', time: '09:00' },
  { id: 223, series: 'f1', name: 'Гран-при Катара', date: '2027-12-05', circuit: 'Лусаил', country: 'Катар', time: '19:00' },
  { id: 224, series: 'f1', name: 'Гран-при Абу-Даби', date: '2027-12-12', circuit: 'Яс Марина', country: 'ОАЭ', time: '16:00' },

  // ================= WEC - 2027 =================
  { id: 225, series: 'wec', name: 'Qatar 1812km', date: '2027-03-27', circuit: 'Лусаил', country: 'Катар', time: '11:00' },
  { id: 226, series: 'wec', name: 'Imola 6 Hours', date: '2027-04-11', circuit: 'Имола', country: 'Италия', time: '14:00' },
  { id: 227, series: 'wec', name: 'Silverstone 6 Hours', date: '2027-04-25', circuit: 'Сильверстоун', country: 'Великобритания', time: '14:00' },
  { id: 228, series: 'wec', name: 'Spa 6 Hours', date: '2027-05-15', circuit: 'Спа-Франкоршам', country: 'Бельгия', time: '14:00' },
  { id: 229, series: 'wec', name: 'Le Mans 24 Hours', date: '2027-06-13', circuit: 'Сарта', country: 'Франция', time: '16:00' },
  { id: 230, series: 'wec', name: 'São Paulo 6 Hours', date: '2027-07-11', circuit: 'Интерлагос', country: 'Бразилия', time: '17:30' },
  { id: 231, series: 'wec', name: 'Lone Star Le Mans', date: '2027-09-12', circuit: 'Остин', country: 'США', time: '21:00' },
  { id: 232, series: 'wec', name: 'Fuji 6 Hours', date: '2027-09-26', circuit: 'Фудзи', country: 'Япония', time: '05:00' },
  { id: 233, series: 'wec', name: 'Bahrain 8 Hours', date: '2027-11-06', circuit: 'Бахрейн', country: 'Бахрейн', time: '14:00' },

  // ================= DTM - 2027 =================
  { id: 234, series: 'dtm', name: 'Red Bull Ring', date: '2027-04-25', circuit: 'Шпильберг', country: 'Австрия', time: '13:30' },
  { id: 235, series: 'dtm', name: 'Motorsport Arena', date: '2027-05-09', circuit: 'Ошерслебен', country: 'Германия', time: '13:30' },
  { id: 236, series: 'dtm', name: 'Lausitzring', date: '2027-06-20', circuit: 'Лаузицринг', country: 'Германия', time: '13:30' },
  { id: 237, series: 'dtm', name: 'Norisring', date: '2027-07-04', circuit: 'Нюрнберг', country: 'Германия', time: '13:30' },
  { id: 238, series: 'dtm', name: 'Circuit Zandvoort', date: '2027-08-08', circuit: 'Зандворт', country: 'Нидерланды', time: '13:30' },
  { id: 239, series: 'dtm', name: 'Nürburgring', date: '2027-08-22', circuit: 'Нюрбургринг', country: 'Германия', time: '13:30' },
  { id: 240, series: 'dtm', name: 'Sachsenring', date: '2027-09-26', circuit: 'Заксенринг', country: 'Германия', time: '13:30' },
  { id: 241, series: 'dtm', name: 'Hockenheimring', date: '2027-10-10', circuit: 'Хоккенхайм', country: 'Германия', time: '13:30' },

  // ================= SUPER GT - 2027 =================
  { id: 242, series: 'super_gt', name: 'Okayama GT', date: '2027-04-04', circuit: 'Окаяма', country: 'Япония', time: '07:30' },
  { id: 243, series: 'super_gt', name: 'Fuji GT 1', date: '2027-05-04', circuit: 'Фудзи', country: 'Япония', time: '07:30' },
  { id: 244, series: 'super_gt', name: 'Sepang GT', date: '2027-06-19', circuit: 'Сепанг', country: 'Малайзия', time: '09:00' },
  { id: 245, series: 'super_gt', name: 'Suzuka GT 1', date: '2027-08-01', circuit: 'Сузука', country: 'Япония', time: '07:30' },
  { id: 246, series: 'super_gt', name: '1000 km of Suzuka', date: '2027-09-05', circuit: 'Сузука', country: 'Япония', time: '06:00' },
  { id: 247, series: 'super_gt', name: 'Sugo GT', date: '2027-09-19', circuit: 'Суго', country: 'Япония', time: '07:30' },
  { id: 248, series: 'super_gt', name: 'Autopolis GT', date: '2027-10-17', circuit: 'Автополис', country: 'Япония', time: '07:30' },
  { id: 249, series: 'super_gt', name: 'Fuji GT 2', date: '2027-11-07', circuit: 'Фудзи', country: 'Япония', time: '07:30' },
  { id: 250, series: 'super_gt', name: 'Motegi GT', date: '2027-11-21', circuit: 'Мотеги', country: 'Япония', time: '07:00' },
];

const SERIES_INFO = {
  all: { label: 'Все', color: 'bg-white/20 text-white', activeClass: 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' },
  f1: { label: 'Formula 1', color: 'bg-red-500/20 text-red-400 border-red-500/30', activeClass: 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' },
  wec: { label: 'WEC', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', activeClass: 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]' },
  dtm: { label: 'DTM', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', activeClass: 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' },
  super_gt: { label: 'Super GT', color: 'bg-green-500/20 text-green-400 border-green-500/30', activeClass: 'bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.5)]' },
};

const YEARS = ['2026', '2027'];
const MONTHS = [
  { value: 'all', label: 'Все' },
  { value: '1', label: 'Январь' }, { value: '2', label: 'Февраль' }, { value: '3', label: 'Март' },
  { value: '4', label: 'Апрель' }, { value: '5', label: 'Май' }, { value: '6', label: 'Июнь' },
  { value: '7', label: 'Июль' }, { value: '8', label: 'Август' }, { value: '9', label: 'Сентябрь' },
  { value: '10', label: 'Октябрь' }, { value: '11', label: 'Ноябрь' }, { value: '12', label: 'Декабрь' },
];

export default function App() {
  const [activeSeries, setActiveSeries] = useState('all');
  const [activeYear, setActiveYear] = useState('2026');
  const [activeMonth, setActiveMonth] = useState('all');

  const filteredRaces = RACES.filter(r => {
    const d = new Date(r.date);
    const matchSeries = activeSeries === 'all' || r.series === activeSeries;
    const matchYear = d.getFullYear().toString() === activeYear;
    const matchMonth = activeMonth === 'all' || (d.getMonth() + 1).toString() === activeMonth;
    
    return matchSeries && matchYear && matchMonth;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500 pb-10">
      
      <header className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 p-4 pt-8 shadow-2xl">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <Flag className="text-red-500" /> Motorsport Tracker
        </h1>
        
        {/* Фильтр серий */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(SERIES_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setActiveSeries(key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeSeries === key 
                  ? info.activeClass 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              {info.label}
            </button>
          ))}
        </div>

        {/* Фильтр даты (Год и Месяц) */}
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide items-center">
          {YEARS.map(year => (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeYear === year ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {year}
            </button>
          ))}
          
          <div className="w-px h-5 bg-white/20 mx-1 shrink-0"></div>
          
          {/* Выпадающий список месяцев */}
          <div className="relative">
            <select
              value={activeMonth}
              onChange={(e) => setActiveMonth(e.target.value)}
              className="appearance-none bg-white/5 backdrop-blur-md text-white px-4 py-1.5 pr-8 rounded-lg text-xs font-semibold shadow-lg border border-white/20 outline-none focus:outline-none focus:ring-0 focus:border-white/30 cursor-pointer transition-all"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value} className="bg-gray-900 text-white">
                  {m.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Список гонок */}
      <main className="p-4 space-y-4">
        {filteredRaces.map((race) => (
          <div 
            key={race.id} 
            className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-xl active:scale-[0.98] transition-all flex justify-between items-stretch gap-2"
          >
            {/* Левая колонка */}
            <div className="flex flex-col items-start gap-3 flex-1">
              <div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase border ${SERIES_INFO[race.series].activeClass}`}>
                  {SERIES_INFO[race.series].label}
                </span>
              </div>
              
              <div className="mt-1">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white/95 leading-tight mb-2">
                  {race.name}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 text-gray-400 text-sm font-medium">
                  <MapPin size={14} className="text-gray-500 shrink-0" />
                  <span>{race.circuit}</span>
                  <span className="text-gray-600 mx-1">•</span>
                  <span>{new Date(race.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            </div>
            
            {/* Правая колонка */}
            <div className="flex pl-4 border-l border-white/10 shrink-0 sm:min-w-[140px] items-center">
               <div className="flex flex-col items-start justify-center">
                  <span className="text-sm text-gray-400 font-medium leading-none mb-2">{race.country}</span>
                  <span className="text-sm sm:text-base font-bold text-white whitespace-nowrap leading-none">
                    Гонка - <span className="text-indigo-300 font-semibold">{race.time}</span>
                  </span>
               </div>
            </div>
          </div>
        ))}

        {filteredRaces.length === 0 && (
          <div className="text-center text-gray-500 py-16 flex flex-col items-center gap-3">
            <Flag size={32} className="text-white/10" />
            <p>В этом месяце гонок нет</p>
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, MapPin, Globe, Smartphone,
  Sun, Cloud, CloudRain, CloudLightning, Snowflake
} from 'lucide-react';
import { getSeasonResults } from '../services/queries';

// Хэлпер для иконки погоды в зависимости от WMO-кода Open-Meteo
const getWeatherIcon = (code) => {
  if (code <= 3) return <Sun className="w-4 h-4 text-yellow-500" />;
  if (code >= 45 && code <= 48) return <Cloud className="w-4 h-4 text-gray-400" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-4 h-4 text-blue-400" />;
  if (code >= 71 && code <= 77) return <Snowflake className="w-4 h-4 text-blue-200" />;
  if (code >= 95) return <CloudLightning className="w-4 h-4 text-purple-400" />;
  return <Cloud className="w-4 h-4 text-gray-400" />;
};

// Хэлпер для строки информации о трассе
const TrackInfoRow = ({ icon, label, value, unit }) => (
  <div className="flex justify-between items-center py-2">
    <div className="flex items-center gap-2 text-white/50 text-[11px] font-bold uppercase tracking-wider">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-white font-bold text-[13px]">
      {value || '—'} {value && unit && <span className="text-white/50 font-normal text-[11px]">{unit}</span>}
    </div>
  </div>
);

export default function RaceModal({ race, isOpen, onClose, allRaces = [] }) {
  const [activeTab, setActiveTab] = useState('stage'); // 'stage' | 'overall'
  const [activeType, setActiveType] = useState('drivers'); // 'drivers' | 'teams'
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [results, setResults] = useState({ drivers: [], teams: [] });
  const [weather, setWeather] = useState(null);

  // БЕЗОПАСНАЯ дата гонки (гарантируем, что это всегда объект Date)
  const rDate = useMemo(() => {
    try {
      if (!race || !race.date) return new Date();
      return new Date(race.date);
    } catch (e) {
      return new Date();
    }
  }, [race]);

  // Эффект 1: Загрузка результатов гонки/сезона
  useEffect(() => {
    let isMounted = true;
    const fetchStandings = async () => {
      if (!race || !race.id || !Array.isArray(allRaces) || allRaces.length === 0) return;
      
      try {
        const pastRaces = allRaces.filter(r => r.date && new Date(r.date) <= rDate);
        const pastRaceIds = pastRaces.map(r => r.id);
        
        if (pastRaceIds.length === 0) return;
        
        const seasonData = await getSeasonResults(pastRaceIds);
        
        if (isMounted && seasonData) {
          // Высчитываем общий зачет и очки за текущий этап (безопасно с ?. и || [])
          const calcPoints = (type) => {
            const standings = {};
            const dataList = seasonData[type] || [];
            
            dataList.forEach(row => {
              const name = row.driver_name || row.team_name || 'Неизвестно';
              if (!standings[name]) {
                standings[name] = { name, total: 0, current: 0, team: row.team_name || '' };
              }
              standings[name].total += Number(row.points || 0);
              if (row.race_id === race.id) {
                standings[name].current += Number(row.points || 0);
              }
            });
            return Object.values(standings).sort((a, b) => b.total - a.total);
          };

          setResults({
            drivers: calcPoints('drivers'),
            teams: calcPoints('teams')
          });
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };

    fetchStandings();
    return () => { isMounted = false; };
  }, [race, allRaces, rDate]);

  // Эффект 2: Загрузка погоды
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      if (!race || !race.circuit) return;

      const now = new Date();
      const daysDiff = (rDate - now) / (1000 * 60 * 60 * 24);

      if (daysDiff >= -1 && daysDiff <= 8) {
        try {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(race.circuit)}&count=1&language=ru&format=json`);
          const geoData = await geoRes.json();

          if (geoData.results && geoData.results.length > 0) {
            const { latitude, longitude } = geoData.results[0];

            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
            const weatherData = await weatherRes.json();

            if (isMounted && weatherData?.daily?.time) {
              const targetDateStr = rDate.toISOString().split('T')[0];
              const dayIndex = weatherData.daily.time.findIndex(t => t === targetDateStr);

              if (dayIndex !== -1) {
                setWeather({
                  max: Math.round(weatherData.daily.temperature_2m_max[dayIndex]),
                  min: Math.round(weatherData.daily.temperature_2m_min[dayIndex]),
                  code: weatherData.daily.weathercode[dayIndex]
                });
              }
            }
          }
        } catch (e) {
          console.error("Weather fetch error:", e);
        }
      } else {
        if (isMounted) setWeather(null);
      }
    };

    fetchWeather();
    return () => { isMounted = false; };
  }, [race, rDate]);

  if (!isOpen || !race) return null;

  // Безопасное извлечение трассы и времени
  const circuitObj = race.circuits ? (Array.isArray(race.circuits) ? race.circuits[0] : race.circuits) : {};
  const currentList = results[activeType] || [];
  const displayList = isExpanded ? currentList : currentList.slice(0, 3);
  const isPastRace = rDate < new Date();
  
  // Безопасный рендер времени
  const timeStr = typeof race.time === 'string' ? race.time.slice(0, 5) : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-[400px] bg-[#1a1a1c] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="inline-flex px-3 py-1 bg-purple-500 rounded-lg text-white text-[10px] font-black tracking-wider uppercase mb-3">
              {race.series?.name || 'ВСЕ'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
              {race.name || 'Гран-при'}
            </h2>
            <div className="flex items-center text-white/50 text-sm">
              <MapPin className="w-4 h-4 mr-1.5" />
              {race.country}{race.circuit ? `, ${race.circuit}` : ''}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Дата и Время */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/50 tracking-wider uppercase mb-0.5">Дата</div>
              <div className="text-sm font-bold text-white">
                {rDate.getDate()} {rDate.toLocaleString('ru-RU', { month: 'long' })}
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-white/50 tracking-wider uppercase mb-0.5">Время старта</div>
              <div className="flex items-center justify-between text-sm font-bold text-white">
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-white/30" />{timeStr}</div>
                <div className="flex items-center gap-1"><Globe className="w-3 h-3 text-white/30" />{timeStr}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки экспорта и Вики */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white text-xs font-medium transition-colors">
            <Calendar className="w-3.5 h-3.5" />
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white text-xs font-medium transition-colors">
            <Smartphone className="w-3.5 h-3.5" />
            Apple
          </button>
          {circuitObj.wiki_url ? (
            <a 
              href={circuitObj.wiki_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white text-xs font-medium transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Вики
            </a>
          ) : (
            <button disabled className="flex items-center justify-center gap-2 py-2.5 bg-white/5 rounded-xl text-white/30 text-xs font-medium cursor-not-allowed">
              <Globe className="w-3.5 h-3.5" />
              Вики
            </button>
          )}
        </div>

        {/* Результаты (только для прошедших гонок) */}
        {isPastRace && currentList.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center w-full gap-2 mb-4">
              <div className="flex flex-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('stage')}
                  className={`flex-1 h-8 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === 'stage' ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)] text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Итоги этапа
                </button>
                <button
                  onClick={() => setActiveTab('overall')}
                  className={`flex-1 h-8 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === 'overall' ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)] text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Общий зачёт
                </button>
              </div>

              <div className="flex flex-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveType('drivers')}
                  className={`flex-1 h-8 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                    activeType === 'drivers' ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)] text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  По пилотам
                </button>
                <button
                  onClick={() => setActiveType('teams')}
                  className={`flex-1 h-8 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                    activeType === 'teams' ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)] text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  По командам
                </button>
              </div>
            </div>

            {isExpanded && (
              <button 
                onClick={() => setIsExpanded(false)}
                className="w-full py-2 mb-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                Свернуть список
              </button>
            )}

            <div className="space-y-1">
              {displayList.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 hover:bg-white/5 rounded-xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 font-black text-sm w-4 text-center">{index + 1}</span>
                    <div>
                      <div className="text-white font-bold text-sm leading-none mb-1">{item.name}</div>
                      {activeType === 'drivers' && <div className="text-white/30 text-[10px] uppercase font-bold tracking-wider leading-none">{item.team}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTab === 'overall' && item.current > 0 && (
                      <span className="text-green-400 text-xs font-bold">+{item.current}</span>
                    )}
                    <span className="text-white font-black text-sm w-6 text-right">
                      {activeTab === 'stage' ? item.current : item.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {!isExpanded && currentList.length > 3 && (
              <button 
                onClick={() => setIsExpanded(true)}
                className="w-full mt-3 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                Развернуть весь список
              </button>
            )}
          </div>
        )}

        {!isExpanded && (
          <div>
            <div className="text-white font-black text-[13px] tracking-wider uppercase mb-4">
              Информация о трассе
            </div>
            
            <div className="space-y-1">
              <TrackInfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Рекорд" value={circuitObj.lap_record} />
              <TrackInfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Длина" value={circuitObj.length_km} unit="км" />
              <TrackInfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Повороты" value={circuitObj.turns} unit="пов." />
              
              {weather && (
                <div className="flex justify-between items-center py-2 mt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/50 text-[11px] font-bold uppercase tracking-wider">
                    {getWeatherIcon(weather.code)}
                    <span>Прогноз на гонку</span>
                  </div>
                  <div className="text-white font-bold text-[13px]">
                    {weather.max}°C <span className="text-white/50 font-normal">/ {weather.min}°C</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

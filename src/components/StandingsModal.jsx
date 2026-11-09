import React, { useState, useEffect } from 'react';
import { Trophy, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getF1Standings } from '../services/queries';

const getTeamColor = (teamName) => {
  if (!teamName) return 'bg-gray-500';
  const name = teamName.toLowerCase();
  if (name.includes('red bull')) return 'bg-blue-800';
  if (name.includes('mclaren')) return 'bg-orange-500';
  if (name.includes('ferrari')) return 'bg-red-600';
  if (name.includes('mercedes')) return 'bg-teal-400';
  if (name.includes('aston')) return 'bg-emerald-600';
  if (name.includes('alpine')) return 'bg-pink-500';
  if (name.includes('williams')) return 'bg-blue-500';
  if (name.includes('haas')) return 'bg-white';
  if (name.includes('sauber') || name.includes('audi')) return 'bg-green-500';
  if (name.includes('racing bulls') || name.includes('rb')) return 'bg-blue-600';
  if (name.includes('cadillac')) return 'bg-yellow-500';
  return 'bg-gray-500';
};

export const StandingsModal = ({ isOpen, onClose, lang = 'ru', year }) => {
  const [activeTab, setActiveTab] = useState('drivers');
  const [isExpanded, setIsExpanded] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    
    // Сбрасываем разворот при новом открытии
    setIsExpanded(false); 
    
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await getF1Standings(year);
        if (isMounted) {
          setDrivers(data?.drivers || []);
          setTeams(data?.teams || []);
        }
      } catch (error) {
        console.error('Ошибка загрузки зачета F1 из БД:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, year]);

  if (!isOpen) return null;

  // Функция для рендера списка (Пилоты или Команды)
  const renderList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    const data = activeTab === 'drivers' ? drivers : teams;
    
    if (data.length === 0) {
      return (
        <div className="text-zinc-500 text-center py-10">
          {lang === 'ru' ? 'Данные отсутствуют' : 'No data available'}
        </div>
      );
    }

    // Показываем либо всё, либо только Топ-5
    const visibleData = isExpanded ? data : data.slice(0, 5);

    return (
      <div className="flex flex-col gap-1.5">
        {visibleData.map((item, index) => (
          <div 
            key={item.name || index} 
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-zinc-500 w-5 text-center">{index + 1}</span>
              <div className={`w-1 h-6 rounded-full ${getTeamColor(item.team_name || item.name)}`}></div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">{item.name}</div>
                {activeTab === 'drivers' && (
                  <div className="text-zinc-500 text-[10px] font-medium mt-0.5">{item.team_name}</div>
                )}
              </div>
            </div>
            <div className="text-white font-black text-base">{item.points}</div>
          </div>
        ))}

        {/* Кнопка "Показать все / Свернуть" */}
        {data.length > 5 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isExpanded 
              ? (lang === 'ru' ? 'Свернуть' : 'Show Less') 
              : (lang === 'ru' ? 'Показать все' : 'Show All')
            }
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 transition-opacity duration-300 backdrop-blur-sm">
      <div className="bg-[#11131a] border border-white/10 rounded-2xl w-full max-w-lg shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col transform transition-transform duration-300">
        
        {/* Шапка модалки */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {lang === 'ru' ? 'Общий зачёт F1' : 'F1 Standings'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex items-center gap-2 p-5 pb-0 shrink-0">
          <button 
            onClick={() => { setActiveTab('drivers'); setIsExpanded(false); }}
            className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${
              activeTab === 'drivers' 
                ? 'bg-white/5 text-white border-b-2 border-amber-500' 
                : 'text-zinc-500 hover:text-white border-b-2 border-transparent'
            }`}
          >
            {lang === 'ru' ? 'Пилоты' : 'Drivers'}
          </button>
          <button 
            onClick={() => { setActiveTab('teams'); setIsExpanded(false); }}
            className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${
              activeTab === 'teams' 
                ? 'bg-white/5 text-white border-b-2 border-amber-500' 
                : 'text-zinc-500 hover:text-white border-b-2 border-transparent'
            }`}
          >
            {lang === 'ru' ? 'Команды' : 'Teams'}
          </button>
        </div>

        {/* Контейнер списка (Динамическая высота, скрытый скроллбар) */}
        <div className="p-5 overflow-y-auto max-h-[65vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {renderList()}
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
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
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

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
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, year]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 transition-opacity duration-300 backdrop-blur-sm">
      <div className="bg-[#11131a] border border-white/10 rounded-2xl w-full max-w-lg shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col transform transition-transform duration-300">
        
        <div className="flex items-center justify-between p-5 border-b border-white/10">
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

        <div className="flex items-center gap-2 p-5 pb-0">
          <button 
            onClick={() => setActiveTab('drivers')}
            className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${
              activeTab === 'drivers' 
                ? 'bg-white/5 text-white border-b-2 border-amber-500' 
                : 'text-zinc-500 hover:text-white border-b-2 border-transparent'
            }`}
          >
            {lang === 'ru' ? 'Пилоты' : 'Drivers'}
          </button>
          <button 
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${
              activeTab === 'teams' 
                ? 'bg-white/5 text-white border-b-2 border-amber-500' 
                : 'text-zinc-500 hover:text-white border-b-2 border-transparent'
            }`}
          >
            {lang === 'ru' ? 'Команды' : 'Teams'}
          </button>
        </div>

        <div className="p-5 flex flex-col gap-2 h-[340px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activeTab === 'drivers' ? (
            drivers.length > 0 ? (
              drivers.map((driver, index) => (
                <div 
                  key={driver.name || index} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-zinc-500 w-5 text-center">{index + 1}</span>
                    <div className={`w-1 h-8 rounded-full ${getTeamColor(driver.team_name)}`}></div>
                    <div>
                      <div className="text-white font-bold text-sm">{driver.name}</div>
                      <div className="text-zinc-500 text-xs font-medium">{driver.team_name}</div>
                    </div>
                  </div>
                  <div className="text-white font-black text-lg">{driver.points}</div>
                </div>
              ))
            ) : (
              <div className="text-zinc-500 text-center mt-10">
                {lang === 'ru' ? 'Данные о пилотах пока отсутствуют' : 'No driver data available'}
              </div>
            )
          ) : (
            teams.length > 0 ? (
              teams.map((team, index) => (
                <div 
                  key={team.name || index} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-zinc-500 w-5 text-center">{index + 1}</span>
                    <div className={`w-1 h-8 rounded-full ${getTeamColor(team.name)}`}></div>
                    <div className="text-white font-bold text-sm">{team.name}</div>
                  </div>
                  <div className="text-white font-black text-lg">{team.points}</div>
                </div>
              ))
            ) : (
              <div className="text-zinc-500 text-center mt-10">
                {lang === 'ru' ? 'Данные о командах пока отсутствуют' : 'No team data available'}
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};

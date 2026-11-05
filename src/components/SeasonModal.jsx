import React from 'react';
import { X, Trophy, Users, User, Loader2 } from 'lucide-react';

export const SeasonModal = ({ 
  showSeasonStandingsModal, setShowSeasonStandingsModal, 
  activeYear, seasonStandingsTab, setSeasonStandingsTab, 
  seasonLoading, seasonDrivers, seasonTeams, t 
}) => {
  if (!showSeasonStandingsModal) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto transition-opacity" 
        style={{ animation: 'fadeIn 0.3s ease-out forwards' }} 
        onClick={() => setShowSeasonStandingsModal(false)}
      />
      
      <div 
        className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/10 w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl p-6 pointer-events-auto relative z-10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col" 
        style={{ animation: 'modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
        
        <button 
          onClick={() => setShowSeasonStandingsModal(false)} 
          className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="mb-4 pr-8">
          <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border mb-2 bg-amber-500/20 text-amber-300 border-amber-500/30">
            Formula 1 • {activeYear}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-amber-400 w-5 h-5" /> {t.seasonStandings}
          </h2>
          <p className="text-gray-400 text-xs mt-1">{t.seasonSubtitle}</p>
        </div>

        <div className="flex bg-white/[0.08] p-1.5 rounded-2xl border border-white/10 mb-4 shrink-0 shadow-inner">
          <button 
            onClick={() => setSeasonStandingsTab('drivers')} 
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
              seasonStandingsTab === 'drivers' 
                ? 'bg-amber-500 text-black shadow-[0_0_18px_rgba(245,158,11,0.45)]' 
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <User size={14}/> {t.individualStandings}
          </button>
          <button 
            onClick={() => setSeasonStandingsTab('teams')} 
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
              seasonStandingsTab === 'teams' 
                ? 'bg-amber-500 text-black shadow-[0_0_18px_rgba(245,158,11,0.45)]' 
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={14}/> {t.constructorsCup}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar divide-y divide-white/5 pr-1">
          {seasonLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
              <p className="text-gray-400 text-xs">{t.pointsCalculating}</p>
            </div>
          ) : (seasonStandingsTab === 'drivers' ? seasonDrivers : seasonTeams).length === 0 ? (
            <div className="text-center text-gray-500 text-xs py-12">{t.noPastRacesInSeason}</div>
          ) : (
            (seasonStandingsTab === 'drivers' ? seasonDrivers : seasonTeams).map((item) => (
              <div key={item.driver_name || item.team_name} className="flex justify-between items-center py-2.5 px-2 hover:bg-white/[0.03] rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-5 text-center font-bold text-sm ${
                    item.position === 1 ? 'text-amber-400' : 
                    item.position === 2 ? 'text-gray-300' : 
                    item.position === 3 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {item.position}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white/95">{item.driver_name || item.team_name}</div>
                    {item.driver_name && <div className="text-[10px] text-gray-400 uppercase tracking-wider">{item.team_name}</div>}
                  </div>
                </div>
                <div className="text-right flex items-baseline gap-1">
                  <span className="text-indigo-300 font-extrabold text-sm sm:text-base">{item.points}</span>
                  <span className="text-[10px] text-indigo-400/70 font-bold uppercase tracking-wider">PTS</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

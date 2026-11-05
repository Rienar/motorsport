import React, { useState } from 'react';
import { 
  MapPin, Clock, X, Gauge, Ruler, Cloud, Navigation, 
  Trophy, CalendarPlus, Download, ChevronDown, ChevronUp, 
  Users, User, Loader2, ExternalLink, Radio 
} from 'lucide-react';
import { SERIES_CONFIG } from '../constants/seriesConfig';

export const RaceModal = ({ 
  dayRacesModal, activeRaceIndex, setActiveRaceIndex, 
  selectedRace, setDayRacesModal, cInfo, currentLive, 
  isPastRace, isF1, standingsScope, setStandingsScope, 
  standingsLoading, activeList, isStandingsExpanded, setIsStandingsExpanded, 
  standingsTab, setStandingsTab, driverStandings, cumulativeDrivers, 
  handleAddToCalendar, lang, t 
}) => {
  if (!selectedRace) return null;

  const hasMultipleRaces = dayRacesModal && dayRacesModal.length > 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto transition-opacity" 
        style={{ animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} 
        onClick={() => setDayRacesModal(null)}
      ></div>
      
      <div 
        className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto hide-scrollbar rounded-3xl p-6 pointer-events-auto relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]" 
        style={{ animation: 'modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <button 
          onClick={() => setDayRacesModal(null)} 
          className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors z-20"
        >
          <X size={20} />
        </button>

        {/* Переключатель между гонками одного дня */}
        {hasMultipleRaces && (
          <div className="mb-4 pr-10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              {t.eventsOnDay} ({dayRacesModal.length}):
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {dayRacesModal.map((rItem, rIdx) => {
                const isTabActive = rIdx === activeRaceIndex;
                const sItemCfg = SERIES_CONFIG[rItem.series.toLowerCase()] || SERIES_CONFIG.all;
                return (
                  <button
                    key={rItem.id || rIdx}
                    onClick={() => setActiveRaceIndex(rIdx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                      isTabActive 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${sItemCfg.activeClass}`}></span>
                    <span>{rItem.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-6 pr-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border ${SERIES_CONFIG[selectedRace.series]?.activeClass || 'bg-white/20 text-white'}`}>
              {SERIES_CONFIG[selectedRace.series]?.label[lang] || selectedRace.series}
            </span>
            {currentLive && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600/30 border border-red-500/50 text-red-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
                <Radio size={12} /> {t.liveSession}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2 text-white">{selectedRace.name}</h2>
          <div className="text-gray-400 flex flex-wrap items-center gap-2 text-sm">
            <MapPin size={15} className="text-gray-500" /> 
            <span>{selectedRace.country}, {cInfo?.name || selectedRace.circuit}</span>
            {cInfo?.wiki_url && (
              <a 
                href={cInfo.wiki_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 underline underline-offset-2 ml-1"
              >
                {t.wikiLink} <ExternalLink size={11} />
              </a>
            )}
            <span className="text-gray-600">•</span>
            <span>{selectedRace.parsedDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Характеристики трассы */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
            <div className="text-gray-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"><Ruler size={14}/> {t.trackLength}</div>
            <div className="text-base font-bold text-white">{cInfo?.length_km ? `${cInfo.length_km} ${lang === 'ru' ? 'км' : 'km'}` : '—'}</div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
            <div className="text-gray-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"><Gauge size={14}/> {t.lapRecord}</div>
            <div className="text-base font-bold text-white">{cInfo?.lap_record || '—'}</div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
            <div className="text-gray-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"><Navigation size={14}/> {t.turns}</div>
            <div className="text-base font-bold text-white">{cInfo?.turns ? cInfo.turns : '—'}</div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
            <div className="text-gray-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"><Cloud size={14}/> {t.weather}</div>
            <div className="text-sm font-bold text-white">Ожидается</div>
          </div>
        </div>

        {/* Результаты F1 */}
        {(isPastRace || currentLive) && isF1 && (
          <div className="mb-6 bg-black/40 border border-white/5 rounded-2xl p-4 overflow-hidden transition-all duration-300 min-h-[160px] relative">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy size={15} className="text-amber-400"/> 
                {standingsScope === 'race' ? t.stageResults : t.afterStage}
              </h3>

              <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 text-[11px]">
                <button 
                  onClick={() => setStandingsScope('race')} 
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${standingsScope === 'race' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                  {t.tabRace}
                </button>
                <button 
                  onClick={() => setStandingsScope('cumulative')} 
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${standingsScope === 'cumulative' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                  {t.tabAfterRace}
                </button>
              </div>
            </div>
            
            {standingsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 rounded-2xl">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              </div>
            ) : activeList.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-4">
                {currentLive ? t.resultsInProgress : t.resultsNotReady}
              </div>
            ) : (
              <>
                {!isStandingsExpanded ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] uppercase text-gray-500 font-bold mb-2">
                        {standingsScope === 'race' ? `${t.drivers} (Top-3)` : `${t.individualStandings} (Top-3)`}
                      </div>
                      {(standingsScope === 'race' ? driverStandings : cumulativeDrivers).slice(0, 3).map((d) => (
                        <div key={d.id || d.driver_name} className="flex justify-between items-center text-sm py-1.5 border-b border-white/5 last:border-0">
                          <div className="flex gap-3 items-center">
                            <span className={`font-bold w-3 text-xs ${d.position === 1 ? 'text-amber-400' : d.position === 2 ? 'text-gray-300' : 'text-amber-600'}`}>
                              {d.position}
                            </span>
                            <div>
                              <span className="text-white font-medium">{d.driver_name}</span>
                              <span className="text-gray-500 text-[10px] ml-2">{d.team_name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-indigo-300 font-bold text-xs">{d.points} PTS</span>
                            {standingsScope === 'cumulative' && d.delta > 0 && (
                              <span className="text-[10px] text-emerald-400 ml-1.5 font-semibold">+{d.delta}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setIsStandingsExpanded(true)}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-colors flex items-center justify-center gap-1"
                    >
                      {t.fullStandings} <ChevronDown size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
                    <div className="flex bg-white/5 p-1 rounded-xl">
                      <button onClick={() => setStandingsTab('drivers')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${standingsTab === 'drivers' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                        <User size={14}/> {t.drivers}
                      </button>
                      <button onClick={() => setStandingsTab('teams')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${standingsTab === 'teams' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                        <Users size={14}/> {t.teams}
                      </button>
                    </div>

                    <div className="max-h-52 overflow-y-auto hide-scrollbar pr-1 divide-y divide-white/5">
                      {activeList.map((item) => (
                        <div key={item.id || item.driver_name || item.team_name} className="flex justify-between items-center text-sm py-2">
                          <div className="flex gap-3 items-center">
                            <span className={`font-bold w-4 text-center ${item.position === 1 ? 'text-amber-400' : item.position === 2 ? 'text-gray-300' : item.position === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                              {item.position}
                            </span>
                            <div>
                              <div className="text-white font-medium text-xs sm:text-sm">{item.driver_name || item.team_name}</div>
                              {item.driver_name && <div className="text-[10px] text-gray-500 uppercase">{item.team_name}</div>}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-indigo-300 font-bold text-xs sm:text-sm">{item.points} <span className="text-[10px] text-indigo-500/60">PTS</span></span>
                            {standingsScope === 'cumulative' && item.delta > 0 && (
                              <span className="text-[10px] text-emerald-400 ml-1.5 font-bold">+{item.delta}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setIsStandingsExpanded(false)}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-300 transition-colors flex items-center justify-center gap-1"
                    >
                      {t.collapse} <ChevronUp size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Календарный блок */}
        {!isPastRace && !currentLive && (
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
             <div>
                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock size={12} /> {t.yourTime}
                </div>
                <div className="text-2xl font-extrabold text-indigo-200">
                  {selectedRace.parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">{t.localTime}: {selectedRace.time}</div>
             </div>
             
             <div className="flex items-center gap-2 z-10">
                <button 
                  onClick={(e) => handleAddToCalendar(e, 'google', selectedRace)}
                  className="p-2.5 bg-white/5 hover:bg-indigo-500 hover:border-indigo-400 border border-white/10 rounded-xl text-indigo-200 transition-all shadow-lg"
                  title="Google Calendar"
                >
                  <CalendarPlus size={18} />
                </button>
                <button 
                  onClick={(e) => handleAddToCalendar(e, 'ics', selectedRace)}
                  className="p-2.5 bg-white/5 hover:bg-white/20 border border-white/10 rounded-xl text-gray-300 transition-all shadow-lg"
                  title="Download .ics"
                >
                  <Download size={18} />
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

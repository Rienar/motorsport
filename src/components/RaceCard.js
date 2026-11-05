import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { SERIES_CONFIG } from '../constants/seriesConfig';

export const RaceCard = ({ race, isLive, isNext, cInfo, onClick, lang, t }) => {
  const seriesCfg = SERIES_CONFIG[race.series] || { label: { ru: race.series }, activeClass: 'bg-white/20 text-white' };

  return (
    <div 
      onClick={onClick}
      className={`group bg-white/5 backdrop-blur-lg border rounded-2xl p-4 active:scale-[0.98] transition-all flex justify-between items-stretch gap-2 relative cursor-pointer hover:bg-white/10 ${
        isLive ? 'border-red-500/75 shadow-[0_0_25px_rgba(239,68,68,0.3)] bg-red-950/20' : 
        isNext ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/10 shadow-xl'
      }`}
    >
      {isLive && (
        <div className="absolute -top-3 left-4 bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span> LIVE
        </div>
      )}
      {!isLive && isNext && (
        <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
          {t.soon}
        </div>
      )}

      <div className="flex flex-col items-start gap-3 flex-1">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase border ${seriesCfg.activeClass}`}>
          {seriesCfg.label[lang] || seriesCfg.label.ru}
        </span>
        <div className="mt-1">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white/95 leading-tight mb-2">{race.name}</h2>
          <div className="flex flex-wrap items-center gap-1.5 text-gray-400 text-sm font-medium">
            <MapPin size={14} className="text-gray-500 shrink-0" />
            {cInfo?.wiki_url ? (
              <a href={cInfo.wiki_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-300 hover:text-white underline decoration-white/20 hover:decoration-white transition-colors flex items-center gap-1">
                <span>{cInfo.name || race.circuit}</span>
                <ExternalLink size={11} className="text-gray-500 group-hover:text-gray-300" />
              </a>
            ) : (
              <span>{cInfo?.name || race.circuit}</span>
            )}
            <span className="text-gray-600 mx-1">•</span>
            <span>{race.parsedDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      <div className="flex pl-4 border-l border-white/10 shrink-0 min-w-[130px] sm:min-w-[150px] items-center">
        <div className="flex flex-col items-start justify-center w-full">
            <span className="text-sm text-gray-400 font-medium leading-none mb-3 truncate w-full">{race.country}</span>
            <div className="w-full flex justify-between items-center gap-2 mb-1.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">{t.localTime}</span>
              <span className="text-sm font-bold text-gray-400 whitespace-nowrap">{race.time}</span>
            </div>
            <div className="w-full flex justify-between items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wide ${isLive ? 'text-red-400' : 'text-indigo-400/80'}`}>{isLive ? 'LIVE' : t.yourTime}</span>
              <span className={`text-sm sm:text-base font-bold whitespace-nowrap leading-none ${isLive ? 'text-red-300 font-mono' : 'text-indigo-300'}`}>
                {isLive ? 'LIVE' : race.parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
        </div>
      </div>
    </div>
  );
};

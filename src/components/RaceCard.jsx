import React from 'react';
import { getSeriesConfig } from '../constants/seriesConfig';

export default function RaceCard({ race, onClick, isSelected }) {
  const seriesConfig = getSeriesConfig(race.series || race.series_id);
  const raceDate = new Date(race.date);
  const formattedDate = raceDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  const seriesLabel = race.series?.short_name || seriesConfig.shortName;

  return (
    <div
      onClick={() => onClick && onClick(race)}
      className={`group relative flex flex-col justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 ${
        seriesConfig.borderClass
      } border-l-4 ${isSelected ? 'ring-2 ring-red-500/50 bg-zinc-900' : ''}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${seriesConfig.badgeClass}`}
          >
            {seriesLabel}
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            {formattedDate} {race.time ? `• ${race.time.slice(0, 5)}` : ''}
          </span>
        </div>

        <h3 className="font-semibold text-zinc-100 group-hover:text-white text-base leading-snug line-clamp-1">
          {race.name}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
          {race.circuit || race.circuits?.name || 'Трасса уточняется'}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
        <span>{race.country || race.circuits?.country || ''}</span>
        {race.circuits?.length_km && (
          <span>{race.circuits.length_km} км</span>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { getSeriesConfig } from '../constants/seriesConfig';

export default function RaceModal({ race, onClose }) {
  if (!race) return null;

  const seriesConfig = getSeriesConfig(race.series || race.series_id);
  const seriesTitle = race.series?.name || seriesConfig.name;
  const seriesShort = race.series?.short_name || seriesConfig.shortName;

  const raceDate = new Date(race.date);
  const formattedDate = raceDate.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Хедер модалки */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${seriesConfig.badgeClass}`}
              >
                {seriesShort}
              </span>
              <span className="text-xs text-zinc-400 uppercase tracking-wider">
                {seriesTitle} • Сезон {race.season || raceDate.getFullYear()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{race.name}</h2>
            <p className="text-sm text-zinc-400 mt-1 capitalize">{formattedDate}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Инфо о трассе */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
              <div className="text-xs text-zinc-400">Трасса</div>
              <div className="font-semibold text-zinc-200 mt-0.5 text-sm">
                {race.circuit || race.circuits?.name || '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
              <div className="text-xs text-zinc-400">Страна</div>
              <div className="font-semibold text-zinc-200 mt-0.5 text-sm">
                {race.country || race.circuits?.country || '—'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
              <div className="text-xs text-zinc-400">Длина круга</div>
              <div className="font-semibold text-zinc-200 mt-0.5 text-sm">
                {race.circuits?.length_km ? `${race.circuits.length_km} км` : '—'}
              </div>
            </div>

            {race.circuits?.turns && (
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                <div className="text-xs text-zinc-400">Повороты</div>
                <div className="font-semibold text-zinc-200 mt-0.5 text-sm">
                  {race.circuits.turns}
                </div>
              </div>
            )}

            {race.circuits?.lap_record && (
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 col-span-2">
                <div className="text-xs text-zinc-400">Рекорд круга</div>
                <div className="font-semibold text-zinc-200 mt-0.5 text-sm">
                  {race.circuits.lap_record}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Radio } from 'lucide-react';
import { getSeriesConfig, DEFAULT_CONFIG } from '../constants/seriesConfig';

export default function RaceCard({ race, onClick, isLive = false, lang = 'ru', t = {} }) {
  if (!race) return null;

  // Извлекаем серию конкретной гонки, игнорируя фильтр ALL
  const seriesRaw = race.series_id || race.series;
  const sCfg = getSeriesConfig(seriesRaw) || DEFAULT_CONFIG;
  const seriesBadgeLabel = sCfg.code !== 'all' 
    ? (sCfg.shortLabel ? (sCfg.shortLabel[lang] || sCfg.shortLabel) : (sCfg.label?.[lang] || 'RACE'))
    : ((typeof race.series === 'object' ? race.series?.code || race.series?.short_name : race.series) || 'RACE').toUpperCase();

  const raceDate = useMemo(() => {
    return race.parsedDate instanceof Date && !isNaN(race.parsedDate)
      ? race.parsedDate
      : new Date(race.date);
  }, [race]);

  const countdown = useMemo(() => {
    if (isLive) {
      return { status: 'live', text: lang === 'ru' ? 'Прямой эфир' : 'LIVE NOW' };
    }

    const now = new Date();
    const diff = raceDate.getTime() - now.getTime();

    if (diff <= 0) {
      return null;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    if (days > 0) {
      return { 
        status: 'upcoming', 
        text: lang === 'ru' ? `Через ${days} д ${hours} ч` : `In ${days}d ${hours}h` 
      };
    }

    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return { 
      status: 'upcoming', 
      text: lang === 'ru' ? `Через ${hours} ч ${minutes} м` : `In ${hours}h ${minutes}m` 
    };
  }, [raceDate, isLive, lang]);

  const formattedDate = useMemo(() => {
    return raceDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      weekday: 'short'
    });
  }, [raceDate, lang]);

  const trackLocalTime = useMemo(() => {
    if (race.local_time) return race.local_time;
    return raceDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [raceDate, race.local_time, lang]);

  const moscowTime = useMemo(() => {
    return raceDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [raceDate, lang]);

  const roundTitle = race.round 
    ? (lang === 'ru' ? `Этап ${race.round}` : `Round ${race.round}`)
    : (race.stage || '');

  const countryName = race.country || race.location_country || '';
  const circuitName = race.circuit || race.location || '';
  const wikiLink = race.wiki_url || race.wikipedia_url || race.wiki || null;

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col md:flex-row md:items-center justify-between w-full bg-[#0a0b10]/95 hover:bg-[#0e1017] border rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl gap-3 sm:gap-4 overflow-hidden ${
        isLive 
          ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-1 ring-red-500/40' 
          : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Фоновое свечение в цвет серии */}
      <div 
        className={`absolute -left-10 top-0 bottom-0 w-24 rounded-full blur-3xl pointer-events-none opacity-20 ${sCfg.dotColor || 'bg-white'}`}
      />

      {/* Левый блок: Бейдж серии, этап, название гонки, страна и трек */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 flex-1 min-w-0 z-10">
        <div className="flex items-center gap-2 shrink-0">
          <span 
            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-sm ${sCfg.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dotColor}`} />
            {seriesBadgeLabel}
          </span>

          {roundTitle && (
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
              {roundTitle}
            </span>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors truncate font-sans tracking-tight">
            {race.name || 'Race'}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate mt-0.5">
            <MapPin size={13} className="text-zinc-500 shrink-0" />
            {countryName && <span className="font-semibold text-zinc-300">{countryName}, </span>}
            <span className="truncate text-zinc-400">{circuitName || 'TBA'}</span>
          </div>
        </div>
      </div>

      {/* Правый блок: Дата с красным акцентом, времена, статус и вики */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-3 sm:gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.06] shrink-0 z-10">
        {/* Бейдж даты */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 font-mono text-xs font-bold tracking-tight shadow-sm">
          <Calendar size={13} className="text-red-400 shrink-0" />
          <span>{formattedDate}</span>
        </div>

        {/* Блок времен: Местное (серое) и МСК (ярко-белое) */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <Clock size={13} className="text-zinc-600 shrink-0 hidden sm:inline" />
          
          <span className="text-zinc-500" title="Локальное время автодрома">
            <span className="text-zinc-600">{lang === 'ru' ? 'Местное:' : 'Track:'}</span>{' '}
            <span className="text-zinc-400 font-medium">{trackLocalTime}</span>
          </span>

          <span className="text-zinc-700">•</span>

          <span className="text-zinc-400" title="Время по Москве (UTC+3)">
            <span className="text-zinc-500">{lang === 'ru' ? 'МСК:' : 'MSK:'}</span>{' '}
            <span className="text-white font-bold drop-shadow-sm">{moscowTime}</span>
          </span>
        </div>

        {/* Таймер до старта или прямой эфир */}
        {countdown && (
          <div className="flex items-center text-xs font-mono font-bold shrink-0">
            {countdown.status === 'live' ? (
              <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2.5 py-1 rounded-xl border border-red-500/20 animate-pulse">
                <Radio size={11} className="animate-spin" />
                {countdown.text}
              </span>
            ) : (
              <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                {countdown.text}
              </span>
            )}
          </div>
        )}

        {/* Ссылка на статью */}
        {wikiLink && (
          <a
            href={wikiLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={lang === 'ru' ? 'Статья в Wikipedia' : 'Wikipedia'}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition-all shrink-0"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Radio } from 'lucide-react';
import { getSeriesConfig, DEFAULT_CONFIG } from '../constants/seriesConfig';

export default function RaceCard({ race, onClick, isLive = false, lang = 'ru', t = {} }) {
  if (!race) return null;

  // Конфигурация бейджа серии (совпадает с верхними фильтрами)
  const sCfg = getSeriesConfig(race.series_id || race.series) || DEFAULT_CONFIG;
  const seriesBadgeLabel = sCfg.shortLabel ? (sCfg.shortLabel[lang] || sCfg.shortLabel) : (sCfg.label?.[lang] || 'RACE');

  // Парсинг даты
  const raceDate = useMemo(() => {
    return race.parsedDate instanceof Date && !isNaN(race.parsedDate)
      ? race.parsedDate
      : new Date(race.date);
  }, [race]);

  // Расчёт статуса / обратного отсчёта
  const countdown = useMemo(() => {
    if (isLive) {
      return { status: 'live', text: lang === 'ru' ? 'Прямой эфир' : 'LIVE NOW' };
    }

    const now = new Date();
    const diff = raceDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { status: 'finished', text: lang === 'ru' ? 'Завершена' : 'Finished' };
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

  // Дата проведения
  const formattedDate = useMemo(() => {
    return raceDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      weekday: 'short'
    });
  }, [raceDate, lang]);

  // Время автодрома (Local / Track Time)
  const trackLocalTime = useMemo(() => {
    if (race.local_time) return race.local_time;
    return raceDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [raceDate, race.local_time, lang]);

  // Время по Москве (UTC+3, MSK)
  const moscowTime = useMemo(() => {
    return raceDate.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [raceDate, lang]);

  // Название раунда / этапа
  const roundTitle = race.round 
    ? (lang === 'ru' ? `Этап ${race.round}` : `Round ${race.round}`)
    : (race.stage || '');

  // Страна проведения
  const countryName = race.country || race.location_country || '';

  // Ссылка на Википедию
  const wikiLink = race.wiki_url || race.wikipedia_url || race.wiki || null;

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between bg-[#0a0b10]/95 hover:bg-[#0e1017] border rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:scale-[1.01] overflow-hidden ${
        isLive 
          ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-1 ring-red-500/40' 
          : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Декоративное свечение в цвет серии */}
      <div 
        className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-3xl pointer-events-none opacity-25 ${sCfg.dotColor || 'bg-white'}`}
      />

      <div>
        {/* Верхняя панель: Раунд/Этап и Фирменный бейдж серии */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
            {roundTitle}
          </span>

          <span 
            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-sm ${sCfg.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dotColor}`} />
            {seriesBadgeLabel}
          </span>
        </div>

        {/* Название Гран-при / Гонки */}
        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-2 font-sans tracking-tight">
          {race.name}
        </h3>

        {/* Локация: Страна и Трасса */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-3 truncate">
          <MapPin size={13} className="text-zinc-500 shrink-0" />
          <span className="font-semibold text-zinc-300">{countryName ? `${countryName}, ` : ''}</span>
          <span className="truncate text-zinc-400">{race.circuit || race.location || 'Unknown Circuit'}</span>
        </div>
      </div>

      {/* Нижний блок: Дата, Локальное время, МСК и Статус */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2 mt-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          {/* Дата этапа */}
          <div className="flex items-center gap-1.5 text-zinc-300 font-mono">
            <Calendar size={13} className="text-zinc-500" />
            <span>{formattedDate}</span>
          </div>

          {/* Статус / Таймер обратного отсчета */}
          <div className="flex items-center gap-1 text-xs font-mono font-bold">
            {countdown.status === 'live' ? (
              <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 animate-pulse">
                <Radio size={11} className="animate-spin" />
                {countdown.text}
              </span>
            ) : countdown.status === 'upcoming' ? (
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                {countdown.text}
              </span>
            ) : (
              <span className="text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-lg border border-white/5">
                {countdown.text}
              </span>
            )}
          </div>
        </div>

        {/* Строка со временем: Локальное время автодрома и МСК */}
        <div className="flex items-center justify-between text-xs font-mono pt-1">
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={13} className="text-zinc-500 shrink-0" />
            <span title="Локальное время трека">
              <span className="text-zinc-500">{lang === 'ru' ? 'Местное:' : 'Track:'}</span> {trackLocalTime}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-amber-400/90 font-semibold" title="Время по Москве (UTC+3)">
              <span className="text-amber-500/70">{lang === 'ru' ? 'МСК:' : 'MSK:'}</span> {moscowTime}
            </span>
          </div>

          {/* Ссылка на статью в Википедии */}
          {wikiLink && (
            <a
              href={wikiLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={lang === 'ru' ? 'Статья в Wikipedia' : 'Wikipedia'}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition-all ml-2 shrink-0"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

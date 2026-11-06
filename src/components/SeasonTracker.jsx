// ... existing code ...
function LiveCountdownTimer({ nextRace, lang }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  let diff = nextRace ? nextRace.parsedDate.getTime() - now.getTime() : 0;
  const isLive = diff <= 0 && diff > -1000 * 60 * 180;

  if (isLive) {
    return (
      <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/40 px-3 py-1.5 rounded-xl text-red-400 text-xs font-black uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        {lang === 'ru' ? 'Лайв' : 'LIVE'}
      </div>
    );
  }

  if (diff < 0) diff = 0;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
  const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
  const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 min-w-[50px]">
        <span className="text-lg sm:text-xl font-black text-white font-mono leading-tight">{d}</span>
        <span className="text-[9px] font-bold text-zinc-500 uppercase">{lang === 'ru' ? 'Дней' : 'Days'}</span>
      </div>
      <span className="text-zinc-600 font-bold">:</span>
      <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 min-w-[50px]">
        <span className="text-lg sm:text-xl font-black text-white font-mono leading-tight">{h}</span>
        <span className="text-[9px] font-bold text-zinc-500 uppercase">{lang === 'ru' ? 'Часов' : 'Hours'}</span>
      </div>
      <span className="text-zinc-600 font-bold">:</span>
      <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 min-w-[50px]">
        <span className="text-lg sm:text-xl font-black text-white font-mono leading-tight">{m}</span>
        <span className="text-[9px] font-bold text-zinc-500 uppercase">{lang === 'ru' ? 'Мин' : 'Mins'}</span>
      </div>
      <span className="text-zinc-600 font-bold">:</span>
      <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 min-w-[50px] shadow-glow-amber">
        <span className="text-lg sm:text-xl font-black text-amber-400 font-mono leading-tight">{s}</span>
        <span className="text-[9px] font-bold text-zinc-500 uppercase">{lang === 'ru' ? 'Сек' : 'Secs'}</span>
      </div>
    </div>
  );
}

export const SeasonTracker = ({ activeSeries = 'ALL', races = [], lang = 'ru', nextRace, activeYear }) => {
// ... existing code ...

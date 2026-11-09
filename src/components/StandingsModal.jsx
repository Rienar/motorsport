import React, { useState } from 'react';
import { Trophy, X } from 'lucide-react';

export const StandingsModal = ({ isOpen, onClose, lang = 'ru' }) => {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' или 'teams'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-[#11131a] border border-white/10 rounded-2xl w-full max-w-lg shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col transform transition-transform duration-300">
        
        {/* Шапка модалки */}
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

        {/* Вкладки */}
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

        {/* Контент: ПИЛОТЫ */}
        {activeTab === 'drivers' && (
          <div className="p-5 flex flex-col gap-2 h-72 overflow-y-auto">
            {/* Демо данные */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-zinc-500 w-4 text-center">1</span>
                <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <div className="text-white font-bold text-sm">Макс Ферстаппен</div>
                  <div className="text-zinc-500 text-xs font-medium">Red Bull Racing</div>
                </div>
              </div>
              <div className="text-white font-black text-lg">393</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-zinc-500 w-4 text-center">2</span>
                <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
                <div>
                  <div className="text-white font-bold text-sm">Ландо Норрис</div>
                  <div className="text-zinc-500 text-xs font-medium">McLaren</div>
                </div>
              </div>
              <div className="text-white font-black text-lg">331</div>
            </div>
          </div>
        )}

        {/* Контент: КОМАНДЫ */}
        {activeTab === 'teams' && (
          <div className="p-5 flex flex-col gap-2 h-72 overflow-y-auto">
             {/* Демо данные */}
             <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-zinc-500 w-4 text-center">1</span>
                <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
                <div className="text-white font-bold text-sm">McLaren</div>
              </div>
              <div className="text-white font-black text-lg">593</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-zinc-500 w-4 text-center">2</span>
                <div className="w-1 h-8 bg-red-600 rounded-full"></div>
                <div className="text-white font-bold text-sm">Ferrari</div>
              </div>
              <div className="text-white font-black text-lg">557</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

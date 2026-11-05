import React from 'react';
import { X, Calendar } from 'lucide-react';

export const MonthModal = ({ isOpen, onClose, activeMonth, setActiveMonth, t, lang }) => {
  if (!isOpen) return null;

  // Опция "Все" имеет значение 'all', остальные от '1' до '12'
  const monthsList = [
    { value: 'all', label: lang === 'ru' ? 'Все' : 'All' },
    ...t.months.map((mName, idx) => ({ value: (idx + 1).toString(), label: mName }))
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto transition-opacity" 
        style={{ animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} 
        onClick={onClose}
      />
      
      <div 
        className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/15 w-full max-w-md overflow-hidden rounded-3xl p-6 pointer-events-auto relative z-10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col" 
        style={{ animation: 'modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent"></div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-red-500 w-5 h-5" /> 
            {lang === 'ru' ? 'Месяцы' : 'Months'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Сетка месяцев в стиле референса (4 колонки) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[60vh] overflow-y-auto hide-scrollbar pr-1">
          {monthsList.map((m) => {
            const isSelected = activeMonth === m.value;
            return (
              <button
                key={m.value}
                onClick={() => {
                  setActiveMonth(m.value);
                  onClose();
                }}
                className={`py-3.5 px-2 rounded-2xl text-xs sm:text-sm font-bold transition-all border flex items-center justify-center text-center ${
                  isSelected 
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-[1.02]' 
                    : 'bg-white/[0.04] text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

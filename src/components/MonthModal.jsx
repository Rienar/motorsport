import React from 'react';
import { X, Calendar } from 'lucide-react';

export const MonthModal = ({ isOpen, onClose, activeMonth, setActiveMonth, t, lang }) => {
  if (!isOpen) return null;

  // Опция "Все" (или C) вынесена отдельно
  const allOption = { value: 'all', label: lang === 'ru' ? 'Все' : 'All' };
  
  // 12 месяцев года
  const monthsList = t.months.map((mName, idx) => ({ 
    value: (idx + 1).toString(), 
    label: mName 
  }));

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto transition-opacity" 
        style={{ animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} 
        onClick={onClose}
      />
      
      <div 
        className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/15 w-full max-w-sm max-h-[85vh] overflow-hidden rounded-3xl p-5 pointer-events-auto relative z-10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col my-auto" 
        style={{ animation: 'modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="text-indigo-400 w-4 h-4" /> 
            {lang === 'ru' ? 'Месяцы' : 'Months'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Сетка: 4 столбца */}
        <div className="grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto hide-scrollbar pr-1">
          {/* Первая строчка: кнопка "Все" на все 4 столбца */}
          <button
            onClick={() => {
              setActiveMonth(allOption.value);
              onClose();
            }}
            className={`col-span-4 py-2.5 px-2 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center text-center ${
              activeMonth === allOption.value 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-[1.01]' 
                : 'bg-white/[0.04] text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {allOption.label}
          </button>

          {/* Месяцы ниже: по 4 в ряд (3 строки по 4 месяца) */}
          {monthsList.map((m) => {
            const isSelected = activeMonth === m.value;
            return (
              <button
                key={m.value}
                onClick={() => {
                  setActiveMonth(m.value);
                  onClose();
                }}
                className={`py-2.5 px-1 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center text-center truncate ${
                  isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-[1.02]' 
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

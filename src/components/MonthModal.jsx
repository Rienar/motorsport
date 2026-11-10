import React from 'react';
import { X, Calendar } from 'lucide-react';

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const RU_MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export const MonthModal = ({ isOpen, onClose, selectedMonth, setSelectedMonth, lang }) => {
  if (!isOpen) return null;

  const monthsList = lang === 'ru' ? RU_MONTHS : EN_MONTHS;
  const allLabel = lang === 'ru' ? 'Все месяцы' : 'All Months';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121216] border border-white/10 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
        
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="text-indigo-400 w-5 h-5" />
          {lang === 'ru' ? 'Выберите месяц' : 'Select Month'}
        </h3>
        
        <button 
          onClick={() => { setSelectedMonth(0); onClose(); }}
          className={`w-full py-2.5 rounded-xl text-sm font-bold mb-3 transition-colors ${
            selectedMonth === 0 ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          {allLabel}
        </button>

        <div className="grid grid-cols-3 gap-2">
          {monthsList.map((m, idx) => {
            const monthIndex = idx + 1;
            const isSelected = selectedMonth === monthIndex;
            return (
              <button
                key={m}
                onClick={() => { setSelectedMonth(monthIndex); onClose(); }}
                className={`py-2 rounded-xl text-sm font-bold transition-all ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

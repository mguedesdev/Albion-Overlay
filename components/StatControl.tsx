
import React from 'react';

interface StatControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon: string;
  color: string;
}

const StatControl: React.FC<StatControlProps> = ({ label, value, onChange, icon, color }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
          <i className={`fas ${icon} ${color.replace('bg-', 'text-')}`}></i>
        </div>
        <span className="font-semibold text-gray-300 uppercase text-xs tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white"
        >
          <i className="fas fa-minus"></i>
        </button>
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg py-2 text-center text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
    </div>
  );
};

export default StatControl;

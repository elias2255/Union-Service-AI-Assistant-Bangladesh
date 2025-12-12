import React from 'react';
import { QUICK_OPTIONS } from '../constants';

interface QuickActionsProps {
  onSelect: (query: string) => void;
  disabled: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelect, disabled }) => {
  return (
    <div className="w-full overflow-x-auto pb-2 no-scrollbar">
      <div className="flex gap-2 px-1">
        {QUICK_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.query)}
            disabled={disabled}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-emerald-100 rounded-full hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-emerald-600 group-hover:text-white transition-colors">
              {option.icon}
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
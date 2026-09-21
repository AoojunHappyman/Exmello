import React from 'react';
import { MoodType } from '@/types';

interface MoodCardProps {
  id: MoodType;
  emoji: string;
  label: string;
  description?: string;
  isSelected?: boolean;
  onSelect: (id: MoodType) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const MoodCard: React.FC<MoodCardProps> = ({
  id,
  emoji,
  label,
  description,
  isSelected,
  onSelect,
  size = 'md',
}) => {
  if (size === 'sm') {
    return (
      <button
        type="button"
        onClick={() => onSelect(id)}
        aria-pressed={isSelected}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${
          isSelected
            ? 'bg-secondary-container text-primary font-semibold ring-2 ring-primary shadow-sm scale-105'
            : 'bg-surface-container/60 hover:bg-surface-container text-text-primary'
        }`}
      >
        <span className="text-2xl mb-1 select-none">{emoji}</span>
        <span className="text-xs tracking-tight">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={isSelected}
      className={`group flex flex-col items-center justify-between text-center p-4 sm:p-5 rounded-3xl transition-all duration-200 border cursor-pointer ${
        isSelected
          ? 'bg-secondary-container/70 border-primary shadow-soft scale-[1.03] ring-2 ring-primary/40'
          : 'bg-surface-lowest hover:bg-surface-container/40 border-stone-200/70 hover:border-secondary shadow-sm hover:shadow-soft'
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform select-none">
        {emoji}
      </div>
      <div>
        <h4 className="text-sm sm:text-base font-bold text-primary font-display mb-1">
          {label}
        </h4>
        {description && (
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </button>
  );
};

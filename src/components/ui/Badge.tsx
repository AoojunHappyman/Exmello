import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'sage' | 'amber' | 'neutral' | 'peach';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  icon,
  variant = 'sage',
  className = '',
}) => {
  const variantStyles = {
    sage: 'bg-secondary-container text-primary font-medium',
    amber: 'bg-[#FCEEE2] text-[#9A5420] font-medium',
    neutral: 'bg-surface-container text-text-secondary font-medium',
    peach: 'bg-[#FFEAE8] text-[#A63737] font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs shadow-sm ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="text-xs">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

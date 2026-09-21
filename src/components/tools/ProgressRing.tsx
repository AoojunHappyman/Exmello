import React from 'react';

interface ProgressRingProps {
  radius?: number;
  strokeWidth?: number;
  progress: number; // 0 to 100
  size?: number;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  radius = 42,
  strokeWidth = 6,
  progress,
  size = 144,
  className = '',
  children,
}) => {
  const normalizedRadius = radius;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-stone-200/70"
        />
        {/* Dynamic progress circle */}
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary-container transition-all duration-1000 ease-linear"
        />
      </svg>
      {children && <div className="absolute flex flex-col items-center justify-center">{children}</div>}
    </div>
  );
};

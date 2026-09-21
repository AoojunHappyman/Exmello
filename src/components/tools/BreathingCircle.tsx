'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';

interface BreathingCircleProps {
  phase: 'inhale' | 'hold' | 'exhale' | 'idle';
  phaseText: string;
  subText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  phase,
  phaseText,
  subText,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { box: 120, outer: 'w-24 h-24', inner: 'w-16 h-16', icon: 'w-8 h-8' },
    md: { box: 180, outer: 'w-36 h-36', inner: 'w-24 h-24', icon: 'w-12 h-12' },
    lg: { box: 240, outer: 'w-48 h-48', inner: 'w-32 h-32', icon: 'w-16 h-16' },
  };

  // Target scales based on phase
  const getOuterScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.28;
      case 'hold':
        return 1.28;
      case 'exhale':
        return 0.88;
      default:
        return 1.0;
    }
  };

  const getInnerScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.15;
      case 'hold':
        return 1.15;
      case 'exhale':
        return 0.85;
      default:
        return 1.0;
    }
  };

  const transitionConfig = {
    duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 4 : 2,
    ease: 'easeInOut',
  };

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div
        className="relative flex items-center justify-center my-4"
        style={{ width: sizeMap[size].box, height: sizeMap[size].box }}
      >
        {/* Outer Pulsing Glow */}
        <motion.div
          animate={{
            scale: getOuterScale(),
            opacity: phase === 'idle' ? 0.3 : 0.6,
          }}
          transition={transitionConfig}
          className={`absolute ${sizeMap[size].outer} rounded-full bg-secondary-container/60 blur-md`}
        />

        {/* Middle Sage Layer */}
        <motion.div
          animate={{
            scale: getInnerScale(),
            opacity: phase === 'idle' ? 0.5 : 0.85,
          }}
          transition={transitionConfig}
          className={`absolute ${sizeMap[size].inner} rounded-full bg-[#A8C7B5]/40 border border-primary/10`}
        />

        {/* Center Seed Icon */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.05 : phase === 'exhale' ? 0.95 : 1,
          }}
          transition={transitionConfig}
          className={`relative z-10 ${sizeMap[size].icon} rounded-full bg-primary-container text-white flex items-center justify-center shadow-md`}
        >
          <Wind className="w-5 h-5 text-white" />
        </motion.div>
      </div>

      {/* Real-time guidance text */}
      <motion.div
        key={phaseText}
        initial={{ opacity: 0.6, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1"
      >
        <p className="text-base sm:text-lg font-bold text-primary font-display">
          {phaseText}
        </p>
        {subText && (
          <p className="text-xs text-text-secondary max-w-[220px]">
            {subText}
          </p>
        )}
      </motion.div>
    </div>
  );
};

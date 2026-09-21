'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Wind,
  Volume2,
  VolumeX,
  ArrowRight,
  Info,
} from 'lucide-react';
import { playGentleChime } from '@/lib/sound';
import { saveActivitySession } from '@/lib/storage';

type BreathMode = 'box' | 'sigh';

function BreathingContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as BreathMode) || 'box';

  const [mode, setMode] = useState<BreathMode>(initialMode);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const targetCycles = 4;
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [phaseIndex, setPhaseIndex] = useState<number>(0);

  const boxPhases = [
    { text: 'หายใจเข้า', sub: 'สูดลมหายใจเข้าช้า ๆ ทางจมูก (4 วินาที)', scale: 1.35, duration: 4 },
    { text: 'กลั้นหายใจ', sub: 'ผ่อนคลายไหล่ นิ่งไว้เบา ๆ (4 วินาที)', scale: 1.35, duration: 4 },
    { text: 'หายใจออก', sub: 'ค่อย ๆ ปล่อยลมหายใจออกให้หมด (4 วินาที)', scale: 0.85, duration: 4 },
    { text: 'กลั้นหายใจ', sub: 'อยู่นิ่ง ๆ อย่างสบายและสงบ (4 วินาที)', scale: 0.85, duration: 4 },
  ];

  const sighPhases = [
    { text: 'หายใจเข้า', sub: 'สูดหายใจเข้าครึ่งหนึ่งทางจมูก (2 วินาที)', scale: 1.15, duration: 2 },
    { text: 'สูดเข้าอีกนิด', sub: 'เติมลมหายใจเข้าอีกจังหวะสั้น ๆ (1.5 วินาที)', scale: 1.35, duration: 1.5 },
    { text: 'หายใจออกยาว ๆ', sub: 'ถอนหายใจผ่อนลมออกทางปากช้า ๆ (5 วินาที)', scale: 0.85, duration: 5 },
  ];

  const activePhases = mode === 'box' ? boxPhases : sighPhases;
  const currentPhase = activePhases[phaseIndex] || activePhases[0];

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isActive) {
      const durationMs = currentPhase.duration * 1000;
      timer = setTimeout(() => {
        setPhaseIndex((prev) => {
          const next = (prev + 1) % activePhases.length;
          if (next === 0) {
            setCycleCount((c) => {
              const newCycle = c + 1;
              if (newCycle >= targetCycles) {
                setIsActive(false);
                setIsCompleted(true);
                if (soundEnabled) playGentleChime();
                saveActivitySession(
                  3,
                  'breathing',
                  true,
                  mode === 'box' ? 'ฝึกหายใจแบบกล่อง 4 รอบ' : 'ฝึกหายใจถอนใจ 4 รอบ'
                );
              }
              return newCycle;
            });
          }
          return next;
        });
      }, durationMs);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isActive, phaseIndex, activePhases, currentPhase.duration, targetCycles, soundEnabled, mode]);

  const toggleExercise = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setCycleCount(0);
    setIsCompleted(false);
  };

  const switchMode = (newMode: BreathMode) => {
    if (isActive) {
      if (!confirm('การเปลี่ยนรูปแบบการหายใจจะรีเซ็ตรอบปัจจุบัน ต้องการดำเนินการต่อหรือไม่?')) return;
    }
    setMode(newMode);
    handleReset();
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Header Mode Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-surface-lowest p-1.5 rounded-full border border-stone-200/60 shadow-sm">
          <button
            type="button"
            onClick={() => switchMode('box')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              mode === 'box'
                ? 'bg-primary-container text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Box Breathing (4-4-4-4)
          </button>
          <button
            type="button"
            onClick={() => switchMode('sigh')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              mode === 'sigh'
                ? 'bg-primary-container text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Physiological Sigh (คลายเครียด)
          </button>
        </div>

        {/* Cycle Tracker & Audio Toggle */}
        <div className="w-full flex items-center justify-between px-4 pb-2 text-xs text-text-secondary">
          <span className="font-semibold text-primary font-display">
            รอบที่ {Math.min(cycleCount + 1, targetCycles)} จาก {targetCycles}
          </span>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'ปิดเสียงเตือน' : 'เปิดเสียงเตือน'}
            className="w-8 h-8 rounded-full bg-surface-lowest hover:bg-surface-container border border-stone-200/70 flex items-center justify-center text-text-secondary"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Big Animated Circle using Framer Motion */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 my-8 flex items-center justify-center">
          <motion.div
            animate={{
              scale: isActive ? currentPhase.scale : 1.0,
              opacity: isActive ? 0.7 : 0.4,
            }}
            transition={{
              duration: isActive ? currentPhase.duration : 1,
              ease: 'easeInOut',
            }}
            className="absolute w-60 h-60 sm:w-68 sm:h-68 rounded-full bg-secondary-container/50 blur-xl"
          />

          <motion.div
            animate={{
              scale: isActive ? currentPhase.scale * 0.9 : 0.95,
              opacity: isActive ? 0.85 : 0.6,
            }}
            transition={{
              duration: isActive ? currentPhase.duration : 1,
              ease: 'easeInOut',
            }}
            className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-[#A8C7B5]/40 border-2 border-primary/20 shadow-inner"
          />

          <motion.div
            animate={{
              scale: isActive && currentPhase.text.includes('หายใจเข้า') ? 1.05 : 0.95,
            }}
            transition={{
              duration: isActive ? currentPhase.duration : 1,
              ease: 'easeInOut',
            }}
            className="relative z-10 w-20 h-20 rounded-full bg-primary-container text-white flex items-center justify-center shadow-md"
          >
            <Wind className="w-8 h-8 text-white" />
          </motion.div>
        </div>

        {/* Phase Text Prompt */}
        <div className="min-h-[64px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase.text}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold text-primary font-display">
                {isActive ? currentPhase.text : 'พักสักครู่ แล้วหายใจ'}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                {isActive ? currentPhase.sub : 'จัดท่านั่งให้สบาย ปล่อยหัวไหล่ให้ผ่อนคลาย'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            type="button"
            onClick={toggleExercise}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary-container text-white text-base font-semibold hover:bg-primary shadow-soft active:translate-y-0.5 transition-all"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>พักชั่วคราว</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white ml-0.5" />
                <span>{cycleCount > 0 ? 'ฝึกต่อ' : 'เริ่มฝึกหายใจ'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="รีเซ็ตการฝึก"
            className="w-12 h-12 rounded-full bg-surface-lowest hover:bg-surface-container border border-stone-200/70 text-text-secondary flex items-center justify-center shadow-sm transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer note */}
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-10 bg-surface-container/60 px-4 py-2 rounded-full border border-stone-200/50">
          <Info className="w-3.5 h-3.5 text-secondary shrink-0" />
          <span>การฝึกระบบประสาทให้สงบลง (เครื่องมือดูแลสุขภาวะทั่วไป ไม่ใช่การรักษาทางการแพทย์)</span>
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {isCompleted && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-lowest rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-hover border border-stone-200 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-[#E2F5EA] text-[#21674A] flex items-center justify-center mx-auto text-3xl">
                🍃
              </div>
              <h3 className="text-2xl font-bold text-primary font-display">
                ยอดเยี่ยมมาก สัมผัสถึงความเบาสบายนี้ไว้
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                คุณฝึกหายใจครบ 4 รอบแล้ว ระบบประสาทเข้าสู่สภาวะสงบและพร้อมต่อการเรียนรู้อย่างผ่อนคลาย
              </p>
              <div className="pt-3 flex flex-col gap-2.5">
                <Link
                  href="/focus?duration=25"
                  className="w-full py-3.5 px-4 rounded-full bg-primary-container text-white text-sm font-semibold hover:bg-primary shadow-sm flex items-center justify-center gap-2"
                >
                  <span>เริ่มโฟกัส 25 นาที</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 px-4 rounded-full bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors"
                >
                  ฝึกหายใจอีกรอบ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BreathingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-sm text-primary">กำลังโหลดการฝึกหายใจ...</p>
        </div>
      }
    >
      <BreathingContent />
    </Suspense>
  );
}

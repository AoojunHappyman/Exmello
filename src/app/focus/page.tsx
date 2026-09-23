'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Coffee,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { playGentleChime } from '@/lib/sound';
import { saveActivitySession } from '@/lib/storage';
import { ApiFocusSession, createFocusSession, getAuthSession, readableApiError, updateFocusSession } from '@/lib/api';

function FocusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const requestedMinutes = Number(searchParams.get('duration')) || 25;
  const initialMinutes = Math.max(1, Math.min(180, Math.floor(requestedMinutes)));
  const [targetMinutes, setTargetMinutes] = useState<number>(initialMinutes);
  const [totalSeconds, setTotalSeconds] = useState<number>(initialMinutes * 60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isDistractionFree, setIsDistractionFree] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState('');
  const [pending, setPending] = useState(false);
  const serverSession = useRef<ApiFocusSession | null>(null);

  const cancelCurrent = async () => {
    if (!serverSession.current) return;
    await updateFocusSession(serverSession.current.id, 'cancelled');
    serverSession.current = null;
  };

  const handleSelectDuration = async (mins: number) => {
    if (isRunning) {
      if (!confirm('การเปลี่ยนระยะเวลาจะรีเซ็ตเซสชันปัจจุบัน ต้องการดำเนินการต่อหรือไม่?')) return;
    }
    setIsRunning(false);
    setPending(true);
    try { await cancelCurrent(); } catch (error) { setSessionError(readableApiError(error)); setPending(false); return; }
    setSessionError('');
    setPending(false);
    setTargetMinutes(mins);
    setTotalSeconds(mins * 60);
    setSecondsRemaining(mins * 60);
    setIsRunning(false);
    setIsCompleted(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      const finish = async () => {
        setPending(true);
        try {
          if (serverSession.current) {
            const elapsed = Date.now() - Date.parse(serverSession.current.started_at);
            const wait = Math.max(0, targetMinutes * 60000 - elapsed + 1000);
            if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
            await updateFocusSession(serverSession.current.id, 'completed');
            serverSession.current = null;
          } else if (!getAuthSession()) {
            saveActivitySession(targetMinutes, 'focus', true, `โฟกัส ${targetMinutes} นาที`);
          } else {
            throw new Error('Missing focus session');
          }
          setIsCompleted(true);
          if (soundEnabled) playGentleChime();
          try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#2F5D50', '#A8C7B5', '#F2C6A0', '#6C8F7B'] }); } catch { /* animation unavailable */ }
        } catch (error) { setSessionError(readableApiError(error)); }
        finally { setPending(false); }
      };
      void finish();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsRemaining, soundEnabled, targetMinutes]);

  const toggleRunning = async () => {
    if (isRunning) { setIsRunning(false); return; }
    if (isCompleted || pending) return;
    setPending(true);
    setSessionError('');
    try {
      if (getAuthSession() && !serverSession.current) serverSession.current = await createFocusSession(targetMinutes);
      setIsRunning(true);
    } catch (error) { setSessionError(readableApiError(error)); }
    finally { setPending(false); }
  };

  const handleReset = async () => {
    setIsRunning(false);
    setPending(true);
    try { await cancelCurrent(); } catch (error) { setSessionError(readableApiError(error)); setPending(false); return; }
    setPending(false);
    setSessionError('');
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
    setIsCompleted(false);
  };

  const handleExit = () => {
    if (serverSession.current || (isRunning && secondsRemaining < totalSeconds - 10)) {
      setShowExitConfirm(true);
    } else {
      router.push('/');
    }
  };

  const confirmExit = async () => {
    setPending(true);
    try { await cancelCurrent(); router.push('/'); } catch (error) { setSessionError(readableApiError(error)); setShowExitConfirm(false); setPending(false); }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className={`min-h-[calc(100vh-140px)] flex flex-col justify-center items-center px-4 transition-colors duration-500 ${
        isDistractionFree ? 'bg-[#F4F1EA] py-8' : 'py-12'
      }`}
    >
      <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between pb-6 text-xs text-text-secondary">
          <button
            type="button"
            onClick={handleExit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-lowest hover:bg-surface-container border border-stone-200/70 font-semibold text-text-primary transition-colors shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>ออกจากโหมดโฟกัส</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label={soundEnabled ? 'ปิดเสียงกระดิ่ง' : 'เปิดเสียงกระดิ่ง'}
              className="w-9 h-9 rounded-full bg-surface-lowest hover:bg-surface-container border border-stone-200/70 flex items-center justify-center text-text-secondary"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsDistractionFree(!isDistractionFree)}
              aria-label={isDistractionFree ? 'ออกจากโหมดเต็มจอ' : 'เข้าสู่โหมดเต็มจอไร้สิ่งรบกวน'}
              className="w-9 h-9 rounded-full bg-surface-lowest hover:bg-surface-container border border-stone-200/70 flex items-center justify-center text-text-secondary"
            >
              {isDistractionFree ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Presets Selector */}
        {!isDistractionFree && (
          <div className="flex items-center gap-2 mb-8 bg-surface-lowest p-1.5 rounded-full border border-stone-200/60 shadow-sm">
            {[15, 25, 50].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleSelectDuration(mins)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  targetMinutes === mins
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {mins} นาที
              </button>
            ))}
          </div>
        )}

        {/* Circular Progress Timer Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              className="text-stone-200/80"
            />
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-primary-container transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-bold text-primary tracking-tight font-display">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-xs text-secondary font-bold uppercase tracking-widest mt-1">
              {isRunning ? 'กำลังโฟกัส' : isCompleted ? 'โฟกัสครบแล้ว' : 'พร้อมเริ่มต้น'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        {sessionError && <p role="alert" className="text-sm text-red-700">{sessionError}</p>}
        <div className="flex items-center gap-4 mt-6">
          <button
            type="button"
            onClick={toggleRunning}
            disabled={pending || isCompleted}
            aria-label={isRunning ? 'พักชั่วคราว' : 'เริ่มโฟกัส'}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary-container text-white text-base font-semibold hover:bg-primary shadow-soft active:translate-y-0.5 transition-all"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>พักชั่วคราว</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white ml-0.5" />
                <span>{secondsRemaining < totalSeconds ? 'เริ่มต่อ' : 'เริ่มโฟกัส'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={pending}
            aria-label="รีเซ็ตเวลา"
            className="w-12 h-12 rounded-full bg-surface-lowest hover:bg-surface-container border border-stone-200/70 text-text-secondary flex items-center justify-center shadow-sm transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Affirmation Note */}
        <p className="text-xs text-text-muted mt-6 max-w-xs leading-relaxed">
          {isRunning
            ? 'ทีละหนึ่งความคิด ทีละหนึ่งประโยค โลกภายนอกรอเราได้เสมอ'
            : 'จัดท่าทางให้สบาย ปิดการแจ้งเตือน แล้วค่อย ๆ เริ่มต้นไปด้วยกัน'}
        </p>
      </div>

      {/* COMPLETION MODAL */}
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
                🎉
              </div>
              <h3 className="text-2xl font-bold text-primary font-display">
                เก่งมาก! คุณโฟกัสครบแล้ว 🎉
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                คุณได้สละเวลา {targetMinutes} นาทีเพื่อการเรียนรู้อย่างมีสติ การให้เกียรติและชื่นชมตัวเองก็สำคัญไม่แพ้การอ่านหนังสือนะ
              </p>

              <div className="pt-3 flex flex-col gap-2.5">
                <Link
                  href="/reset"
                  className="w-full py-3.5 px-4 rounded-full bg-primary-container text-white text-sm font-semibold hover:bg-primary shadow-sm flex items-center justify-center gap-2"
                >
                  <Coffee className="w-4 h-4" />
                  <span>พักผ่อน 5 นาที</span>
                </Link>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 px-4 rounded-full bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors"
                >
                  เริ่มรอบถัดไป
                </button>

                <Link
                  href="/dashboard"
                  className="text-xs text-secondary hover:underline pt-1"
                >
                  ดูเวลาโฟกัสสะสมในแดชบอร์ด
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest rounded-3xl p-6 max-w-sm w-full shadow-hover border border-stone-200 text-center space-y-4"
            >
              <h4 className="text-lg font-bold text-primary font-display">
                ต้องการออกจากโหมดโฟกัสก่อนเวลาหรือไม่?
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                การพักเมื่อคุณต้องการเป็นเรื่องปกติเสมอ พักสักครู่แล้วค่อยกลับมาใหม่ก็ได้นะ
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 rounded-full bg-surface-container text-xs font-semibold text-text-primary hover:bg-surface-container-high"
                >
                  โฟกัสต่อ
                </button>
                <button
                  type="button"
                  onClick={confirmExit}
                  disabled={pending}
                  className="flex-1 py-2.5 rounded-full bg-primary-container text-white text-xs font-semibold hover:bg-primary"
                >
                  ออกจากโฟกัส
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FocusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-sm text-primary">กำลังโหลดตัวจับเวลา...</p>
        </div>
      }
    >
      <FocusContent />
    </Suspense>
  );
}

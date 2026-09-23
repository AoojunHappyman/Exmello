'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { MOOD_OPTIONS, CONCERN_OPTIONS, NEED_OPTIONS } from '@/lib/mock-data';
import { MoodType, ConcernType, NeedType } from '@/types';
import { submitCheckin } from '@/lib/checkin';
import { readableApiError } from '@/lib/api';

export default function CheckinPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedConcerns, setSelectedConcerns] = useState<ConcernType[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<NeedType | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConcernLimit, setShowConcernLimit] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState('');

  const handleSelectMood = (mood: MoodType) => {
    setSelectedMood(mood);
    // Smooth auto-advance
    setTimeout(() => {
      setCurrentStep(2);
    }, 280);
  };

  const handleToggleConcern = (concern: ConcernType) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter((item) => item !== concern));
      setShowConcernLimit(false);
      return;
    }

    if (selectedConcerns.length >= 3) {
      setShowConcernLimit(true);
      return;
    }

    setSelectedConcerns([...selectedConcerns, concern]);
    setShowConcernLimit(false);
  };

  const handleSelectNeed = (need: NeedType) => {
    setSelectedNeed(need);
  };

  const handleFinish = async (overrideNeed?: NeedType | null) => {
    if (!selectedMood || selectedConcerns.length === 0) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const path = await submitCheckin(selectedMood, selectedConcerns, overrideNeed === null ? undefined : overrideNeed ?? selectedNeed);
      router.push(path);
    } catch (error) {
      setSubmitError(readableApiError(error));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-2xl bg-surface-lowest rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/60 relative overflow-hidden">
        {/* Progress Bar & Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">🌱</span>
              <span className="font-semibold text-primary font-display">เช็กอินด่วน</span>
            </div>
            <span className="font-semibold">ขั้นตอน {currentStep} จาก 3</span>
          </div>

          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-container rounded-full"
              initial={{ width: '33.3%' }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Multi-step Content with Animations */}
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* STEP 1: MOOD                                                 */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  ขั้นตอน 01
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary font-display mt-1">
                  ตอนนี้คุณรู้สึกอย่างไร?
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  ไม่มีคำตอบที่ถูกหรือผิด เลือกสิ่งที่ตรงกับคุณที่สุด
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => handleSelectMood(mood.id)}
                      className={`group flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-200 border cursor-pointer ${
                        isSelected
                          ? 'bg-secondary-container/70 border-primary ring-2 ring-primary shadow-soft scale-[1.03]'
                          : 'bg-surface-lowest hover:bg-surface-container/50 border-stone-200/70 hover:border-secondary shadow-sm'
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform select-none">
                        {mood.emoji}
                      </span>
                      <span className="text-sm font-bold text-primary font-display">
                        {mood.label}
                      </span>
                      <span className="text-[11px] text-text-secondary mt-1 text-center line-clamp-2">
                        {mood.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between items-center text-xs text-text-muted">
                <span>คำแนะนำ: แตะเลือกเพื่อไปต่ออัตโนมัติ</span>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="hover:text-text-primary"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: CONCERN                                              */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  ขั้นตอน 02
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary font-display mt-1">
                  ตอนนี้มีอะไรที่กวนใจคุณอยู่บ้าง?
                </h2>
                <p id="concern-selection-help" className="text-xs sm:text-sm text-text-secondary mt-1">
                  เลือกสิ่งที่กวนใจคุณได้สูงสุด 3 ข้อ
                </p>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2"
                role="group"
                aria-label="เลือกสิ่งที่กวนใจ"
                aria-describedby="concern-selection-help concern-selection-status"
              >
                {CONCERN_OPTIONS.map((concern) => {
                  const isSelected = selectedConcerns.includes(concern.id);
                  return (
                    <button
                      key={concern.id}
                      type="button"
                      onClick={() => handleToggleConcern(concern.id)}
                      aria-pressed={isSelected}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-primary-container text-white border-primary shadow-sm font-semibold'
                          : 'bg-surface-lowest hover:bg-surface-container border-stone-200/70 text-text-primary'
                      }`}
                    >
                      <span className="text-xl shrink-0">{concern.icon}</span>
                      <div className="flex-grow">
                        <p className="text-xs sm:text-sm font-medium">{concern.label}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div
                id="concern-selection-status"
                aria-live="polite"
                className={`text-xs ${showConcernLimit ? 'text-[#A63737] font-semibold' : 'text-text-muted'}`}
              >
                {showConcernLimit
                  ? 'เลือกได้สูงสุด 3 ข้อ ลองยกเลิกข้อหนึ่งก่อนนะ'
                  : `เลือกแล้ว ${selectedConcerns.length} จาก 3 ข้อ`}
              </div>

              {/* Navigation Controls */}
              <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ย้อนกลับ</span>
                </button>

                <button
                  type="button"
                  disabled={selectedConcerns.length === 0}
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-container text-white text-xs sm:text-sm font-semibold hover:bg-primary shadow-sm active:translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  <span>ต่อไป</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: OPTIONAL NEED                                        */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                    ขั้นตอน 03 (ไม่บังคับ)
                  </span>
                  <span className="text-xs text-text-muted">สามารถข้ามได้</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary font-display mt-1">
                  ตอนนี้คุณอยากได้อะไร?
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  เลือกสิ่งที่คุณต้องการในตอนนี้ หรือปล่อยให้ระบบช่วยแนะนำขั้นตอนที่อ่อนโยนที่สุดให้คุณ
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {NEED_OPTIONS.map((need) => {
                  const isSelected = selectedNeed === need.id;
                  return (
                    <button
                      key={need.id}
                      type="button"
                      onClick={() => handleSelectNeed(need.id)}
                      className={`flex items-start gap-3.5 p-4 rounded-3xl border transition-all text-left ${
                        isSelected
                          ? 'bg-secondary-container/80 border-primary ring-2 ring-primary shadow-sm'
                          : 'bg-surface-lowest hover:bg-surface-container border-stone-200/70'
                      }`}
                    >
                      <span className="text-2xl mt-0.5">{need.emoji}</span>
                      <div>
                        <h4 className="text-sm font-bold text-primary font-display">{need.label}</h4>
                        <p className="text-xs text-text-secondary mt-0.5">{need.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              {submitError && <p role="alert" className="text-sm text-red-700">{submitError}</p>}
              <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary self-start sm:self-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ย้อนกลับ</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleFinish(null)}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-full bg-surface-container text-text-primary text-xs sm:text-sm font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    ข้ามไป & ให้ระบบช่วยเลือก
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinish()}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary-container text-white text-xs sm:text-sm font-semibold hover:bg-primary shadow-sm active:translate-y-0.5 transition-all"
                  >
                    <span>{isSubmitting ? 'กำลังเลือกแผน...' : 'ดูคำแนะนำสำหรับคุณ'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

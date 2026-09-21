'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Eye,
  Droplets,
  Activity,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { playGentleChime } from '@/lib/sound';
import { saveActivitySession } from '@/lib/storage';

export default function QuickResetPage() {
  const [activeTab, setActiveTab] = useState<'eyes' | 'hydrate' | 'stretch' | 'dump'>('eyes');

  // 1. Eye Rest Timer (60s)
  const [eyeSeconds, setEyeSeconds] = useState<number>(60);
  const [isEyeRunning, setIsEyeRunning] = useState<boolean>(false);
  const [eyeCompleted, setEyeCompleted] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isEyeRunning && eyeSeconds > 0) {
      interval = setInterval(() => setEyeSeconds((s) => s - 1), 1000);
    } else if (eyeSeconds === 0 && isEyeRunning) {
      setIsEyeRunning(false);
      setEyeCompleted(true);
      playGentleChime();
      saveActivitySession(1, 'reset', true, 'พักสายตา 60 วินาที');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isEyeRunning, eyeSeconds]);

  // 2. Hydration Checked State
  const [hydrated, setHydrated] = useState<boolean>(false);

  // 3. Brain Dump text state
  const [dumpText, setDumpText] = useState<string>('');
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [burnSuccess, setBurnSuccess] = useState<boolean>(false);

  const handleBurn = () => {
    if (!dumpText.trim()) return;
    setIsBurning(true);
    setTimeout(() => {
      setDumpText('');
      setIsBurning(false);
      setBurnSuccess(true);
      playGentleChime();
      saveActivitySession(2, 'reset', true, 'กระดานเทความคิด (Brain Dump)');
      setTimeout(() => setBurnSuccess(false), 3000);
    }, 800);
  };

  const tabs = [
    { id: 'eyes', label: 'พักสายตา 60 วิ', icon: Eye },
    { id: 'hydrate', label: 'ดื่มน้ำ & ปรับสรีระ', icon: Droplets },
    { id: 'stretch', label: 'ยืดเส้น 2 นาที', icon: Activity },
    { id: 'dump', label: 'เคลียร์หัว (Brain Dump)', icon: Trash2 },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-primary text-xs font-semibold">
            <span>🌱</span>
            <span>รีเซ็ตตัวเองด่วน</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary font-display">
            รีเซ็ตตัวเอง
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            กิจกรรมสั้น ๆ ไม่เกิน 1-3 นาที สำหรับพักจากการอ่านหนังสือ เติมพลัง และรีเซ็ตสายตาและสมอง
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-surface-lowest p-1.5 rounded-3xl border border-stone-200/60 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-text-secondary hover:bg-surface-container'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: 60-Second Eye Rest */}
        {activeTab === 'eyes' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-lowest rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/60 text-center space-y-6"
          >
            <div className="w-14 h-14 rounded-3xl bg-[#E2F0FA] text-[#246A98] flex items-center justify-center mx-auto">
              <Eye className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-primary font-display">
                การคลายสายตากฎ 20-20-20
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                การจ้องหน้าจอหรือชีทสรุปนาน ๆ ทำให้กล้ามเนื้อตาเกร็ง ลองมองออกไปไกลกว่า 20 ฟุต (เช่น มองออกไปนอกหน้าต่างหรือปลายทางเดิน) เป็นเวลา 60 วินาที
              </p>
            </div>

            {/* Countdown ring display */}
            <div className="py-4">
              <span className="text-5xl sm:text-6xl font-bold text-primary font-display tracking-tight">
                00:{eyeSeconds.toString().padStart(2, '0')}
              </span>
              <p className="text-xs text-secondary font-semibold uppercase tracking-widest mt-2">
                {isEyeRunning ? 'ทอดสายตามองขอบฟ้าไกล ๆ...' : eyeCompleted ? 'สายตาสดชื่นขึ้นแล้ว! 🌿' : 'พร้อมเริ่มต้น'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsEyeRunning(!isEyeRunning)}
                className="px-8 py-3.5 rounded-full bg-primary-container text-white text-sm font-semibold hover:bg-primary shadow-soft flex items-center gap-2"
              >
                {isEyeRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isEyeRunning ? 'พักชั่วคราว' : eyeSeconds < 60 ? 'ทำต่อ' : 'เริ่มพักสายตา 60 วินาที'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEyeRunning(false);
                  setEyeSeconds(60);
                  setEyeCompleted(false);
                }}
                className="w-11 h-11 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-text-secondary"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Hydration & Posture */}
        {activeTab === 'hydrate' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-lowest rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/60 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E2F5EA] text-[#21674A] flex items-center justify-center">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary font-display">
                  ดื่มน้ำ & ปรับสรีระร่างกาย
                </h3>
                <p className="text-xs text-text-secondary">
                  การขาดน้ำเพียงเล็กน้อยส่งผลต่อสมาธิและทำให้สมองรู้สึกล้า
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-surface-container/60 border border-stone-200/50 flex items-start gap-3">
                <span className="text-2xl">💧</span>
                <div>
                  <h4 className="text-sm font-bold text-primary">ดื่มน้ำเปล่า 1 แก้วเต็ม ๆ</h4>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    น้ำอุณหภูมิห้องช่วยกระตุ้นเส้นประสาทเวกัส และลดอาการคอแห้งที่เกิดจากความตื่นเต้นช่วงสอบ
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container/60 border border-stone-200/50 flex items-start gap-3">
                <span className="text-2xl">🧘</span>
                <div>
                  <h4 className="text-sm font-bold text-primary">หมุนหัวไหล่ไปด้านหลัง 5 ครั้ง</h4>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    หมุนหัวไหล่ไปข้างหน้า 3 ครั้ง แล้วหมุนไปข้างหลังช้า ๆ 5 ครั้ง ปล่อยให้สะบักและคอได้คลายตัว
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setHydrated(!hydrated);
                if (!hydrated) {
                  playGentleChime();
                  saveActivitySession(2, 'reset', true, 'ดื่มน้ำและปรับสรีระ');
                }
              }}
              className={`w-full py-4 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                hydrated
                  ? 'bg-secondary-container text-primary font-bold shadow-sm'
                  : 'bg-primary-container text-white hover:bg-primary shadow-soft'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{hydrated ? 'ดื่มน้ำและผ่อนคลายไหล่เรียบร้อยแล้ว! 🌱' : 'ฉันทำเสร็จแล้ว! บันทึกว่าเรียบร้อย'}</span>
            </button>
          </motion.div>
        )}

        {/* Tab 3: 2-Minute Desk Stretch */}
        {activeTab === 'stretch' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-lowest rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/60 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEEE2] text-[#9A5420] flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary font-display">
                  ท่ายืดกล้ามเนื้อบนเก้าอี้ 2 นาที
                </h3>
                <p className="text-xs text-text-secondary">
                  ท่าง่าย ๆ ที่ทำได้ทันทีบนโต๊ะอ่านหนังสือโดยไม่รบกวนคนรอบข้าง
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-surface-container/50 border border-stone-200/60">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">ท่าที่ 1 (30 วินาที)</span>
                <h4 className="text-sm font-bold text-primary mt-1">เอียงหูชิดไหล่</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  เอียงศีรษะให้หูขวาเข้าหาไหล่ขวาเบา ๆ ค้างไว้ แล้วสลับไปข้างซ้าย
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container/50 border border-stone-200/60">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">ท่าที่ 2 (45 วินาที)</span>
                <h4 className="text-sm font-bold text-primary mt-1">บิดลำตัวบนเก้าอี้</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  วางมือขวาไว้บนเข่าซ้าย ค่อย ๆ บิดลำตัวมองไปด้านหลังช้า ๆ
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container/50 border border-stone-200/60">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">ท่าที่ 3 (45 วินาที)</span>
                <h4 className="text-sm font-bold text-primary mt-1">สะบัดและหมุนข้อมือ</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  ประสานนิ้วมือหมุนเป็นวงกลม แล้วสะบัดข้อมือเบา ๆ เพื่อคลายความเมื่อยจากการเขียน
                </p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/focus?duration=25"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline"
              >
                <span>พร้อมอ่านต่อแล้วใช่ไหม? กลับไปโฟกัส 25 นาที</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Mental Brain Dump */}
        {activeTab === 'dump' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-lowest rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/60 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-primary font-display">
                  กระดานเทความคิดออกจากหัว (Brain Dump)
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  พิมพ์ทุกสิ่งที่กำลังวิ่งวนในหัวตอนนี้ แล้วกดปล่อยวางทิ้งไป
                </p>
              </div>
              <span className="text-xs text-stone-400">ปลอดภัย 100% (ไม่มีการบันทึก)</span>
            </div>

            <div className="relative">
              <textarea
                value={dumpText}
                onChange={(e) => setDumpText(e.target.value)}
                placeholder="ถ้าอ่านไม่ทันล่ะ? ถ้าลืมสูตรข้อ 4 ล่ะ? ทำไมหัวใจเต้นเร็วขนาดนี้..."
                rows={5}
                className="w-full p-4 rounded-2xl bg-surface-container/50 border border-stone-200/80 text-sm text-text-primary placeholder:text-text-muted focus:bg-surface-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
              />
              {isBurning && (
                <div className="absolute inset-0 bg-secondary-container/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center animate-pulse">
                  <span className="text-3xl">🕊️</span>
                  <p className="text-xs font-semibold text-primary mt-1">กำลังปล่อยวางความกังวลออกไป...</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-text-muted">
                {burnSuccess ? '✨ ปล่อยวางความคิดเรียบร้อยแล้ว หายใจสบาย ๆ นะ' : 'การกดปล่อยวางจะลบข้อความนี้ทิ้งถาวร'}
              </span>

              <button
                type="button"
                onClick={handleBurn}
                disabled={!dumpText.trim() || isBurning}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary-container text-white text-xs font-semibold hover:bg-primary shadow-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>เผาและปล่อยวางความกังวล</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

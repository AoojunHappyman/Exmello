'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Smile,
  Timer,
  Wind,
  Sparkles,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Stars,
  Heart,
  Lightbulb,
  Sprout,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { ConcernType, MoodType, ResourceArticle } from '@/types';
import { submitCheckin } from '@/lib/checkin';
import { ApiFocusSession, createFocusSession, getAuthSession, getResources, readableApiError, updateFocusSession } from '@/lib/api';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { playGentleChime } from '@/lib/sound';

export default function HomePage() {
  const router = useRouter();

  // 1. Interactive Mockup State (Daily Check-in card)
  const [selectedMood, setSelectedMood] = useState<string>('เครียด');
  const [selectedTags, setSelectedTags] = useState<string[]>(['เวลาใกล้หมดแล้ว']);
  const [isUpdatingRec, setIsUpdatingRec] = useState<boolean>(false);
  const [checkinError, setCheckinError] = useState('');

  const moodOptions = [
    { label: 'ดีมาก', emoji: '😄', id: 'great' },
    { label: 'ค่อนข้างดี', emoji: '🙂', id: 'good' },
    { label: 'เฉย ๆ', emoji: '😐', id: 'okay' },
    { label: 'เครียด', emoji: '😟', id: 'stressed' },
    { label: 'เครียดมาก', emoji: '😰', id: 'overwhelmed' },
  ];

  const problemTags = [
    { label: 'อ่านไม่ทัน', id: 'cant_finish' },
    { label: 'จำเนื้อหาไม่ได้', id: 'cant_remember' },
    { label: 'เวลาใกล้หมดแล้ว', id: 'running_out_of_time' },
    { label: 'นอนไม่พอ', id: 'didnt_sleep' },
    { label: 'กังวลเรื่องสอบ', id: 'worried_exam' },
    { label: 'อื่น ๆ', id: 'other' },
  ];

  const toggleTag = (label: string) => {
    if (selectedTags.includes(label)) {
      setSelectedTags(selectedTags.filter((t) => t !== label));
      setCheckinError('');
    } else {
      if (selectedTags.length >= 3) { setCheckinError('เลือกได้สูงสุด 3 ข้อ'); return; }
      setSelectedTags([...selectedTags, label]);
      setCheckinError('');
    }
  };

  const handleMockupSubmit = async () => {
    setIsUpdatingRec(true);
    setCheckinError('');
    try {
      const moodObj = moodOptions.find((m) => m.label === selectedMood);
      const concerns = problemTags.filter((tag) => selectedTags.includes(tag.label)).map((tag) => tag.id as ConcernType);
      if (!concerns.length) { setCheckinError('เลือกสิ่งที่กวนใจอย่างน้อย 1 ข้อ'); setIsUpdatingRec(false); return; }
      const path = await submitCheckin((moodObj?.id || 'stressed') as MoodType, concerns);
      router.push(path);
    } catch (error) {
      setCheckinError(readableApiError(error));
      setIsUpdatingRec(false);
    }
  };

  // 2. Mini Focus Timer Widget State
  const initialSeconds = 25 * 60;
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerPending, setTimerPending] = useState(false);
  const [timerError, setTimerError] = useState('');
  const timerSession = useRef<ApiFocusSession | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      const finish = async () => {
        setTimerPending(true);
        try {
          if (timerSession.current) {
            const elapsed = Date.now() - Date.parse(timerSession.current.started_at);
            const wait = Math.max(0, initialSeconds * 1000 - elapsed + 1000);
            if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
            await updateFocusSession(timerSession.current.id, 'completed');
            timerSession.current = null;
          }
          playGentleChime();
        } catch (error) { setTimerError(readableApiError(error)); }
        finally { setTimerPending(false); }
      };
      void finish();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = async () => {
    if (isTimerRunning) { setIsTimerRunning(false); return; }
    if (timerPending || timeLeft === 0) return;
    setTimerPending(true);
    setTimerError('');
    try {
      if (getAuthSession() && !timerSession.current) timerSession.current = await createFocusSession(25);
      setIsTimerRunning(true);
    } catch (error) { setTimerError(readableApiError(error)); }
    finally { setTimerPending(false); }
  };

  const resetTimer = async () => {
    setIsTimerRunning(false);
    setTimerPending(true);
    try {
      if (timerSession.current) await updateFocusSession(timerSession.current.id, 'cancelled');
      timerSession.current = null;
      setTimerError('');
    } catch (error) { setTimerError(readableApiError(error)); setTimerPending(false); return; }
    setTimerPending(false);
    setIsTimerRunning(false);
    setTimeLeft(initialSeconds);
  };

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerCircumference = 264;
  const timerOffset =
    timerCircumference - (timeLeft / initialSeconds) * timerCircumference;

  // 3. Mini Breathing Widget State
  const [breathPhaseIndex, setBreathPhaseIndex] = useState<number>(0);
  const breathPhases = [
    { text: 'หายใจเข้าช้า ๆ...', scaleOuter: 'scale-125', scaleInner: 'scale-110' },
    { text: 'กลั้นหายใจเบา ๆ...', scaleOuter: 'scale-125', scaleInner: 'scale-110' },
    { text: 'หายใจออกอย่างสงบ...', scaleOuter: 'scale-90', scaleInner: 'scale-90' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhaseIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 4. Resources Filter Tab State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [resources, setResources] = useState<ResourceArticle[]>([]);
  const [resourceError, setResourceError] = useState('');
  useEffect(() => {
    getResources().then(setResources).catch((error) => setResourceError(readableApiError(error)));
  }, []);
  const filteredArticles =
    activeCategory === 'all'
      ? resources.slice(0, 3)
      : resources.filter((r) => r.category === activeCategory).slice(0, 3);

  return (
    <div className="flex flex-col w-full">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="relative w-full max-w-[1240px] mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-5 z-10">
            {/* Friendly Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-primary text-xs font-semibold shadow-sm">
              <span>🌱</span>
              <span>ช่วงสอบแบบเบาใจขึ้น</span>
            </div>

            {/* Big Warm Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-primary tracking-tight font-display leading-[1.2]">
              เราจะผ่าน
              <br className="hidden sm:inline" /> ช่วงสอบไปด้วยกัน
            </h1>

            {/* Caring Description */}
            <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-lg leading-relaxed">
              EXMELLO เพื่อนช่วยดูแลใจในช่วงสอบ ช่วยให้คุณเช็กความรู้สึก รับคำแนะนำที่เหมาะกับสถานการณ์ และกลับมาโฟกัสกับสิ่งที่ต้องทำทีละขั้น
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
              <Link
                href="/checkin"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary-container text-white text-sm font-semibold hover:bg-primary shadow-sm hover:shadow-soft active:translate-y-0.5 transition-all"
              >
                <span>เช็กอินตอนนี้</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#core-features"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-surface-lowest text-primary text-sm font-semibold hover:bg-surface-container border border-stone-200/80 shadow-sm transition-all"
              >
                <span>ดูฟีเจอร์ทั้งหมด</span>
              </a>
            </div>

            {/* Trust Note */}
            <div className="pt-2 flex items-center gap-2 text-secondary text-xs font-medium">
              <span className="flex h-2 w-2 rounded-full bg-primary-fixed-dim"></span>
              <span>ออกแบบด้วยความใส่ใจเพื่อเพื่อนนักเรียนและนักศึกษา</span>
            </div>
          </div>

          {/* Right Column: Provided Stitch Editorial Visual + Doodles */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0 flex justify-center">
            <div className="absolute -inset-4 bg-gradient-to-tr from-secondary-container/40 to-[#BCEDDC]/30 rounded-3xl blur-2xl -z-10" />

            <div className="relative w-full rounded-3xl overflow-hidden bg-surface-lowest shadow-card border border-stone-200/60 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI4KgDGe6TH1DApj0WhtM4mey-EJTx475ouG7av7MAtI2vM7yTU9BJHHaJT0xandbbqU5PDgSuKIqzgfwizuFXzYcizmit_IS79inj8A1vOI19SkByk_B10oNU4EfCm86VHT7Mgx9OXNsYtsA9eQF45auziNkouUPVLuz7Pq3fHebHjxmW-x9MNT_OrvELUQqx7LdYHqN0eXLRTBuErYIe1brQ8Yr8RhiUOVYYyi5g3mS_6u8uKwSPKQ"
                alt="นักศึกษาพักผ่อนอย่างสงบบนโต๊ะอ่านหนังสือคู่กับแมวน้อยในห้องอ่านหนังสือที่อบอุ่น"
                className="w-full h-[340px] sm:h-[420px] object-cover rounded-3xl transition-transform duration-700 group-hover:scale-[1.01]"
              />

              {/* Soft Handwritten Doodle Note (Top Right) */}
              <div className="absolute top-4 right-4 bg-surface-lowest/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-soft text-center flex flex-col items-center rotate-3 border border-stone-200/50">
                <span className="text-xs font-bold text-primary font-display">ก้าวเล็ก ๆ</span>
                <span className="text-xs font-bold text-primary font-display">สร้างการเปลี่ยนแปลงที่ยิ่งใหญ่</span>
                <span className="text-secondary text-xs">◡̈</span>
              </div>

              {/* Bottom Encouragement Tag */}
              <div className="absolute bottom-4 left-4 bg-surface-lowest/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-soft flex items-center gap-1.5 -rotate-2 border border-stone-200/50">
                <span className="text-xs">💛</span>
                <span className="text-xs text-primary font-semibold">คุณทำได้แน่นอน</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. CORE FEATURE CARDS (5 Bento Cards)                        */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1240px] mx-auto px-4 md:px-8 py-12 scroll-mt-20" id="core-features">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Quick Check */}
          <Link
            href="/checkin"
            className="group flex flex-col justify-between p-6 rounded-3xl bg-surface-lowest border border-stone-200/60 hover:-translate-y-1 transition-all duration-300 shadow-soft"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#E2F5EA] flex items-center justify-center text-[#21674A] mb-4">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-primary mb-1 font-display group-hover:text-primary-light transition-colors">
                เช็กอินความรู้สึก
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                บอกเราสั้น ๆ ว่าตอนนี้คุณรู้สึกอย่างไร แล้วรับคำแนะนำที่เหมาะกับคุณ
              </p>
            </div>
            <div className="pt-4 flex justify-end">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 2: Focus Timer */}
          <Link
            href="/focus"
            className="group flex flex-col justify-between p-6 rounded-3xl bg-surface-lowest border border-stone-200/60 hover:-translate-y-1 transition-all duration-300 shadow-soft"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#E2F0FA] flex items-center justify-center text-[#246A98] mb-4">
                <Timer className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-primary mb-1 font-display group-hover:text-primary-light transition-colors">
                โฟกัสกับสิ่งที่สำคัญ
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                แบ่งเวลาอ่านหนังสือเป็นช่วงสั้น ๆ เพื่อช่วยให้เริ่มต้นได้ง่ายขึ้น
              </p>
            </div>
            <div className="pt-4 flex justify-end">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 3: Breathing */}
          <Link
            href="/breathing"
            className="group flex flex-col justify-between p-6 rounded-3xl bg-surface-lowest border border-stone-200/60 hover:-translate-y-1 transition-all duration-300 shadow-soft"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#EDF8E9] flex items-center justify-center text-[#3D7639] mb-4">
                <Wind className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-primary mb-1 font-display group-hover:text-primary-light transition-colors">
                หายใจและพักใจ
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                ใช้เวลาสั้น ๆ ผ่อนคลายและกลับมาอยู่กับปัจจุบัน
              </p>
            </div>
            <div className="pt-4 flex justify-end">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 4: Quick Reset */}
          <Link
            href="/reset"
            className="group flex flex-col justify-between p-6 rounded-3xl bg-surface-lowest border border-stone-200/60 hover:-translate-y-1 transition-all duration-300 shadow-soft"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#FCEEE2] flex items-center justify-center text-[#9A5420] mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-primary mb-1 font-display group-hover:text-primary-light transition-colors">
                รีเซ็ตตัวเอง
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                กิจกรรมสั้น ๆ สำหรับพักจากการอ่านและเติมพลัง
              </p>
            </div>
            <div className="pt-4 flex justify-end">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 5: Helpful Resources */}
          <Link
            href="/resources"
            className="group flex flex-col justify-between p-6 rounded-3xl bg-surface-lowest border border-stone-200/60 hover:-translate-y-1 transition-all duration-300 shadow-soft"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#ECECFD] flex items-center justify-center text-[#4B449A] mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-primary mb-1 font-display group-hover:text-primary-light transition-colors">
                แหล่งข้อมูลช่วยเหลือ
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                เคล็ดลับการอ่านหนังสือ การพักผ่อน และการดูแลตัวเองช่วงสอบ
              </p>
            </div>
            <div className="pt-4 flex justify-end">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. HOW IT WORKS SECTION (4 Steps with Connectors)            */}
      {/* ============================================================ */}
      <section className="w-full bg-[#EAF6F0]/70 py-16 my-8 border-y border-stone-200/60 scroll-mt-20" id="how-it-works">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-surface-lowest text-text-secondary text-xs font-semibold mb-2 shadow-sm">
              วิธีใช้งาน
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary tracking-tight font-display mb-2">
              เริ่มต้นง่าย ๆ เพียงไม่กี่ขั้นตอน
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              ไม่ต้องสมบูรณ์แบบ แค่เริ่มก้าวแรกก็พอ
            </p>
          </div>

          {/* 4-Step Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-4 relative">
              <div className="w-16 h-16 rounded-3xl bg-[#DFF4E9] flex items-center justify-center text-[#21674A] shadow-sm mb-4">
                <Smile className="w-8 h-8" />
              </div>
              <span className="text-[11px] text-secondary font-bold uppercase tracking-wider mb-1 font-sans">
                ขั้นตอน 01
              </span>
              <h4 className="text-base font-bold text-primary mb-1 font-display">1. เช็กอิน</h4>
              <p className="text-xs text-text-secondary max-w-[220px]">
                ตอนนี้คุณรู้สึกอย่างไร? มีเรื่องอะไรที่กวนใจอยู่บ้าง?
              </p>
              <div className="hidden lg:block absolute -right-3 top-10 text-stone-300">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-4 relative">
              <div className="w-16 h-16 rounded-3xl bg-[#E2F0FA] flex items-center justify-center text-[#246A98] shadow-sm mb-4">
                <Lightbulb className="w-8 h-8" />
              </div>
              <span className="text-[11px] text-secondary font-bold uppercase tracking-wider mb-1 font-sans">
                ขั้นตอน 02
              </span>
              <h4 className="text-base font-bold text-primary mb-1 font-display">2. รับคำแนะนำ</h4>
              <p className="text-xs text-text-secondary max-w-[220px]">
                เราจะช่วยเลือกสิ่งที่เหมาะกับคุณและสถานการณ์ตอนนี้
              </p>
              <div className="hidden lg:block absolute -right-3 top-10 text-stone-300">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-4 relative">
              <div className="w-16 h-16 rounded-3xl bg-[#E5F5E4] flex items-center justify-center text-[#2F6B38] shadow-sm mb-4">
                <Sprout className="w-8 h-8" />
              </div>
              <span className="text-[11px] text-secondary font-bold uppercase tracking-wider mb-1 font-sans">
                ขั้นตอน 03
              </span>
              <h4 className="text-base font-bold text-primary mb-1 font-display">3. ลงมือทำ</h4>
              <p className="text-xs text-text-secondary max-w-[220px]">
                โฟกัส หายใจ พัก หรืออ่านข้อมูลที่ช่วยคุณได้
              </p>
              <div className="hidden lg:block absolute -right-3 top-10 text-stone-300">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-3xl bg-[#FFEAE8] flex items-center justify-center text-[#A63737] shadow-sm mb-4">
                <Heart className="w-8 h-8 fill-[#A63737]" />
              </div>
              <span className="text-[11px] text-secondary font-bold uppercase tracking-wider mb-1 font-sans">
                ขั้นตอน 04
              </span>
              <h4 className="text-base font-bold text-primary mb-1 font-display">4. ค่อย ๆ ไปต่อ</h4>
              <p className="text-xs text-text-secondary max-w-[220px]">
                ก้าวเล็ก ๆ ก็ถือว่าเป็นความก้าวหน้าที่สำคัญเสมอ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. INTERACTIVE TOOLS & PRODUCT SHOWCASE (Bento Grid)        */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1240px] mx-auto px-4 md:px-8 py-16 scroll-mt-20" id="interactive-suite">
        {/* Section Header with Doodle Note */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-xl">
            <span className="inline-block px-4 py-1 rounded-full bg-secondary-container text-primary text-xs font-semibold mb-2">
              สุขภาพใจของคุณคือเรื่องสำคัญ
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary tracking-tight font-display mb-2">
              เครื่องมือช่วยให้ใจสงบและมีสมาธิมากขึ้น
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              ไม่ว่าคุณจะต้องการตั้งสมาธิ ผ่อนคลาย หรือแค่ขอพักหายใจสักนิด — EXMELLO พร้อมอยู่ข้างคุณเสมอ
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-secondary font-display font-semibold text-sm rotate-2">
            <span>คุณทำได้แน่นอน</span>
            <span className="text-base">🌱</span>
          </div>
        </div>

        {/* Product Showcase Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Card A: Mobile Daily Check-in Mockup (Lg: 4 Cols) */}
          <div className="lg:col-span-4 bg-surface-lowest rounded-3xl p-6 shadow-card border border-stone-200/60 flex flex-col justify-between">
            <div>
              {/* Status bar mock */}
              <div className="flex items-center justify-between pb-3 text-stone-400 text-xs font-semibold">
                <span className="text-text-primary">9:41</span>
                <div className="flex items-center gap-1 text-[11px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Mock header */}
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🌱</span>
                  <span className="text-sm font-bold text-primary font-display">EXMELLO</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-xs text-primary font-bold">
                  <span>พ</span>
                </div>
              </div>

              {/* Greeting */}
              <div className="py-4">
                <h4 className="text-base sm:text-lg font-bold text-primary font-display">
                  สวัสดีตอนเช้า, พัฒนชัย 👋
                </h4>
                <p className="text-xs text-text-secondary mt-0.5">วันนี้คุณรู้สึกอย่างไรบ้าง?</p>
              </div>

              {/* Mood Selector Buttons */}
              <div className="grid grid-cols-5 gap-1.5 py-2 text-center">
                {moodOptions.map((mood) => {
                  const isSelected = selectedMood === mood.label;
                  return (
                    <button
                      key={mood.label}
                      type="button"
                      onClick={() => setSelectedMood(mood.label)}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all duration-200 ${
                        isSelected
                          ? 'bg-secondary-container text-primary font-semibold ring-2 ring-primary-container shadow-sm scale-105'
                          : 'bg-surface-container/70 hover:bg-surface-container text-text-primary'
                      }`}
                    >
                      <span className="text-2xl mb-1 select-none">{mood.emoji}</span>
                      <span className="text-[11px] font-sans">{mood.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* What's Bothering You? Tags */}
              <div className="pt-4">
                <span className="text-xs font-bold text-primary block mb-2 font-display">
                  ตอนนี้มีอะไรที่กวนใจคุณอยู่?
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {problemTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.label);
                    return (
                      <button
                        key={tag.label}
                        type="button"
                        onClick={() => toggleTag(tag.label)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                          isSelected
                            ? 'bg-primary-container text-white font-medium shadow-sm'
                            : 'bg-surface-container text-text-secondary hover:bg-secondary-container/60 hover:text-primary'
                        }`}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Recommendation Button */}
            <div className="pt-6">
              {checkinError && <p role="alert" className="mb-2 text-xs text-red-700">{checkinError}</p>}
              <button
                type="button"
                onClick={handleMockupSubmit}
                disabled={isUpdatingRec}
                className="w-full py-3 px-4 rounded-full bg-primary-container text-white text-xs font-semibold hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-sm active:translate-y-0.5"
              >
                <span>{isUpdatingRec ? 'กำลังเตรียมแผน... 🌱' : 'ขอคำแนะนำสำหรับฉัน'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column Cluster (Lg: 8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Row 1: Recommendation Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-lowest shadow-card border border-stone-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <div className="inline-flex items-center gap-1.5 text-[#E08A3C] text-xs font-bold">
                  <Stars className="w-4 h-4" />
                  <span>คำแนะนำสำหรับคุณ</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary font-display">
                  เราเริ่มจากเรื่องเล็ก ๆ ก่อนก็ได้ 🌱
                </h3>
                <ol className="space-y-1 text-xs sm:text-sm text-text-secondary list-decimal list-inside leading-relaxed">
                  <li>โฟกัสทีละหนึ่งหัวข้อก่อน</li>
                  <li>ใช้ช่วงเวลาโฟกัสเงียบ ๆ 25 นาที</li>
                  <li>พักสายตา 5 นาทีแบบไม่แตะหน้าจอ</li>
                </ol>
                <div className="pt-2">
                  <Link
                    href="/focus?duration=25"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary-container text-white text-xs font-semibold hover:bg-primary transition-all shadow-sm"
                  >
                    <span>เริ่มโฟกัส</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Cute Polar Bear Mascot Graphic */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-secondary-container/40 flex items-center justify-center self-center shrink-0 border border-primary/10">
                <div className="text-center">
                  <span className="text-4xl sm:text-5xl select-none">🐻‍❄️</span>
                  <p className="text-[11px] text-primary font-semibold mt-1 font-sans">
                    ค่อย ๆ ทำทีละก้าว
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Bento Split (Focus Timer + Breathing Tool + Scenery Card) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Focus Timer Widget (Interactive) */}
              <div
                className="bg-surface-lowest rounded-3xl p-6 shadow-card border border-stone-200/60 flex flex-col items-center justify-between text-center relative overflow-hidden"
                id="focus-module"
              >
                <div className="w-full flex items-center justify-between text-text-secondary text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Timer className="w-4 h-4" />
                    <span>Focus Timer</span>
                  </div>
                  <Link href="/focus" className="text-secondary hover:underline">
                    ขยายเต็มจอ
                  </Link>
                </div>

                {/* Circular Progress Ring */}
                <div className="relative w-36 h-36 my-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-stone-200/80"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="6"
                    />
                    <circle
                      className="text-primary-container transition-all duration-1000 ease-linear"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="42"
                      stroke="currentColor"
                      strokeDasharray={timerCircumference}
                      strokeDashoffset={timerOffset}
                      strokeLinecap="round"
                      strokeWidth="6"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-primary font-display">
                      {formatTimerDisplay(timeLeft)}
                    </span>
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                      {isTimerRunning ? 'กำลังโฟกัส' : 'โหมดโฟกัส'}
                    </span>
                  </div>
                </div>

                {/* Action Controls */}
                {timerError && <p role="alert" className="text-xs text-red-700">{timerError}</p>}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleTimer}
                    disabled={timerPending || timeLeft === 0}
                    aria-label={isTimerRunning ? 'พักชั่วคราว' : 'เริ่มโฟกัส'}
                    className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center hover:bg-primary transition-colors shadow-sm"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={resetTimer}
                    disabled={timerPending}
                    aria-label="รีเซ็ตเวลา"
                    className="w-9 h-9 rounded-full bg-surface-container text-text-secondary flex items-center justify-center hover:bg-surface-container-high transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-text-secondary mt-3">Pomodoro แบบเบาใจ • 25 นาที</p>
              </div>

              {/* Breathing Widget (Interactive Pulsing Ring) */}
              <div
                className="bg-surface-lowest rounded-3xl p-6 shadow-card border border-stone-200/60 flex flex-col items-center justify-between text-center relative overflow-hidden"
                id="breathe-module"
              >
                <div className="w-full flex items-center justify-between text-text-secondary text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Wind className="w-4 h-4" />
                    <span>Breathing</span>
                  </div>
                  <Link href="/breathing" className="text-secondary hover:underline">
                    ฝึกเต็มรูปแบบ
                  </Link>
                </div>

                <div className="py-1">
                  <h5 className="text-sm font-bold text-primary font-display">
                    พักสักครู่ แล้วหายใจ
                  </h5>
                  <p className="text-xs text-text-secondary">สูดหายใจลึก ๆ แล้วผ่อนคลาย</p>
                </div>

                {/* Animated Pulsing Concentric Visual */}
                <div className="relative w-32 h-32 my-1 flex items-center justify-center">
                  <div
                    className={`absolute w-28 h-28 rounded-full bg-secondary-container/50 transition-all duration-3000 ease-in-out ${breathPhases[breathPhaseIndex].scaleOuter}`}
                  />
                  <div
                    className={`absolute w-20 h-20 rounded-full bg-primary-fixed-dim/70 transition-all duration-3000 ease-in-out ${breathPhases[breathPhaseIndex].scaleInner}`}
                  />
                  <div className="relative z-10 w-11 h-11 rounded-full bg-primary-container text-white flex items-center justify-center shadow-sm">
                    <Wind className="w-5 h-5 text-white" />
                  </div>
                </div>

                <span className="text-xs font-bold text-primary font-display">
                  {breathPhases[breathPhaseIndex].text}
                </span>
              </div>

              {/* Peaceful Scenery & Hope Card */}
              <div className="sm:col-span-2 xl:col-span-1 bg-surface-lowest rounded-3xl overflow-hidden shadow-card border border-stone-200/60 relative min-h-[220px] flex flex-col justify-end p-6 group">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAwd6b52c07cl5HBzEkse2kzQWAiRQEx6Y9K-McM1sbysGJeluHxLyxEbQi6ZBzWGABkbLKk9mLDM2J_lblBOl3kbq6ghmZD_ZuIc0CCbl0E7wbRws7MtV74kPu7pW0jLYXi_X_W63j02seEkTE0tDEbgqflXVvJfpVQKQE7T3VhskePsHcQTGcAg0NWrDH55p1dJq2kZf_-jwznsCw5_7Li-josKfQFlm3qRpMvNrPAAzRCOZNCvYBng')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                <div className="relative z-10 text-white">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold mb-1 text-white">
                    <span>🌤️</span>
                    <span>มุมมองเพื่อใจสงบ</span>
                  </div>
                  <h4 className="text-base font-bold font-display leading-tight">
                    วันที่ดียังรออยู่ข้างหน้า
                  </h4>
                  <p className="text-xs text-stone-200 mt-0.5 leading-relaxed opacity-90">
                    ช่วงเวลานี้จะผ่านไป ค่อย ๆ ไปต่อด้วยความใจดีกับตัวเองนะ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. QUICK RESET & STUDENT RESOURCES SECTION                   */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1240px] mx-auto px-4 md:px-8 py-16" id="resources-section">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-secondary-container text-primary text-xs font-semibold mb-2">
              แนวทางปฏิบัติจริง
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary tracking-tight font-display">
              รีเซ็ตด่วน & แหล่งข้อมูลช่วยเหลือ
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary max-w-lg mt-1">
              บทความสั้น ๆ โดยนักจิตวิทยาการศึกษา เพื่อช่วยคุณรับมือกับความล้า ความตื่นตระหนก และการอดนอน
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'study', label: 'เทคนิคการอ่าน' },
              { id: 'stress', label: 'คลายเครียด' },
              { id: 'sleep', label: 'การนอน' },
              { id: 'lifestyle', label: 'วันสอบจริง' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === tab.id
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Editorial Article Cards */}
        {resourceError && <p role="alert" className="mb-4 text-sm text-red-700">{resourceError}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ResourceCard key={article.id} article={article} />
          ))}
        </div>

        {/* Supportive Safety & Campus Care Banner */}
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-surface-container border border-stone-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-primary font-display mb-1">
                ต้องการความช่วยเหลือเพิ่มเติมตอนนี้ใช่ไหม?
              </h4>
              <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
                EXMELLO เป็นเพื่อนช่วยดูแลใจในชีวิตประจำวัน หากคุณกำลังเผชิญความเครียดรุนแรงหรือวิกฤต ศูนย์ให้คำปรึกษาของมหาวิทยาลัยและสายด่วนสุขภาพจิตพร้อมให้บริการตลอด 24 ชม.
              </p>
            </div>
          </div>
          <Link
            href="/help"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-container text-white text-xs sm:text-sm font-semibold hover:bg-primary transition-colors whitespace-nowrap shadow-sm"
          >
            <span>ค้นหาบริการช่วยเหลือของมหาวิทยาลัย</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

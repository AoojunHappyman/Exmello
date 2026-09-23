'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Stars,
  RotateCcw,
  Timer,
  Wind,
  Coffee,
  BookOpen,
} from 'lucide-react';
import { getRecommendation } from '@/lib/recommendations';
import { getLastCheckIn } from '@/lib/storage';
import { MoodType, ConcernType, NeedType, RecommendationResult } from '@/types';
import { getAuthSession, getCheckin, getCheckins, readableApiError } from '@/lib/api';

function RecommendationContent() {
  const searchParams = useSearchParams();

  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setRecommendation(null);
    setError('');
    if (getAuthSession()) {
      const checkinId = searchParams.get('checkinId');
      const load = checkinId ? getCheckin(checkinId) : getCheckins(1).then((items) => items[0]);
      load.then((checkin) => {
        if (!active) return;
        if (checkin) setRecommendation(checkin.recommendation);
        else setError('ยังไม่มีเช็กอินในบัญชี เริ่มเช็กอินเพื่อรับคำแนะนำได้เลย');
      }).catch((cause) => { if (active) setError(readableApiError(cause)); });
      return () => { active = false; };
    }
    if (searchParams.get('checkinId')) {
      setError('กรุณาเข้าสู่ระบบเพื่อดูคำแนะนำที่บันทึกไว้');
      return () => { active = false; };
    }
    const moodParam = searchParams.get('mood') as MoodType | null;
    const concernParams = searchParams.getAll('concern') as ConcernType[];
    const needParam = searchParams.get('need') as NeedType | null;

    if (moodParam && concernParams.length > 0) {
      setRecommendation(getRecommendation(moodParam, concernParams, needParam || undefined));
    } else {
      // Try local storage from last session
      const last = getLastCheckIn();
      if (last) {
        setRecommendation(getRecommendation(last.mood, last.concerns, last.need));
      } else {
        // Fallback default
        setRecommendation(getRecommendation('stressed', ['cant_finish'], 'focus'));
      }
    }
    return () => { active = false; };
  }, [searchParams]);

  if (error) return <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center"><p role="alert" className="text-sm text-red-700">{error}</p><Link href={searchParams.get('checkinId') && !getAuthSession() ? '/login' : '/checkin'} className="text-primary font-semibold underline">{searchParams.get('checkinId') && !getAuthSession() ? 'เข้าสู่ระบบ' : 'ไปเช็กอิน'}</Link></div>;

  if (!recommendation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl animate-bounce">🌱</span>
          <p className="text-sm font-semibold text-primary">กำลังเตรียมแผนที่อ่อนโยนสำหรับคุณ...</p>
        </div>
      </div>
    );
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'focus':
        return <Timer className="w-5 h-5 text-white" />;
      case 'breathing':
        return <Wind className="w-5 h-5 text-white" />;
      case 'reset':
        return <Coffee className="w-5 h-5 text-white" />;
      default:
        return <BookOpen className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Supportive Back / Check-in link */}
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <Link
            href="/checkin"
            className="inline-flex items-center gap-1 hover:text-text-primary transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>เช็กอินใหม่อีกครั้ง</span>
          </Link>
          <span className="bg-secondary-container px-3 py-1 rounded-full text-primary font-semibold">
            {recommendation.badge || 'คัดสรรมาเพื่อคุณ'}
          </span>
        </div>

        {/* Main Recommendation Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-surface-lowest rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/60 flex flex-col sm:flex-row items-start justify-between gap-8"
        >
          <div className="space-y-4 max-w-lg flex-grow">
            <div className="inline-flex items-center gap-1.5 text-[#E08A3C] text-xs font-bold uppercase tracking-wider">
              <Stars className="w-4 h-4" />
              <span>ก้าวถัดไปที่แนะนำ</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-primary font-display leading-snug">
              {recommendation.headline}
            </h1>

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              {recommendation.message}
            </p>

            {recommendation.bullets && recommendation.bullets.length > 0 && (
              <div className="bg-surface-container/50 rounded-2xl p-4 border border-stone-200/50">
                <p className="text-xs font-bold text-primary mb-2 font-display uppercase tracking-wider">
                  แผนเล็ก ๆ ที่ทำได้ทันที:
                </p>
                <ol className="space-y-1.5 text-xs sm:text-sm text-text-secondary list-decimal list-inside leading-relaxed">
                  {recommendation.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-3">
              <Link
                href={recommendation.primaryAction.path}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary-container text-white text-sm sm:text-base font-semibold hover:bg-primary shadow-soft active:translate-y-0.5 transition-all w-full sm:w-auto"
              >
                {getActionIcon(recommendation.primaryAction.type)}
                <span>{recommendation.primaryAction.label}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Cute Mascot Graphic */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-secondary-container/40 flex items-center justify-center self-center shrink-0 border border-primary/10 shadow-sm">
            <div className="text-center p-2">
              <span className="text-5xl sm:text-6xl select-none">🐻‍❄️</span>
              <p className="text-xs text-primary font-semibold mt-2 font-sans">
                {recommendation.mascotQuote || 'ค่อย ๆ ทำทีละก้าว'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Secondary Alternatives */}
        <div className="bg-surface-container/60 rounded-3xl p-6 border border-stone-200/60">
          <h3 className="text-sm font-bold text-primary font-display mb-3">
            ยังไม่รู้สึกอยากทำขั้นตอนนี้ใช่ไหม? ลองเลือกทางเลือกเหล่านี้ดูนะ:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendation.secondaryActions.map((sec, idx) => (
              <Link
                key={idx}
                href={sec.path}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-lowest hover:bg-surface-container border border-stone-200/60 text-xs sm:text-sm font-semibold text-primary transition-all shadow-sm"
              >
                <span>{sec.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-secondary" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-sm text-primary">กำลังโหลดคำแนะนำ...</p>
        </div>
      }
    >
      <RecommendationContent />
    </Suspense>
  );
}

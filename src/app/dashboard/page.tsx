'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Timer,
  Wind,
  Sparkles,
  BookOpen,
  ArrowRight,
  Smile,
  Clock,
} from 'lucide-react';
import {
  getActivitySessions,
  getTotalMindfulMinutes,
  getLastCheckIn,
} from '@/lib/storage';
import { FocusSessionRecord, CheckInRecord } from '@/types';
import { MOOD_OPTIONS, CONCERN_OPTIONS } from '@/lib/mock-data';
import { getAuthSession, getDashboard, getFocusSessions, onAuthChange, readableApiError } from '@/lib/api';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<FocusSessionRecord[]>([]);
  const [mindfulMinutes, setMindfulMinutes] = useState<number>(0);
  const [lastCheckIn, setLastCheckIn] = useState<CheckInRecord | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    const load = () => {
      const account = getAuthSession();
      setSignedIn(Boolean(account));
      setLoadError('');
      if (!account) {
        setSessions(getActivitySessions());
        setMindfulMinutes(getTotalMindfulMinutes());
        setLastCheckIn(getLastCheckIn());
        return;
      }
      Promise.all([getDashboard(), getFocusSessions()]).then(([dashboard, focus]) => {
        if (!active) return;
        setMindfulMinutes(dashboard.completed_focus_minutes);
        const checkin = dashboard.recent_checkin;
        setLastCheckIn(checkin ? { id: checkin.id, timestamp: Date.parse(checkin.created_at), mood: checkin.mood, concerns: checkin.concerns, need: checkin.needs[0] } : null);
        setSessions(focus.filter((item) => item.status === 'completed').map((item) => ({ id: item.id, timestamp: Date.parse(item.completed_at || item.started_at), durationMinutes: item.duration_minutes, completed: true, type: 'focus' as const, label: `โฟกัส ${item.duration_minutes} นาที` })));
      }).catch((error) => { if (active) setLoadError(readableApiError(error)); });
    };
    load();
    const unsubscribe = onAuthChange(load);
    return () => { active = false; unsubscribe(); };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 18) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  const matchedMood = MOOD_OPTIONS.find((m) => m.id === lastCheckIn?.mood);
  const matchedConcerns = lastCheckIn?.concerns
    .map((concern) => CONCERN_OPTIONS.find((option) => option.id === concern)?.label)
    .filter((label): label is string => Boolean(label));

  const formatSessionTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'เมื่อสักครู่';
    if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`;
    return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-10 space-y-8">
      {/* Header Greeting */}
      {loadError && <p role="alert" className="text-sm text-red-700">{loadError}</p>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-primary text-xs font-semibold mb-2">
            <span>🌱</span>
            <span>Dashboard ส่วนตัว</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary font-display">
            {getGreeting()}, เพื่อนนักศึกษา 👋
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            ช่วงสอบแบบเบาใจขึ้น นี่คือภาพรวมเวลาที่คุณได้โฟกัสกับการเรียนอย่างมีสติ
          </p>
        </div>

        <Link
          href="/checkin"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-container text-white text-xs sm:text-sm font-semibold hover:bg-primary shadow-sm active:translate-y-0.5 transition-all self-start sm:self-auto"
        >
          <Smile className="w-4 h-4" />
          <span>เช็กอินประจำวัน</span>
        </Link>
      </div>

      {/* Top Metrics Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric 1: Total Mindful Minutes */}
        <div className="bg-surface-lowest rounded-3xl p-6 shadow-card border border-stone-200/60 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E2F5EA] text-[#21674A] flex items-center justify-center shrink-0">
            <Timer className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              เวลาโฟกัสสะสม
            </span>
            <p className="text-3xl font-bold text-primary font-display mt-0.5">
              {mindfulMinutes} <span className="text-base font-normal text-text-secondary">นาที</span>
            </p>
            <span className="text-[11px] text-text-muted">ไม่กดดัน โฟกัสแบบสบายใจ</span>
          </div>
        </div>

        {/* Metric 2: Last Check-In */}
        <div className="bg-surface-lowest rounded-3xl p-6 shadow-card border border-stone-200/60 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E2F0FA] text-[#246A98] flex items-center justify-center text-3xl shrink-0 select-none">
            {matchedMood ? matchedMood.emoji : '🙂'}
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              สภาพจิตใจล่าสุด
            </span>
            <p className="text-lg font-bold text-primary font-display mt-0.5">
              {matchedMood ? matchedMood.label : 'ใจนิ่งและมั่นคง'}
            </p>
            <span className="text-[11px] text-text-muted line-clamp-1">
              {matchedConcerns && matchedConcerns.length > 0
                ? matchedConcerns.join(' • ')
                : 'พร้อมลุยสำหรับวันนี้'}
            </span>
          </div>
        </div>

        {/* Metric 3: Gentle Encouragement */}
        <div className="bg-surface-lowest rounded-3xl p-6 shadow-card border border-stone-200/60 flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-[#FCEEE2] text-[#9A5420] flex items-center justify-center text-3xl shrink-0 select-none">
            🐻‍❄️
          </div>
          <div>
            <span className="text-xs font-semibold text-[#E08A3C] uppercase tracking-wider">
              ไม่มีการนับ Streak หลุด
            </span>
            <p className="text-sm font-bold text-primary font-display mt-0.5">
              พักเมื่อไหร่ก็ได้ที่ใจต้องการ
            </p>
            <span className="text-[11px] text-text-muted">ไม่สร้างความกดดันให้ตัวเอง</span>
          </div>
        </div>
      </div>

      {/* Recommended For You Tools */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary font-display">
          ก้าวถัดไปที่แนะนำ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Focus */}
          <Link
            href="/focus?duration=25"
            className="group p-6 rounded-3xl bg-surface-lowest border border-stone-200/60 hover:border-secondary transition-all shadow-soft flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#E2F5EA] text-[#21674A] flex items-center justify-center mb-3">
                <Timer className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-primary font-display group-hover:text-primary-light transition-colors">
                โฟกัส 25 นาที
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                ช่วงเวลา Pomodoro เงียบ ๆ สำหรับการอ่านหนังสืออย่างมีสมาธิ
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-primary">
              <span>เริ่มเซสชัน</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Breathing */}
          <Link
            href="/breathing?mode=box"
            className="group p-6 rounded-3xl bg-surface-lowest border border-stone-200/60 hover:border-secondary transition-all shadow-soft flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#EDF8E9] text-[#3D7639] flex items-center justify-center mb-3">
                <Wind className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-primary font-display group-hover:text-primary-light transition-colors">
                ฝึกหายใจแบบกล่อง
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                หายใจ 4 จังหวะ (4-4-4-4) เพื่อปรับระบบประสาทให้สงบลง
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-primary">
              <span>เริ่มฝึกหายใจ</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Resources */}
          <Link
            href="/resources"
            className="group p-6 rounded-3xl bg-surface-lowest border border-stone-200/60 hover:border-secondary transition-all shadow-soft flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#ECECFD] text-[#4B449A] flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-primary font-display group-hover:text-primary-light transition-colors">
                แหล่งข้อมูลช่วยเหลือ
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                คู่มือรับมือความกังวลสอบ การจัดตารางนอน และการดูแลจิตใจ
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-primary">
              <span>ดูบทความทั้งหมด</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary font-display">
            กิจกรรมล่าสุด
          </h3>
          <span className="text-xs text-text-muted">{signedIn ? 'บันทึกไว้ในบัญชีของคุณ' : 'บันทึกไว้ในเบราว์เซอร์เครื่องนี้'}</span>
        </div>

        <div className="bg-surface-lowest rounded-3xl border border-stone-200/60 divide-y divide-stone-100 overflow-hidden shadow-soft">
          {sessions.length > 0 ? (
            sessions.slice(0, 5).map((sess) => (
              <div
                key={sess.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-container/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm ${
                      sess.type === 'focus'
                        ? 'bg-[#E2F5EA] text-[#21674A]'
                        : sess.type === 'breathing'
                        ? 'bg-[#EDF8E9] text-[#3D7639]'
                        : 'bg-[#FCEEE2] text-[#9A5420]'
                    }`}
                  >
                    {sess.type === 'focus' ? (
                      <Timer className="w-5 h-5" />
                    ) : sess.type === 'breathing' ? (
                      <Wind className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-primary font-display">
                      {sess.label || `${sess.type} ${sess.durationMinutes} นาที`}
                    </h5>
                    <p className="text-xs text-text-secondary">
                      {sess.durationMinutes} นาที • สำเร็จเรียบร้อย
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatSessionTime(sess.timestamp)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-text-secondary">
              ยังไม่มีกิจกรรมที่บันทึกไว้ ลองเริ่มโฟกัส 25 นาทีหรือฝึกหายใจสั้น ๆ ดูนะ!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { updateUserPreferences } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      updateUserPreferences({
        displayName: email.split('@')[0] || 'เพื่อนนักศึกษา',
        isGuest: false,
      });
      router.push('/dashboard');
    }, 500);
  };

  const handleContinueAsGuest = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md bg-surface-lowest rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/60 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/50 text-primary flex items-center justify-center mx-auto text-2xl">
            🌱
          </div>
          <h1 className="text-2xl font-bold text-primary font-display">
            ยินดีต้อนรับกลับสู่ EXMELLO
          </h1>
          <p className="text-xs text-text-secondary">
            ช่วงสอบแบบเบาใจขึ้น เข้าสู่ระบบเพื่อซิงก์ประวัติการอ่านหนังสือ
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-primary block">
              อีเมลมหาวิทยาลัย หรือ อีเมลส่วนตัว
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container/40 border border-stone-200 text-xs text-text-primary placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-text-primary">รหัสผ่าน</label>
              <a href="#" className="text-secondary hover:underline text-[11px]">
                ลืมรหัสผ่าน?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container/40 border border-stone-200 text-xs text-text-primary placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-primary-container text-white text-xs sm:text-sm font-semibold hover:bg-primary shadow-sm active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-stone-200"></div>
          <span className="flex-shrink mx-4 text-xs text-stone-400">หรือ</span>
          <div className="flex-grow border-t border-stone-200"></div>
        </div>

        {/* Guest Mode Bypass */}
        <button
          type="button"
          onClick={handleContinueAsGuest}
          className="w-full py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors"
        >
          ใช้งานแบบ Guest (ไม่ต้องมีบัญชี)
        </button>

        {/* Footer Link */}
        <p className="text-center text-xs text-text-secondary">
          ยังไม่มีบัญชีใช่ไหม?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            สมัครสมาชิกฟรี
          </Link>
        </p>
      </div>
    </div>
  );
}

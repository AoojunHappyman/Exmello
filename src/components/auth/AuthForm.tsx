'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, readableApiError, register, saveAuthSession } from '@/lib/api';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const isRegister = mode === 'register';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const session = isRegister ? await register(email.trim(), password, name.trim()) : await login(email.trim(), password);
      saveAuthSession(session);
      router.push('/dashboard');
    } catch (cause) {
      setError(readableApiError(cause));
      setPending(false);
    }
  }

  return <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4">
    <div className="w-full max-w-md bg-surface-lowest rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/60 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-secondary-container/50 flex items-center justify-center mx-auto text-2xl" aria-hidden="true">🌱</div>
        <h1 className="text-2xl font-bold text-primary font-display">{isRegister ? 'สมัครสมาชิก EXMELLO' : 'เข้าสู่ระบบ EXMELLO'}</h1>
        <p className="text-sm text-text-secondary">บันทึกเช็กอินและเวลาโฟกัสไว้ในบัญชีของคุณ</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {isRegister && <label className="block text-sm font-semibold text-primary">ชื่อ (ไม่บังคับ)<input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 text-text-primary" /></label>}
        <label className="block text-sm font-semibold text-primary">อีเมล<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 text-text-primary" /></label>
        <label className="block text-sm font-semibold text-primary">รหัสผ่าน<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={isRegister ? 8 : 1} maxLength={128} required autoComplete={isRegister ? 'new-password' : 'current-password'} className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 text-text-primary" /></label>
        {isRegister && <p className="text-xs text-text-secondary">ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={pending} className="w-full py-3 rounded-full bg-primary-container text-white text-sm font-semibold hover:bg-primary disabled:opacity-60">{pending ? 'กำลังดำเนินการ...' : isRegister ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}</button>
      </form>
      <p className="text-center text-sm text-text-secondary">{isRegister ? 'มีบัญชีแล้ว?' : 'ยังไม่มีบัญชี?'} <Link href={isRegister ? '/login' : '/register'} className="text-primary font-semibold underline">{isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</Link></p>
      <div className="text-center"><Link href="/checkin" className="text-xs text-secondary hover:underline">ใช้งานต่อโดยไม่ต้องมีบัญชี</Link></div>
    </div>
  </div>;
}

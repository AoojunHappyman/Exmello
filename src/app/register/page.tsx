import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md bg-surface-lowest rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/60 space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-secondary-container/50 text-primary flex items-center justify-center mx-auto text-2xl" aria-hidden="true">🌱</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary font-display">สมัครสมาชิก EXMELLO</h1>
          <p className="text-sm text-text-secondary leading-relaxed">การสร้างบัญชียังไม่พร้อมใช้งาน ขณะนี้ข้อมูลจะอยู่ในเบราว์เซอร์นี้เท่านั้น และยังซิงก์ข้ามอุปกรณ์ไม่ได้</p>
        </div>
        <div className="rounded-2xl bg-surface-container/60 p-4 flex items-start gap-3 text-left">
          <Lock className="w-5 h-5 text-secondary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-text-secondary leading-relaxed">ไม่ต้องสมัครสมาชิกก็ใช้ฟีเจอร์หลักของ EXMELLO ได้ทันที</p>
        </div>
        <Link href="/checkin" className="block w-full py-3 rounded-full bg-primary-container text-white text-sm font-semibold hover:bg-primary shadow-sm transition-colors">เริ่มเช็กอินโดยไม่ต้องสมัคร</Link>
        <Link href="/" className="inline-block text-xs text-secondary hover:underline">กลับหน้าแรก</Link>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { HeartHandshake, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#EAF6F0]/70 border-t border-stone-200/60 mt-20 pb-20 lg:pb-12">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-12 pb-8">
        {/* Student Wellness & Care Reminder Banner */}
        <div className="bg-surface-lowest rounded-3xl p-6 sm:p-8 mb-12 shadow-soft border border-stone-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/60 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <HeartHandshake className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-primary mb-1 font-display">
                ข้อควรทราบในการดูแลสุขภาพใจ
              </h4>
              <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
                EXMELLO เป็นเพื่อนช่วยดูแลใจช่วงสอบ ไม่ใช่ผู้ให้บริการทางการแพทย์ หากคุณต้องการความช่วยเหลือเร่งด่วน โปรดติดต่อศูนย์ให้คำปรึกษาของมหาวิทยาลัยหรือสายด่วนสุขภาพจิต
              </p>
            </div>
          </div>
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-secondary-container text-primary text-xs font-semibold hover:bg-secondary-fixed transition-colors whitespace-nowrap shadow-sm"
          >
            <span>เบอร์ติดต่อฉุกเฉิน</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer 4-Column Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-stone-200/80">
          {/* Brand Info */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <span className="text-xl font-bold text-primary tracking-tight font-display">
                EXMELLO
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              ความสงบผ่อนคลายและประสิทธิภาพการเรียนรู้อย่างใส่ใจ ออกแบบมาเพื่อเคียงข้างนักศึกษาในช่วงสอบที่เข้มข้น
            </p>
            <p className="text-xs font-medium text-secondary pt-1">
              ก้าวเล็ก ๆ สร้างการเปลี่ยนแปลงที่ยิ่งใหญ่ 🌱
            </p>
          </div>

          {/* Column 2: Companion Tools */}
          <div>
            <h5 className="text-sm font-bold text-text-primary mb-4 font-display">
              เครื่องมือช่วยดูแลใจ
            </h5>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link href="/breathing" className="hover:text-primary transition-colors">
                  วงกลมฝึกหายใจ (Breathing)
                </Link>
              </li>
              <li>
                <Link href="/checkin" className="hover:text-primary transition-colors">
                  เช็กอินประจำวัน
                </Link>
              </li>
              <li>
                <Link href="/focus" className="hover:text-primary transition-colors">
                  โหมดโฟกัส (Focus Timer)
                </Link>
              </li>
              <li>
                <Link href="/reset" className="hover:text-primary transition-colors">
                  ศูนย์รีเซ็ตตัวเองด่วน
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/sleep-better-study-better"
                  className="hover:text-primary transition-colors"
                >
                  เตรียมตัวเข้านอนเพื่อความจำ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div>
            <h5 className="text-sm font-bold text-text-primary mb-4 font-display">
              การนำทาง
            </h5>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link href="/#core-features" className="hover:text-primary transition-colors">
                  ฟีเจอร์ทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-primary transition-colors">
                  เริ่มต้นอย่างไร
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-primary transition-colors">
                  แหล่งข้อมูลสำหรับนักศึกษา
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard ของฉัน
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Safety */}
          <div>
            <h5 className="text-sm font-bold text-text-primary mb-4 font-display">
              ความช่วยเหลือ & ความปลอดภัย
            </h5>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  รวมสายด่วนและศูนย์ในมหาวิทยาลัย
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  สายด่วนสุขภาพจิต 24 ชม.
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary transition-colors">
                  ตั้งค่าความเป็นส่วนตัว & ข้อมูล
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  เข้าสู่ระบบบัญชี
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Badge */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© 2025 EXMELLO Inc. สร้างขึ้นด้วยความอบอุ่นเพื่อใจที่สงบ</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-primary font-medium">
              <span>🌱</span>
              <span>เทคโนโลยีเพื่อจิตใจนักศึกษา</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

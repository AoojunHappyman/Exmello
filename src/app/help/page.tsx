import React from 'react';
import Link from 'next/link';
import { Phone, ShieldAlert, HeartHandshake, ArrowRight } from 'lucide-react';
import { CRISIS_RESOURCES } from '@/lib/mock-data';

export default function HelpPage() {
  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEAE8] text-[#A63737] text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ศูนย์ช่วยเหลือ & สายด่วนสุขภาพจิต</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary font-display">
            ความช่วยเหลือพร้อมอยู่เคียงข้างคุณเสมอ
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            หากคุณกำลังรู้สึกเครียดจนรับไม่ไหว วิตกกังวลรุนแรง หรือต้องการคนรับฟัง โปรดติดต่อผู้เชี่ยวชาญเหล่านี้ได้ทันที คุณไม่ต้องแบกรับช่วงเวลานี้ไว้เพียงลำพังนะ
          </p>
        </div>

        {/* Clinical Disclaimer Banner */}
        <div className="p-6 rounded-3xl bg-[#EAF6F0] border border-[#C3E8D1] flex items-start gap-4">
          <HeartHandshake className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-text-secondary leading-relaxed">
            <h4 className="font-bold text-primary font-display">ข้อควรทราบในการดูแลสุขภาพใจ</h4>
            <p>
              EXMELLO เป็นเพื่อนช่วยดูแลใจในชีวิตประจำวัน ไม่ใช่ผู้ให้บริการทางการแพทย์ หรือสายด่วนบำบัดทางจิตเวช เบอร์ติดต่อด้านล่างนี้เป็นหน่วยงานอิสระที่มีผู้เชี่ยวชาญพร้อมรับฟังตลอด 24 ชั่วโมงโดยไม่มีค่าใช้จ่าย
            </p>
          </div>
        </div>

        {/* Crisis Contact Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary font-display">
            สายด่วนและบริการให้คำปรึกษาฟรี
          </h3>

          <div className="space-y-3">
            {CRISIS_RESOURCES.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-surface-lowest border border-stone-200/60 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                      {item.region}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-primary text-[10px] font-bold">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-primary font-display">
                    {item.title}
                  </h4>
                  <p className="text-xs text-text-secondary">
                    {item.description}
                  </p>
                </div>

                <div className="self-start sm:self-center shrink-0">
                  <a
                    href={item.number.includes('.') ? `https://${item.number}` : `tel:${item.number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-container text-white text-xs sm:text-sm font-bold hover:bg-primary shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{item.number}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Immediate In-the-Moment Steps */}
        <div className="bg-surface-lowest rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/60 space-y-4">
          <h3 className="text-lg font-bold text-primary font-display">
            หากคุณกำลังรู้สึกตื่นตระหนกหรือแพนิคในตอนนี้:
          </h3>
          <ol className="space-y-2.5 text-xs sm:text-sm text-text-secondary list-decimal list-inside leading-relaxed">
            <li>
              <strong>ลุกออกจากโต๊ะอ่านหนังสือทันที:</strong> การเปลี่ยนบรรยากาศรอบตัวจะช่วยตัดวงจรความคิดที่แล่นวนในหัว
            </li>
            <li>
              <strong>ล้างหน้าหรือประคบน้ำเย็นที่ข้อมือ:</strong> น้ำเย็นช่วยกระตุ้น Mammalian Dive Reflex ช่วยชะลออัตราการเต้นของหัวใจได้อย่างรวดเร็ว
            </li>
            <li>
              <strong>ทักหาเพื่อนหรือคนที่คุณไว้ใจ:</strong> บอกพวกเขาว่า &quot;ตอนนี้เรารู้สึกกังวลเรื่องสอบ ขอคุยด้วยสัก 5-10 นาทีได้ไหม&quot;
            </li>
          </ol>

          <div className="pt-2">
            <Link
              href="/breathing?mode=sigh"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-container text-primary text-xs font-semibold hover:bg-secondary-fixed transition-colors"
            >
              <span>ฝึกหายใจแบบถอนใจเพื่อดึงสติ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

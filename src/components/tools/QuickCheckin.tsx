"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Smile } from "lucide-react";
import { MOOD_OPTIONS, CONCERN_OPTIONS } from "@/lib/mock-data";
import { MoodType, ConcernType } from "@/types";
import { submitCheckin } from "@/lib/checkin";
import { readableApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
export function QuickCheckin() {
  const router = useRouter();
  const [mood, setMood] = useState<MoodType | null>(null);
  const [concerns, setConcerns] = useState<ConcernType[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  function toggle(value: ConcernType) {
    setError("");
    if (concerns.includes(value))
      setConcerns(concerns.filter((item) => item !== value));
    else if (concerns.length < 3) setConcerns([...concerns, value]);
    else setError("เลือกได้สูงสุด 3 ข้อ ลองยกเลิกข้อหนึ่งก่อนนะ");
  }
  async function submit() {
    if (!mood || !concerns.length || pending) return;
    setPending(true);
    setError("");
    try {
      router.push(await submitCheckin(mood, concerns));
    } catch (cause) {
      setError(readableApiError(cause));
      setPending(false);
    }
  }
  return (
    <section
      className="relative rounded-[28px] border border-[#DAE4D8] bg-white p-5 shadow-[0_24px_70px_-32px_#44655355] sm:p-7"
      aria-label="เช็กอินด่วน"
    >
      <div className="flex items-center justify-between border-b border-[#E8ECE5] pb-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <Smile size={17} />
          พื้นที่ของคุณ วันนี้
        </span>
        <span className="text-xs text-text-muted">15 วินาทีก็พอ</span>
      </div>
      <h2 className="mb-4 mt-5 text-xl font-semibold text-primary">
        ตอนนี้รู้สึกอย่างไร?
      </h2>
      <div
        className="grid grid-cols-3 gap-2 sm:grid-cols-5"
        role="group"
        aria-label="เลือกความรู้สึก"
      >
        {MOOD_OPTIONS.map((item) => (
          <button
            key={item.id}
            disabled={pending}
            aria-pressed={mood === item.id}
            onClick={() => setMood(item.id)}
            className="selection flex min-h-[88px] flex-col items-center justify-center !px-1 !py-3 text-center"
          >
            <span aria-hidden="true" className="text-2xl">
              {item.emoji}
            </span>
            <span className="mt-2 text-xs font-medium text-primary">
              {item.label}
            </span>
            {mood === item.id && (
              <Check
                size={12}
                className="absolute right-1 top-1"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>
      <p className="mb-3 mt-5 text-sm font-semibold text-primary">
        มีอะไรที่กวนใจอยู่บ้าง?{" "}
        <span className="font-normal text-text-muted">(1–3 ข้อ)</span>
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="เลือกสิ่งที่กวนใจ"
      >
        {CONCERN_OPTIONS.map((item) => (
          <button
            key={item.id}
            disabled={pending}
            aria-pressed={concerns.includes(item.id)}
            onClick={() => toggle(item.id)}
            className="selection inline-flex min-h-11 items-center gap-1.5 !rounded-full !px-3 !py-1.5 text-xs text-primary"
          >
            {concerns.includes(item.id) && (
              <Check size={13} aria-hidden="true" />
            )}
            {item.label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button
        className="mt-6 w-full"
        disabled={!mood || !concerns.length}
        loading={pending}
        onClick={() => void submit()}
        icon={<ArrowRight size={17} />}
      >
        ดูก้าวถัดไปของฉัน
      </Button>
      <p className="mt-3 text-center text-xs text-text-muted">
        ไม่มีคำตอบที่ถูกหรือผิด มีแค่สิ่งที่คุณรู้สึก
      </p>
    </section>
  );
}

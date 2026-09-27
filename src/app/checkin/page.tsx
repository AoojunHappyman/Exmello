"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Leaf } from "lucide-react";
import { MOOD_OPTIONS, CONCERN_OPTIONS, NEED_OPTIONS } from "@/lib/mock-data";
import { MoodType, ConcernType, NeedType } from "@/types";
import { submitCheckin } from "@/lib/checkin";
import { readableApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function CheckinPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<MoodType | null>(null);
  const [concerns, setConcerns] = useState<ConcernType[]>([]);
  const [need, setNeed] = useState<NeedType | undefined>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus();
    previousStep.current = step;
  }, [step]);
  function toggle(concern: ConcernType) {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter((value) => value !== concern));
      setLimit(false);
    } else if (concerns.length < 3) {
      setConcerns([...concerns, concern]);
      setLimit(false);
    } else setLimit(true);
  }
  async function finish(skip = false) {
    if (!mood || !concerns.length || pending) return;
    setPending(true);
    setError("");
    try {
      router.push(await submitCheckin(mood, concerns, skip ? undefined : need));
    } catch (cause) {
      setError(readableApiError(cause));
      setPending(false);
    }
  }
  const titles = [
    "ตอนนี้คุณรู้สึกอย่างไร?",
    "มีอะไรที่กวนใจอยู่บ้าง?",
    "ตอนนี้อยากได้อะไรมากที่สุด?",
  ];
  return (
    <div className="page-shell max-w-3xl">
      <div className="mb-7 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-secondary"
        >
          <ArrowLeft size={16} />
          กลับหน้าแรก
        </Link>
        <span className="eyebrow">A MOMENT FOR YOU</span>
      </div>
      <div className="card !p-5 sm:!p-9">
        <ol aria-label="ขั้นตอนเช็กอิน" className="mb-8 grid grid-cols-3 gap-3">
          {["ความรู้สึก", "สิ่งที่กวนใจ", "สิ่งที่ต้องการ"].map(
            (label, index) => (
              <li key={label}>
                <button
                  aria-current={step === index + 1 ? "step" : undefined}
                  disabled={pending || index + 1 > step}
                  onClick={() => {
                    setStep(index + 1);
                    setError("");
                  }}
                  className={`flex w-full flex-col items-start gap-2 border-t-2 pt-3 text-left ${step >= index + 1 ? "border-primary-container text-primary" : "border-[#E3E8E1] text-text-muted"}`}
                >
                  <span className="inline-flex items-center gap-2 text-xs font-semibold">
                    {step > index + 1 ? <Check size={14} /> : `0${index + 1}`}
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                  <span className="text-xs sm:hidden">{label}</span>
                </button>
              </li>
            ),
          )}
        </ol>
        <div className="mb-7">
          <p className="eyebrow">
            CHECK-IN · {step} / 3 {step === 3 && "· ข้ามได้"}
          </p>
          <h1
            ref={heading}
            tabIndex={-1}
            className="mt-3 text-2xl font-semibold text-primary outline-none sm:text-3xl"
          >
            {titles[step - 1]}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {step === 1
              ? "ไม่มีคำตอบที่ถูกหรือผิด เลือกสิ่งที่ตรงกับคุณที่สุด"
              : step === 2
                ? "เลือกได้สูงสุด 3 ข้อ ไม่ต้องจัดการทุกเรื่องพร้อมกัน"
                : "เลือกเพียงหนึ่งอย่าง หรือให้ EXMELLO ช่วยเลือกจากเช็กอินของคุณ"}
          </p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            {step === 1 && (
              <div
                className="grid gap-3 sm:grid-cols-5"
                role="group"
                aria-label="เลือกความรู้สึก"
              >
                {MOOD_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMood(item.id)}
                    aria-pressed={mood === item.id}
                    className="selection flex items-center gap-4 sm:flex-col sm:gap-2 sm:text-center"
                  >
                    <span aria-hidden="true" className="text-3xl">
                      {item.emoji}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {item.label}
                    </span>
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full border border-sage-300 sm:ml-0">
                      {mood === item.id && <Check size={13} />}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {step === 2 && (
              <>
                <div
                  role="group"
                  aria-describedby="concern-status"
                  aria-label="เลือกสิ่งที่กวนใจ"
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {CONCERN_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      aria-pressed={concerns.includes(item.id)}
                      className="selection flex items-center gap-3"
                    >
                      <span aria-hidden="true" className="text-xl">
                        {item.icon}
                      </span>
                      <span className="flex-1 text-sm font-medium text-primary">
                        {item.label}
                      </span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-md border border-sage-300">
                        {concerns.includes(item.id) && <Check size={14} />}
                      </span>
                    </button>
                  ))}
                </div>
                <p
                  id="concern-status"
                  role="status"
                  className={`mt-4 text-sm ${limit ? "text-[#994F27]" : "text-secondary"}`}
                >
                  {limit
                    ? "เลือกครบ 3 ข้อแล้ว ยกเลิกข้อหนึ่งก่อนเลือกใหม่ได้นะ"
                    : `เลือกแล้ว ${concerns.length} / 3 ข้อ`}
                </p>
              </>
            )}
            {step === 3 && (
              <div
                className="grid gap-3 sm:grid-cols-2"
                role="group"
                aria-label="สิ่งที่ต้องการ"
              >
                {NEED_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    disabled={pending}
                    aria-pressed={need === item.id}
                    onClick={() =>
                      setNeed(need === item.id ? undefined : item.id)
                    }
                    className="selection flex items-start gap-3"
                  >
                    <span aria-hidden="true" className="text-2xl">
                      {item.emoji}
                    </span>
                    <span className="flex-1">
                      <span className="block text-base font-semibold text-primary">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-sm text-text-secondary">
                        {item.description}
                      </span>
                    </span>
                    {need === item.id && <Check size={17} />}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-2xl bg-accent-amber p-4 text-sm text-[#704729]"
          >
            {error}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#E3E8E1] pt-6">
          {step > 1 ? (
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setStep(step - 1);
                setError("");
              }}
              icon={<ArrowLeft size={16} />}
              iconPosition="left"
            >
              ย้อนกลับ
            </Button>
          ) : (
            <span className="text-xs text-text-muted">
              เลือกตามความรู้สึกได้เลย
            </span>
          )}
          {step < 3 ? (
            <Button
              disabled={step === 1 ? !mood : !concerns.length}
              onClick={() => setStep(step + 1)}
              icon={<ArrowRight size={16} />}
            >
              ต่อไป
            </Button>
          ) : (
            <Button
              className="w-full sm:w-auto"
              loading={pending}
              onClick={() => void finish()}
              icon={<ArrowRight size={16} />}
            >
              {pending ? "กำลังเตรียมคำแนะนำ" : "ดูก้าวถัดไปของฉัน"}
            </Button>
          )}
        </div>
        {step === 3 && (
          <button
            disabled={pending}
            onClick={() => void finish(true)}
            className="mt-3 w-full text-sm text-secondary underline underline-offset-4"
          >
            ข้าม แล้วให้ EXMELLO ช่วยเลือก
          </button>
        )}
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-text-muted">
        <Leaf size={15} />
        วันนี้แค่ฟังตัวเอง ก็เป็นการเริ่มต้นที่ดีแล้ว
      </p>
    </div>
  );
}

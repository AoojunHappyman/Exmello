"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Droplets,
  Activity,
  Feather,
  Play,
  Pause,
  RotateCcw,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getUserPreferences, saveActivitySession } from "@/lib/storage";
import { playGentleChime } from "@/lib/sound";

const tabs = [
  { id: "eyes", label: "พักสายตา", icon: Eye },
  { id: "hydrate", label: "น้ำและท่านั่ง", icon: Droplets },
  { id: "stretch", label: "ยืดเส้น", icon: Activity },
  { id: "dump", label: "วางความคิด", icon: Feather },
] as const;
function chime() {
  if (getUserPreferences().soundEnabled) playGentleChime();
}

export default function QuickResetPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("eyes");
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [eyeDone, setEyeDone] = useState(false);
  const remaining = useRef(60000);
  const endAt = useRef(0);
  const eyeSaved = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [dump, setDump] = useState("");
  const [released, setReleased] = useState(false);

  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + remaining.current;
    const timer = setInterval(() => {
      remaining.current = Math.max(0, endAt.current - Date.now());
      setSeconds(Math.ceil(remaining.current / 1000));
      if (remaining.current === 0 && !eyeSaved.current) {
        eyeSaved.current = true;
        setRunning(false);
        setEyeDone(true);
        chime();
        saveActivitySession(1, "reset", true, "พักสายตา 60 วินาที");
      }
    }, 200);
    return () => clearInterval(timer);
  }, [running]);
  function toggleEyes() {
    if (running) {
      remaining.current = Math.max(0, endAt.current - Date.now());
      setSeconds(Math.ceil(remaining.current / 1000));
    }
    setRunning(!running);
  }
  function resetEyes() {
    setRunning(false);
    setSeconds(60);
    remaining.current = 60000;
    eyeSaved.current = false;
    setEyeDone(false);
  }
  return (
    <div className="page-shell">
      <div className="mx-auto max-w-3xl">
        <header>
          <p className="eyebrow">A moment to reset</p>
          <h1 className="page-title mt-3">พักสั้น ๆ แล้วค่อยไปต่อ</h1>
          <p className="mt-4 max-w-xl text-text-secondary">
            เลือกสิ่งเล็ก ๆ ที่อยากทำให้ตัวเองตอนนี้ ใช้เวลาเพียง 1–3 นาที
          </p>
        </header>
        <div
          role="group"
          aria-label="เลือกกิจกรรมพัก"
          className="my-8 grid grid-cols-2 gap-2 rounded-3xl bg-surface-container p-2 sm:grid-cols-4"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm ${tab === id ? "bg-white font-semibold text-primary shadow-sm" : "text-secondary hover:bg-white/60"}`}
            >
              {tab === id ? <Check size={17} /> : <Icon size={17} />}
              {label}
            </button>
          ))}
        </div>
        <section
          className="card !p-6 sm:!p-10"
          aria-label={tabs.find((item) => item.id === tab)?.label}
        >
          {tab === "eyes" && (
            <div className="text-center">
              <Eye size={30} className="mx-auto mb-5 text-secondary" />
              <h2 className="text-2xl font-semibold text-primary">
                มองไกลจากหน้าจอสักครู่
              </h2>
              <p className="mx-auto mt-3 max-w-md text-text-secondary">
                มองสิ่งที่อยู่ไกลออกไป เช่น วิวนอกหน้าต่าง
                ผ่อนสายตาและไหล่ตามสบาย
              </p>
              <div className="py-10">
                <p
                  role="timer"
                  aria-label={`เหลือ ${seconds} วินาที`}
                  className="font-display text-7xl font-medium tabular-nums tracking-tight text-primary"
                >
                  {Math.floor(seconds / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(seconds % 60).toString().padStart(2, "0")}
                </p>
                <p role="status" className="mt-4 text-sm text-secondary">
                  {eyeDone
                    ? "ครบหนึ่งนาทีแล้ว ขอบคุณที่ให้ตัวเองได้พัก"
                    : running
                      ? "ช่วงเวลานี้ไม่ต้องมองหน้าจอก็ได้"
                      : "เริ่มเมื่อคุณพร้อม"}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={toggleEyes}
                  disabled={eyeDone}
                  icon={
                    eyeDone ? (
                      <Check size={18} />
                    ) : running ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )
                  }
                  iconPosition="left"
                >
                  {eyeDone
                    ? "พักครบแล้ว"
                    : running
                      ? "พักชั่วคราว"
                      : seconds < 60
                        ? "พักต่อ"
                        : "เริ่มพัก 60 วินาที"}
                </Button>
                <button
                  className="btn btn-secondary !px-3"
                  aria-label="เริ่มพักสายตาใหม่"
                  onClick={resetEyes}
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          )}
          {tab === "hydrate" && (
            <div>
              <Droplets size={30} className="mb-5 text-secondary" />
              <h2 className="text-2xl font-semibold text-primary">
                จิบน้ำ แล้วขยับสักนิด
              </h2>
              <p className="mt-3 text-text-secondary">
                พักจากโต๊ะอ่านหนังสือ ให้เวลาร่างกายได้เปลี่ยนท่า
              </p>
              <ol className="my-8 space-y-4">
                <li className="rounded-2xl bg-surface p-5">
                  <h3 className="font-semibold text-primary">
                    01 · จิบน้ำสักหน่อย
                  </h3>
                  <p className="mt-2 text-sm text-secondary">
                    หยิบแก้วน้ำใกล้ตัว แล้วค่อย ๆ ดื่มตามที่ต้องการ
                  </p>
                </li>
                <li className="rounded-2xl bg-surface p-5">
                  <h3 className="font-semibold text-primary">
                    02 · คลายหัวไหล่
                  </h3>
                  <p className="mt-2 text-sm text-secondary">
                    เปลี่ยนท่านั่ง วางเท้าให้สบาย แล้วหมุนไหล่ช้า ๆ โดยไม่ฝืน
                  </p>
                </li>
              </ol>
              <Button
                className="w-full"
                disabled={hydrated}
                icon={<Check size={18} />}
                iconPosition="left"
                onClick={() => {
                  setHydrated(true);
                  chime();
                  saveActivitySession(
                    0,
                    "reset",
                    true,
                    "ดื่มน้ำและปรับท่านั่ง",
                  );
                }}
              >
                {hydrated ? "บันทึกกิจกรรมแล้ว" : "ฉันได้พักแล้ว"}
              </Button>
              <p className="mt-3 text-center text-xs text-text-muted">
                บันทึกกิจกรรมโดยไม่ประมาณเวลาแทนคุณ
              </p>
            </div>
          )}
          {tab === "stretch" && (
            <div>
              <Activity size={30} className="mb-5 text-secondary" />
              <h2 className="text-2xl font-semibold text-primary">
                ขยับเบา ๆ ประมาณ 2 นาที
              </h2>
              <p className="mt-3 text-text-secondary">
                ค่อย ๆ ทำในช่วงที่สบาย หยุดได้เมื่อรู้สึกไม่สบายตัว
              </p>
              <ol className="my-8 grid gap-4 sm:grid-cols-3">
                {[
                  [
                    "30 วินาที",
                    "ผ่อนคอ",
                    "เอียงศีรษะเข้าหาไหล่เบา ๆ แล้วสลับข้าง",
                  ],
                  [
                    "45 วินาที",
                    "เปลี่ยนท่านั่ง",
                    "วางเท้ากับพื้น ขยับลำตัวช้า ๆ ตามที่สบาย",
                  ],
                  [
                    "45 วินาที",
                    "คลายข้อมือ",
                    "หมุนข้อมือเป็นวงเล็ก ๆ แล้วคลายนิ้วมือ",
                  ],
                ].map(([time, title, body]) => (
                  <li key={title} className="rounded-2xl bg-surface p-5">
                    <p className="text-xs text-secondary">{time}</p>
                    <h3 className="mt-2 font-semibold text-primary">{title}</h3>
                    <p className="mt-3 text-sm text-secondary">{body}</p>
                  </li>
                ))}
              </ol>
              <Link href="/focus" className="btn btn-primary">
                พร้อมแล้ว กลับมาโฟกัส
                <ArrowRight size={17} />
              </Link>
            </div>
          )}
          {tab === "dump" && (
            <div>
              <Feather size={30} className="mb-5 text-secondary" />
              <h2 className="text-2xl font-semibold text-primary">
                วางสิ่งที่อยู่ในหัวไว้ตรงนี้
              </h2>
              <p className="mt-3 text-text-secondary">
                พิมพ์ได้อย่างอิสระ ไม่ต้องเรียบเรียงให้ดี
              </p>
              <label
                htmlFor="brain-dump"
                className="mb-2 mt-7 block text-sm font-semibold text-primary"
              >
                ตอนนี้กำลังคิดอะไรอยู่?
              </label>
              <textarea
                id="brain-dump"
                rows={6}
                value={dump}
                onChange={(e) => {
                  setDump(e.target.value);
                  setReleased(false);
                }}
                placeholder="เริ่มจากเรื่องที่อยากวางลงสักครู่…"
                className="field resize-y"
              />
              <p className="mt-2 text-xs text-secondary">
                ข้อความอยู่บนหน้านี้เท่านั้น
                ไม่บันทึกหรือส่งข้อความไปยังเซิร์ฟเวอร์
              </p>
              <div className="mt-6">
                <Button
                  disabled={!dump.trim()}
                  onClick={() => {
                    setDump("");
                    setReleased(true);
                    chime();
                    saveActivitySession(
                      0,
                      "reset",
                      true,
                      "วางความคิด (Brain dump)",
                    );
                  }}
                  icon={<Feather size={18} />}
                  iconPosition="left"
                >
                  ล้างข้อความและปล่อยวาง
                </Button>
                <p role="status" className="mt-4 text-sm text-secondary">
                  {released
                    ? "ล้างข้อความแล้ว หายใจสบาย ๆ แล้วค่อยไปต่อนะ"
                    : "เมื่อกดปล่อยวาง ข้อความจะถูกล้างออก"}
                </p>
              </div>
            </div>
          )}
        </section>
        <p className="mt-6 text-center text-xs text-text-muted">
          ประวัติกิจกรรมพักบันทึกเฉพาะในเบราว์เซอร์นี้
        </p>
      </div>
    </div>
  );
}

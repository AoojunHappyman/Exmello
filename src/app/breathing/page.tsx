"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { BreathingCircle } from "@/components/tools/BreathingCircle";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getUserPreferences, saveActivitySession } from "@/lib/storage";
import { playGentleChime } from "@/lib/sound";

const PHASES = {
  box: [
    { phase: "inhale", text: "หายใจเข้า", seconds: 4 },
    { phase: "hold", text: "พักลมหายใจ", seconds: 4 },
    { phase: "exhale", text: "หายใจออก", seconds: 4 },
    { phase: "rest", text: "พักลมหายใจ", seconds: 4 },
  ],
  sigh: [
    { phase: "inhale", text: "หายใจเข้า", seconds: 2 },
    { phase: "inhale", text: "สูดเข้าอีกนิด", seconds: 1.5 },
    { phase: "exhale", text: "หายใจออกช้า ๆ", seconds: 5 },
  ],
} as const;
type Mode = keyof typeof PHASES;

function BreathingContent() {
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    params.get("mode") === "sigh" ? "sigh" : "box",
  );
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sound, setSound] = useState(true);
  const [nextMode, setNextMode] = useState<Mode | null>(null);
  const saved = useRef(false);
  const elapsedRef = useRef(0);
  const anchor = useRef(0);
  const id = useRef("");
  const phases = PHASES[mode];
  const cycleMs = phases.reduce((sum, p) => sum + p.seconds * 1000, 0);
  const totalMs = cycleMs * 4;
  const completed = elapsed >= totalMs;
  const withinCycle = elapsed % cycleMs;
  let boundary = 0;
  const current =
    phases.find((p) => {
      boundary += p.seconds * 1000;
      return withinCycle < boundary;
    }) || phases[0];

  useEffect(() => setSound(getUserPreferences().soundEnabled), []);
  useEffect(() => {
    if (!running) return;
    anchor.current = Date.now() - elapsedRef.current;
    const tick = () => {
      const value = Math.min(totalMs, Date.now() - anchor.current);
      elapsedRef.current = value;
      setElapsed(value);
    };
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [running, totalMs]);
  useEffect(() => {
    if (!completed || saved.current) return;
    saved.current = true;
    setRunning(false);
    if (sound) playGentleChime();
    saveActivitySession(
      totalMs / 60000,
      "breathing",
      true,
      mode === "box" ? "หายใจแบบกล่อง 4 รอบ" : "หายใจถอนใจ 4 รอบ",
      id.current,
    );
  }, [completed, mode, sound, totalMs]);

  function reset(newMode = mode) {
    setRunning(false);
    setElapsed(0);
    elapsedRef.current = 0;
    saved.current = false;
    id.current = "";
    setMode(newMode);
  }
  function toggle() {
    if (running) {
      const value = Math.min(totalMs, Date.now() - anchor.current);
      elapsedRef.current = value;
      setElapsed(value);
    }
    if (!id.current) id.current = crypto.randomUUID();
    setRunning(!running);
  }
  return (
    <div className="tool-shell">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">A softer breath</p>
        <h1 className="page-title mt-3">ค่อย ๆ กลับมาที่ลมหายใจ</h1>
        <p className="mt-3 text-text-secondary">
          ไม่ต้องรีบ แค่ให้เวลาตัวเองสักครู่
        </p>
        <div
          role="group"
          aria-label="เลือกรูปแบบการหายใจ"
          className="mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-surface-container p-1.5"
        >
          {(["box", "sigh"] as const).map((item) => (
            <button
              key={item}
              aria-pressed={mode === item}
              onClick={() => {
                if (item === mode) return;
                if ((elapsed > 0 && !completed) || running) setNextMode(item);
                else reset(item);
              }}
              className={`rounded-xl px-3 py-3 text-sm ${mode === item ? "bg-white font-semibold shadow-sm" : "text-secondary"}`}
            >
              {mode === item && <Check size={14} className="mr-1 inline" />}
              {item === "box" ? "Box breathing" : "ถอนหายใจเบา ๆ"}
            </button>
          ))}
        </div>
        <section className="card mt-6 !px-5 sm:!px-8">
          <div className="flex items-center justify-between text-sm text-secondary">
            <span>
              {completed
                ? "ครบ 4 รอบแล้ว"
                : `รอบที่ ${Math.min(4, Math.floor(elapsed / cycleMs) + 1)} / 4`}{" "}
              · {totalMs / 1000} วินาที
            </span>
            <button
              onClick={() => setSound(!sound)}
              aria-pressed={sound}
              aria-label={sound ? "ปิดเสียงเตือน" : "เปิดเสียงเตือน"}
              className="btn btn-secondary !px-3"
            >
              {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
          </div>
          {completed ? (
            <div role="status" className="py-12">
              <Check className="mx-auto mb-5 text-primary" size={40} />
              <h2 className="text-2xl font-semibold text-primary">
                ขอบคุณที่ให้เวลาตัวเอง
              </h2>
              <p className="mt-3 text-sm text-secondary">
                ฝึกหายใจครบ 4 รอบแล้ว ลองสังเกตว่าตอนนี้คุณรู้สึกอย่างไร
              </p>
            </div>
          ) : (
            <div className="py-5">
              <BreathingCircle
                phase={running ? current.phase : "idle"}
                phaseText={
                  running
                    ? current.text
                    : elapsed > 0
                      ? "พักอยู่ ค่อยกลับมาเมื่อพร้อม"
                      : "จัดท่าให้สบาย"
                }
                subText={
                  running
                    ? `${current.seconds} วินาที · ตามจังหวะที่คุณสบาย`
                    : "ผ่อนหัวไหล่ แล้วเริ่มเมื่อพร้อม"
                }
                duration={current.seconds}
                size="lg"
              />
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            {completed ? (
              <>
                <Link href="/focus" className="btn btn-primary">
                  กลับมาโฟกัส
                </Link>
                <Button variant="secondary" onClick={() => reset()}>
                  ฝึกอีกรอบ
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={toggle}
                  icon={running ? <Pause size={18} /> : <Play size={18} />}
                  iconPosition="left"
                >
                  {running
                    ? "พักชั่วคราว"
                    : elapsed > 0
                      ? "ฝึกต่อ"
                      : "เริ่มฝึกหายใจ"}
                </Button>
                <button
                  className="btn btn-secondary !px-3"
                  aria-label="เริ่มฝึกหายใจใหม่"
                  disabled={!elapsed && !running}
                  onClick={() => reset()}
                >
                  <RotateCcw size={18} />
                </button>
              </>
            )}
          </div>
          <p className="mt-6 text-xs text-text-muted">
            ประวัติการฝึกหายใจบันทึกเฉพาะในเบราว์เซอร์นี้
          </p>
        </section>
        <p className="mx-auto mt-6 max-w-md text-sm text-secondary">
          หายใจตามจังหวะที่สบาย หยุดพักได้ทุกเมื่อที่ต้องการ
        </p>
        <Modal
          open={nextMode !== null}
          title="เปลี่ยนรูปแบบการหายใจ?"
          onClose={() => setNextMode(null)}
        >
          <p className="text-sm text-secondary">
            รอบปัจจุบันจะเริ่มใหม่ตามรูปแบบที่เลือก
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setNextMode(null)}>
              ฝึกแบบเดิมต่อ
            </Button>
            <Button
              onClick={() => {
                if (nextMode) reset(nextMode);
                setNextMode(null);
              }}
            >
              เปลี่ยนรูปแบบ
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
export default function BreathingPage() {
  return (
    <Suspense
      fallback={
        <div className="tool-shell" role="status">
          กำลังเตรียมพื้นที่หายใจ…
        </div>
      }
    >
      <BreathingContent />
    </Suspense>
  );
}

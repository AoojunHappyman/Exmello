"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coffee,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useFocusSession } from "@/lib/useFocusSession";
import { getUserPreferences } from "@/lib/storage";
import { playGentleChime } from "@/lib/sound";
import { ProgressRing } from "@/components/tools/ProgressRing";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function FocusTimer({
  initialMinutes,
  compact = false,
}: {
  initialMinutes?: number;
  compact?: boolean;
}) {
  const { clock, seconds, pending, hydrated, error, start, reset, retry } =
    useFocusSession(initialMinutes);
  const [sound, setSound] = useState(true);
  const [immersive, setImmersive] = useState(false);
  const [confirmMinutes, setConfirmMinutes] = useState<number | null>(null);
  const space = useRef<HTMLDivElement>(null);
  const previous = useRef(clock.status);
  const reducedMotion = useReducedMotion();
  useEffect(() => setSound(getUserPreferences().soundEnabled), []);
  useEffect(() => {
    if (clock.status === "completed" && previous.current === "elapsed") {
      if (sound) playGentleChime();
      if (!reducedMotion)
        void import("canvas-confetti").then(({ default: confetti }) =>
          confetti({
            particleCount: 35,
            spread: 45,
            origin: { y: 0.65 },
            colors: ["#6C8F7B", "#A8C7B5", "#F2C6A0"],
            disableForReducedMotion: true,
          }),
        );
    }
    previous.current = clock.status;
  }, [clock.status, sound, reducedMotion]);
  useEffect(() => {
    if (!immersive || !space.current) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    space.current.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") setImmersive(false);
      if (event.key !== "Tab") return;
      const items = Array.from(
        space.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not(:disabled)",
        ) || [],
      ).filter((el) => el.getClientRects().length > 0);
      const first = items[0],
        last = items[items.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === space.current)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [immersive]);
  function changeDuration(minutes: number) {
    if (["running", "paused", "elapsed"].includes(clock.status))
      setConfirmMinutes(minutes);
    else void reset(minutes);
  }
  const labels = {
    ready: "พร้อมเมื่อคุณพร้อม",
    running: "ทีละเรื่อง ทีละนิด",
    paused: "พักชั่วคราว",
    elapsed: "โฟกัสครบแล้ว",
    completed: "อีกหนึ่งก้าวที่ทำได้",
  };
  const time = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  return (
    <div
      ref={space}
      tabIndex={-1}
      role={immersive ? "dialog" : undefined}
      aria-modal={immersive || undefined}
      aria-label={immersive ? "พื้นที่โฟกัส" : undefined}
      className={
        immersive
          ? "fixed inset-0 z-50 overflow-y-auto bg-surface px-5 py-8"
          : ""
      }
    >
      <div className={compact ? "" : "mx-auto max-w-2xl"}>
        {!compact && (
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-secondary"
            >
              <ArrowLeft size={16} />
              My EXMELLO
            </Link>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary !px-3"
                onClick={() => setSound(!sound)}
                aria-label={sound ? "ปิดเสียงเตือน" : "เปิดเสียงเตือน"}
                aria-pressed={sound}
              >
                {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                className="btn btn-secondary !px-3"
                onClick={() => setImmersive(!immersive)}
                aria-label={immersive ? "ออกจากโหมดสงบ" : "เปิดโหมดสงบ"}
              >
                {immersive ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        )}
        <section
          className={`relative text-center ${compact ? "" : "card !px-5 !py-10 sm:!p-10"}`}
          aria-label="ตัวจับเวลาโฟกัส"
        >
          <p className="eyebrow">
            {compact ? "A little focus" : "Focus space"}
          </p>
          {!compact && (
            <h1 className="mt-3 text-3xl font-semibold text-primary">
              ให้เวลาตัวเองทีละเรื่อง
            </h1>
          )}
          <p className="mt-2 text-sm text-text-secondary">
            {compact
              ? "มีเวลาให้สิ่งสำคัญหนึ่งอย่าง"
              : "วางเรื่องอื่นไว้ก่อน ช่วงเวลานี้เป็นของคุณ"}
          </p>
          {!compact && (
            <div
              className="mx-auto mt-6 flex w-fit gap-1 rounded-full bg-surface-container p-1"
              role="group"
              aria-label="เลือกระยะเวลา"
            >
              {[15, 25, 50].map((minutes) => (
                <button
                  key={minutes}
                  disabled={pending || !hydrated}
                  onClick={() => changeDuration(minutes)}
                  aria-pressed={clock.minutes === minutes}
                  className={`min-w-[70px] rounded-full px-3 py-2 text-sm ${clock.minutes === minutes ? "bg-white font-semibold text-primary shadow-sm" : "text-text-secondary hover:bg-white/60"}`}
                >
                  {clock.minutes === minutes && (
                    <Check size={13} className="mr-1 inline" />
                  )}
                  {minutes} นาที
                </button>
              ))}
            </div>
          )}
          <div className="my-7 flex justify-center">
            <ProgressRing
              progress={100 - (seconds / (clock.minutes * 60)) * 100}
              size={compact ? 204 : 280}
              strokeWidth={2.5}
            >
              {clock.status === "completed" ? (
                <>
                  <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-primary">
                    <Check size={30} />
                  </span>
                  <span className="text-3xl font-semibold text-primary">
                    {clock.minutes} นาที
                  </span>
                </>
              ) : (
                <span
                  role="timer"
                  aria-label={`เหลือ ${Math.floor(seconds / 60)} นาที ${seconds % 60} วินาที`}
                  className={`tabular-time font-display font-medium tracking-[-0.06em] text-primary ${compact ? "text-5xl" : "text-6xl sm:text-7xl"}`}
                >
                  {hydrated ? time : "—:—"}
                </span>
              )}
              <span role="status" className="mt-3 text-xs text-secondary">
                {labels[clock.status]}
              </span>
            </ProgressRing>
          </div>
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-2xl bg-accent-amber p-4 text-sm text-[#704729]"
            >
              <p>{error}</p>
              {clock.status === "elapsed" && (
                <button
                  className="mt-2 font-semibold underline"
                  onClick={() => void retry()}
                >
                  ลองบันทึกอีกครั้ง
                </button>
              )}
            </div>
          )}
          {clock.status === "completed" ? (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Nice work. วันนี้คุณได้ให้เวลากับตัวเองแล้ว
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link className="btn btn-primary" href="/reset">
                  <Coffee size={17} />
                  พักสักหน่อย
                </Link>
                <Button variant="secondary" onClick={() => void reset()}>
                  เริ่มรอบใหม่
                </Button>
              </div>
              <Link
                className="inline-flex items-center gap-2 text-sm text-secondary underline underline-offset-4"
                href="/dashboard"
              >
                ดูความคืบหน้าของฉัน
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                size={compact ? "md" : "lg"}
                loading={pending}
                disabled={!hydrated || clock.status === "elapsed"}
                onClick={() => void start()}
                icon={
                  clock.status === "running" ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} />
                  )
                }
                iconPosition="left"
              >
                {clock.status === "running"
                  ? "พักชั่วคราว"
                  : clock.status === "paused"
                    ? "โฟกัสต่อ"
                    : clock.status === "elapsed"
                      ? "กำลังบันทึก"
                      : "เริ่มโฟกัส"}
              </Button>
              <button
                disabled={!hydrated || pending || clock.status === "ready"}
                className="btn btn-secondary !px-3"
                aria-label="ยกเลิกและรีเซ็ตเวลา"
                onClick={() => changeDuration(clock.minutes)}
              >
                <RotateCcw size={18} />
              </button>
            </div>
          )}
          {clock.status === "running" && (
            <p className="mt-5 text-xs text-text-muted">
              กลับมาหน้านี้เมื่อไหร่ เวลาของคุณยังเดินต่อ
            </p>
          )}
        </section>
        <Modal
          open={confirmMinutes !== null}
          title="เริ่มช่วงเวลาใหม่ไหม?"
          onClose={() => setConfirmMinutes(null)}
          busy={pending}
        >
          <p className="text-sm text-text-secondary">
            รอบปัจจุบันจะถูกยกเลิก คุณเริ่มใหม่ได้เสมอเมื่อพร้อม
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => setConfirmMinutes(null)}
            >
              กลับไปโฟกัส
            </Button>
            <Button
              loading={pending}
              onClick={async () => {
                if (await reset(confirmMinutes ?? clock.minutes))
                  setConfirmMinutes(null);
              }}
            >
              เริ่มใหม่
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {error}
            </p>
          )}
        </Modal>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Coffee,
  Leaf,
  Smile,
  Timer,
  Wind,
} from "lucide-react";
import { getActivitySessions, getCheckInHistory } from "@/lib/storage";
import {
  getAuthSession,
  getCheckins,
  getDashboard,
  getFocusSessions,
  onAuthChange,
  readableApiError,
} from "@/lib/api";
import { CheckInRecord, FocusSessionRecord } from "@/types";
import { MOOD_OPTIONS, CONCERN_OPTIONS } from "@/lib/mock-data";
import { LoadingCards, StatePanel } from "@/components/ui/Feedback";

type Activity = FocusSessionRecord & { status?: string };
export default function DashboardPage() {
  const [sessions, setSessions] = useState<Activity[]>([]);
  const [checkins, setCheckins] = useState<CheckInRecord[]>([]);
  const [minutes, setMinutes] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let generation = 0;
    const load = async () => {
      const current = ++generation;
      const account = getAuthSession();
      setSignedIn(Boolean(account));
      setName(account?.user.full_name || "");
      setLoading(true);
      setError("");
      setSessions([]);
      setCheckins([]);
      setMinutes(0);
      setCompleted(0);
      try {
        if (!account) {
          const local = getActivitySessions();
          const focus = local.filter(
            (item) => item.type === "focus" && item.completed,
          );
          setSessions(local);
          setCheckins(getCheckInHistory());
          setMinutes(
            focus.reduce((sum, item) => sum + item.durationMinutes, 0),
          );
          setCompleted(focus.length);
        } else {
          const [summary, history, focus] = await Promise.all([
            getDashboard(),
            getCheckins(100),
            getFocusSessions(100),
          ]);
          if (current !== generation) return;
          setMinutes(summary.completed_focus_minutes);
          setCompleted(summary.completed_focus_sessions);
          setCheckins(
            history.map((item) => ({
              id: item.id,
              mood: item.mood,
              concerns: item.concerns,
              need: item.needs[0],
              timestamp: Date.parse(item.created_at),
            })),
          );
          setSessions(
            focus.map((item) => ({
              id: item.id,
              type: "focus",
              timestamp: Date.parse(item.completed_at || item.started_at),
              durationMinutes: item.duration_minutes,
              completed: item.status === "completed",
              status: item.status,
              label: `โฟกัส ${item.duration_minutes} นาที`,
            })),
          );
        }
      } catch (cause) {
        if (current === generation) setError(readableApiError(cause));
      } finally {
        if (current === generation) setLoading(false);
      }
    };
    void load();
    const unsubscribe = onAuthChange(() => void load());
    return () => {
      generation++;
      unsubscribe();
    };
  }, [attempt]);
  const latest = checkins[0];
  const mood = MOOD_OPTIONS.find((item) => item.id === latest?.mood);
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - 6 + i);
    const end = new Date(day);
    end.setDate(end.getDate() + 1);
    return {
      day,
      record: checkins.find(
        (item) =>
          item.timestamp >= day.getTime() && item.timestamp < end.getTime(),
      ),
    };
  });
  const formatDate = (stamp: number) =>
    new Date(stamp).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
  return (
    <div className="page-shell">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">MY EXMELLO</p>
          <h1 className="page-title mt-3">
            {name ? `ยินดีที่ได้เจอกัน, ${name}` : "พื้นที่เล็ก ๆ ของคุณ"}
          </h1>
          <p className="mt-3 text-base text-text-secondary">
            ทุกครั้งที่กลับมาดูแลตัวเอง มีความหมายเสมอ
          </p>
        </div>
        <Link className="btn btn-primary" href="/checkin">
          <Smile size={18} />
          เช็กอินวันนี้
          <ArrowRight size={16} />
        </Link>
      </div>
      {loading ? (
        <LoadingCards label="กำลังโหลด My EXMELLO" />
      ) : error ? (
        <StatePanel
          error
          title="ยังโหลดพื้นที่ของคุณไม่ได้"
          description={error}
          onRetry={() => setAttempt(attempt + 1)}
        />
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <section className="card !bg-[#EDF2E8]">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">เช็กอินล่าสุด</p>
                {latest && (
                  <span className="text-xs text-secondary">
                    {formatDate(latest.timestamp)}
                  </span>
                )}
              </div>
              {latest ? (
                <>
                  <div className="my-6 flex items-center gap-4">
                    <span aria-hidden="true" className="text-5xl">
                      {mood?.emoji}
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-primary">
                        {mood?.label}
                      </h2>
                      <p className="mt-1 text-sm text-secondary">
                        นี่คือความรู้สึกในตอนที่คุณเช็กอิน
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {latest.concerns.map((value) => (
                      <span
                        key={value}
                        className="rounded-full border border-[#CEDCCC] bg-white/70 px-3 py-1.5 text-xs text-secondary"
                      >
                        {
                          CONCERN_OPTIONS.find((item) => item.id === value)
                            ?.label
                        }
                      </span>
                    ))}
                  </div>
                  <Link
                    className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
                    href={
                      signedIn
                        ? `/recommendation?checkinId=${latest.id}`
                        : "/recommendation"
                    }
                  >
                    กลับไปดูคำแนะนำ
                    <ArrowRight size={16} />
                  </Link>
                </>
              ) : (
                <div className="py-7">
                  <Leaf
                    size={34}
                    strokeWidth={1.4}
                    className="mb-4 text-sage-600"
                  />
                  <h2 className="text-2xl font-semibold text-primary">
                    การเดินทางเริ่มตรงนี้
                  </h2>
                  <p className="mb-5 mt-3 text-sm text-text-secondary">
                    ยังไม่มีเช็กอิน ลองให้เวลาฟังตัวเองสัก 15 วินาที
                  </p>
                  <Link className="btn btn-primary" href="/checkin">
                    เริ่มเช็กอิน
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </section>
            <div className="grid grid-cols-2 gap-4">
              <div className="card flex flex-col justify-between !p-5">
                <Timer size={23} className="text-sage-600" />
                <div>
                  <p className="tabular-time mt-7 text-4xl font-semibold tracking-tight text-primary">
                    {minutes}
                    <span className="ml-2 text-sm font-normal">นาที</span>
                  </p>
                  <h2 className="mt-2 text-sm font-medium text-secondary">
                    เวลาโฟกัสสะสม
                  </h2>
                </div>
              </div>
              <div className="card flex flex-col justify-between !p-5">
                <Leaf size={23} className="text-sage-600" />
                <div>
                  <p className="tabular-time mt-7 text-4xl font-semibold tracking-tight text-primary">
                    {completed}
                    <span className="ml-2 text-sm font-normal">รอบ</span>
                  </p>
                  <h2 className="mt-2 text-sm font-medium text-secondary">
                    โฟกัสสำเร็จ
                  </h2>
                </div>
              </div>
              <div className="col-span-2 rounded-3xl border border-[#E6D8C6] bg-[#F5EADD] p-5">
                <p className="text-sm text-[#76583F]">
                  “ไม่ต้องทำให้ได้ทุกวัน
                  <br />
                  แค่กลับมาเมื่อพร้อมก็พอ”
                </p>
              </div>
            </div>
          </div>
          <section className="card mt-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  7 วันที่ผ่านมา
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  มองย้อนกลับอย่างอ่อนโยน ไม่ใช่คะแนนที่ต้องทำให้ดีขึ้น
                </p>
              </div>
              <CalendarDays size={20} className="text-secondary" />
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-3">
              {days.map(({ day, record }) => {
                const option = MOOD_OPTIONS.find(
                  (item) => item.id === record?.mood,
                );
                return (
                  <div
                    key={day.toISOString()}
                    className={`rounded-2xl py-4 text-center ${record ? "bg-sage-50" : "bg-[#F7F7F3]"}`}
                  >
                    <span className="block text-xs text-text-muted">
                      {day.toLocaleDateString("th-TH", { weekday: "short" })}
                    </span>
                    <span
                      className="my-2 block text-xl"
                      aria-label={option ? option.label : "ไม่มีเช็กอิน"}
                    >
                      {option?.emoji || "·"}
                    </span>
                    <span className="text-xs text-secondary">
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-text-muted">
              แสดงเช็กอินล่าสุดของแต่ละวัน จากประวัติล่าสุดที่โหลดได้
            </p>
          </section>
          <section className="mt-9">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl font-semibold text-primary">
                สิ่งเล็ก ๆ ที่คุณทำแล้ว
              </h2>
              <span className="text-xs text-text-muted">
                {signedIn ? "ประวัติโฟกัสในบัญชี" : "ประวัติในเบราว์เซอร์นี้"}
              </span>
            </div>
            {sessions.length ? (
              <div className="overflow-hidden rounded-3xl border border-[#E3E8E1] bg-white">
                {sessions.slice(0, 8).map((item) => {
                  const Icon =
                    item.type === "focus"
                      ? Timer
                      : item.type === "breathing"
                        ? Wind
                        : Coffee;
                  const status = item.completed
                    ? "สำเร็จแล้ว"
                    : item.status === "cancelled"
                      ? "พักไว้ก่อน"
                      : "ยังไม่จบรอบ";
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border-b border-[#EDF0EA] p-5 last:border-0"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-secondary">
                        <Icon size={19} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-primary">
                          {item.label}
                        </h3>
                        <p className="mt-1 text-xs text-text-muted">
                          {formatDate(item.timestamp)} ·{" "}
                          {item.durationMinutes > 0
                            ? item.durationMinutes < 1
                              ? `${Math.round(item.durationMinutes * 60)} วินาที`
                              : `${Number(item.durationMinutes.toFixed(1))} นาที`
                            : "บันทึกกิจกรรม"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-surface-container px-3 py-1 text-xs text-secondary">
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <StatePanel
                title="ยังมีพื้นที่ให้ก้าวแรกเสมอ"
                description="เลือกโฟกัสหรือพักสั้น ๆ กิจกรรมของคุณจะค่อย ๆ เติมพื้นที่นี้"
                href="/focus"
                action="เริ่มโฟกัสสักรอบ"
              />
            )}
          </section>
        </>
      )}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/focus", text: "ให้เวลากับการโฟกัส", icon: Timer },
          { href: "/breathing", text: "กลับมาที่ลมหายใจ", icon: Wind },
          { href: "/resources", text: "อ่านอะไรเบา ๆ", icon: Leaf },
        ].map(({ href, text, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl border border-[#DCE3DB] bg-white p-5 text-sm font-medium text-primary hover:bg-sage-50"
          >
            <Icon size={19} className="text-secondary" />
            <span className="flex-1">{text}</span>
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Coffee,
  Leaf,
  RotateCcw,
  Timer,
  Wind,
} from "lucide-react";
import { getRecommendation } from "@/lib/recommendations";
import { getLastCheckIn } from "@/lib/storage";
import {
  getAuthSession,
  getCheckin,
  getCheckins,
  readableApiError,
} from "@/lib/api";
import { MOOD_OPTIONS, CONCERN_OPTIONS, NEED_OPTIONS } from "@/lib/mock-data";
import {
  CheckInRecord,
  ConcernType,
  MoodType,
  NeedType,
  RecommendationResult,
} from "@/types";
import { LoadingCards, StatePanel } from "@/components/ui/Feedback";

function Content() {
  const params = useSearchParams();
  const [recommendation, setRecommendation] =
    useState<RecommendationResult | null>(null);
  const [context, setContext] = useState<Pick<
    CheckInRecord,
    "mood" | "concerns" | "need"
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      setRecommendation(null);
      try {
        if (getAuthSession()) {
          const id = params.get("checkinId");
          const item = id ? await getCheckin(id) : (await getCheckins(1))[0];
          if (active && item) {
            setRecommendation(item.recommendation);
            setContext({
              mood: item.mood,
              concerns: item.concerns,
              need: item.needs[0],
            });
          }
        } else {
          if (params.get("checkinId")) throw new Error("login");
          const mood = params.get("mood") as MoodType;
          const concerns = params
            .getAll("concern")
            .filter((value): value is ConcernType =>
              CONCERN_OPTIONS.some((item) => item.id === value),
            )
            .slice(0, 3);
          const need = params.get("need") as NeedType;
          const last =
            MOOD_OPTIONS.some((item) => item.id === mood) && concerns.length
              ? {
                  mood,
                  concerns,
                  need: NEED_OPTIONS.some((item) => item.id === need)
                    ? need
                    : undefined,
                }
              : getLastCheckIn();
          if (active && last) {
            setRecommendation(
              getRecommendation(last.mood, last.concerns, last.need),
            );
            setContext(last);
          }
        }
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error && cause.message === "login"
              ? "เข้าสู่ระบบเพื่อเปิดคำแนะนำที่บันทึกไว้ในบัญชี"
              : readableApiError(cause),
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [params, attempt]);
  if (loading)
    return (
      <div className="page-shell max-w-4xl">
        <LoadingCards count={1} label="กำลังเตรียมก้าวถัดไปของคุณ" />
      </div>
    );
  if (error)
    return (
      <div className="page-shell max-w-3xl">
        <StatePanel
          error
          title="ขอเวลาอีกสักครู่"
          description={error}
          onRetry={() => setAttempt(attempt + 1)}
          href={
            !getAuthSession() && params.get("checkinId") ? "/login" : undefined
          }
          action="เข้าสู่ระบบ"
        />
      </div>
    );
  if (!recommendation)
    return (
      <div className="page-shell max-w-3xl">
        <StatePanel
          title="เริ่มจากความรู้สึกของคุณ"
          description="เช็กอินสั้น ๆ แล้วเราจะช่วยเลือกก้าวถัดไปที่เหมาะกับตอนนี้"
          href="/checkin"
        />
      </div>
    );
  const icons = {
    focus: Timer,
    breathing: Wind,
    reset: Coffee,
    resource: BookOpen,
  };
  const Icon = icons[recommendation.primaryAction.type];
  const actionLabel = (action: RecommendationResult["primaryAction"]) =>
    action.type === "breathing"
      ? "ฝึกหายใจ 4 รอบ"
      : action.type === "reset"
        ? "พักสั้น ๆ 1–3 นาที"
        : action.label.replace(/→/g, "").trim();
  const needLabel = NEED_OPTIONS.find(
    (item) => item.id === context?.need,
  )?.label;
  return (
    <div className="page-shell max-w-4xl">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/checkin"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-secondary"
        >
          <RotateCcw size={15} />
          เช็กอินใหม่
        </Link>
        <span className="eyebrow">YOUR NEXT SMALL STEP</span>
      </div>
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card relative overflow-hidden !p-6 sm:!p-10"
      >
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-[#EBF0E3]"
        />
        <div className="relative flex items-start justify-between gap-5">
          <div>
            <p className="eyebrow">จากเช็กอินของคุณ</p>
            <p className="mt-3 text-sm text-secondary">
              {needLabel
                ? `คุณเลือกว่าต้องการ “${needLabel}” เราเริ่มตรงนั้นกัน`
                : "จากสิ่งที่กวนใจ ลองเริ่มด้วยก้าวเล็ก ๆ นี้"}
            </p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#D8E1D0] bg-white/75 text-primary">
            <Icon size={25} strokeWidth={1.5} />
          </span>
        </div>
        <h1 className="relative mt-7 max-w-xl text-3xl font-semibold leading-snug tracking-tight text-primary sm:text-4xl">
          {recommendation.headline.replace(/[🌱⏳💛😴☕🍃🧠🚀]/gu, "").trim()}
        </h1>
        <p className="relative mt-5 max-w-2xl text-base leading-relaxed text-text-secondary">
          {recommendation.message}
        </p>
        {context && (
          <div className="mt-5 flex flex-wrap gap-2">
            {context.concerns.map((value) => (
              <span
                key={value}
                className="rounded-full border border-[#DCE3DB] px-3 py-1.5 text-xs text-secondary"
              >
                {CONCERN_OPTIONS.find((item) => item.id === value)?.label}
              </span>
            ))}
          </div>
        )}
        {recommendation.bullets?.length ? (
          <ol className="mt-7 space-y-3 border-t border-[#E3E8E1] pt-6">
            {recommendation.bullets.map((item, i) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-text-secondary"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        ) : null}
        <Link
          href={recommendation.primaryAction.path}
          className="btn btn-primary mt-8 w-full !min-h-14 !text-base sm:w-auto"
        >
          <Icon size={19} />
          {actionLabel(recommendation.primaryAction)}
          <ArrowRight size={18} />
        </Link>
        <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <Leaf size={14} />
          เปลี่ยนใจได้เสมอ เลือกสิ่งที่สบายกับคุณ
        </p>
      </motion.section>
      <div className="mt-8">
        <h2 className="mb-4 text-base font-semibold text-primary">
          อยากเริ่มอีกแบบก็ได้
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {recommendation.secondaryActions.map((item) => {
            const SmallIcon = icons[item.type];
            return (
              <Link
                key={item.path}
                href={item.path}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[#DCE3DB] bg-white p-5 hover:border-sage-500"
              >
                <span className="flex items-center gap-3 text-sm text-primary">
                  <SmallIcon size={18} className="shrink-0 text-secondary" />
                  {actionLabel(item)}
                </span>
                <ArrowUpRight size={16} className="shrink-0 text-secondary" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default function RecommendationPage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell">
          <LoadingCards count={1} />
        </div>
      }
    >
      <Content />
    </Suspense>
  );
}

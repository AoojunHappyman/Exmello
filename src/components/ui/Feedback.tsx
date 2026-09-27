"use client";
import Link from "next/link";
import { ArrowRight, Leaf, RefreshCw } from "lucide-react";

export function StatePanel({
  title,
  description,
  error = false,
  onRetry,
  href,
  action,
}: {
  title: string;
  description: string;
  error?: boolean;
  onRetry?: () => void;
  href?: string;
  action?: string;
}) {
  return (
    <div
      role={error ? "alert" : undefined}
      className="card flex flex-col items-center gap-4 py-10 text-center"
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${error ? "bg-accent-amber text-[#885127]" : "bg-sage-100 text-secondary"}`}
      >
        <Leaf aria-hidden="true" size={23} />
      </span>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={16} />
          ลองอีกครั้ง
        </button>
      )}
      {href && (
        <Link href={href} className="btn btn-primary">
          {action || "เช็กอินตอนนี้"}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function LoadingCards({
  count = 3,
  label = "กำลังเตรียมข้อมูลให้คุณ",
}: {
  count?: number;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className={`grid gap-5 ${count > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="card space-y-5">
            <div className="skeleton h-32" />
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-4" />
            <div className="skeleton h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

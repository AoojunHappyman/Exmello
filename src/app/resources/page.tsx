"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { LoadingCards, StatePanel } from "@/components/ui/Feedback";
import { useResources } from "@/lib/useResources";
export default function ResourcesPage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const { articles, loading, error, retry } = useResources();
  const filtered = articles.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      `${item.title} ${item.summary} ${item.badge}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="page-shell">
      <div className="mb-9 max-w-2xl">
        <p className="eyebrow">THE EXMELLO JOURNAL</p>
        <h1 className="page-title mt-3">
          ความเข้าใจเล็ก ๆ<br />
          ที่ช่วยให้ช่วงสอบเบาลง
        </h1>
        <p className="mt-4 text-base text-text-secondary">
          บทอ่านสั้น ๆ เรื่องการเรียน ความรู้สึก และการพักผ่อน
          เลือกสิ่งที่ตรงกับวันนี้ของคุณ
        </p>
      </div>
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div
          role="group"
          aria-label="หมวดหมู่บทความ"
          className="flex flex-wrap gap-2"
        >
          {[
            { id: "all", label: "ทั้งหมด" },
            { id: "study", label: "การเรียน" },
            { id: "stress", label: "ความเครียด" },
            { id: "sleep", label: "การนอน" },
            { id: "lifestyle", label: "วันสอบ" },
          ].map((item) => (
            <button
              key={item.id}
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
              className={`rounded-full border px-4 py-2 text-sm ${category === item.id ? "border-primary-container bg-primary-container text-white" : "border-[#DCE3DB] bg-white text-secondary hover:bg-sage-50"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search
            aria-hidden="true"
            size={17}
            className="absolute left-4 top-4 text-secondary"
          />
          <input
            aria-label="ค้นหาบทความ"
            placeholder="ค้นหาสิ่งที่อยากรู้…"
            className="field !pl-11 !pr-11"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="ล้างคำค้นหา"
              className="absolute right-1 top-1 flex h-11 w-10 items-center justify-center text-secondary"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <LoadingCards count={6} label="กำลังโหลดบทความ" />
      ) : error ? (
        <StatePanel
          error
          title="บทความยังมาไม่ถึง"
          description={error}
          onRetry={retry}
        />
      ) : filtered.length ? (
        <>
          <p role="status" className="mb-4 text-sm text-text-muted">
            {filtered.length} บทความสำหรับคุณ
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <ResourceCard key={article.id} article={article} />
            ))}
          </div>
        </>
      ) : (
        <StatePanel
          title={
            articles.length ? "ลองค้นหาอีกมุมหนึ่งไหม?" : "บทความใหม่กำลังตามมา"
          }
          description={
            articles.length
              ? `ยังไม่มีบทความตรงกับ “${query || "หมวดนี้"}” ลองคำสั้น ๆ เช่น การนอน หรือโฟกัส`
              : "ระหว่างนี้ลองให้เวลาตัวเองกับเช็กอินสั้น ๆ"
          }
          onRetry={
            articles.length
              ? () => {
                  setQuery("");
                  setCategory("all");
                }
              : retry
          }
        />
      )}
    </div>
  );
}

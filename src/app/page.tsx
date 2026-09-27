"use client";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Coffee,
  Leaf,
  Smile,
  Sparkles,
} from "lucide-react";
import { QuickCheckin } from "@/components/tools/QuickCheckin";
import { FocusTimer } from "@/components/tools/FocusTimer";
import { BreathingPreview } from "@/components/tools/BreathingPreview";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { LoadingCards, StatePanel } from "@/components/ui/Feedback";
import { useResources } from "@/lib/useResources";
import { useState } from "react";

export default function HomePage() {
  const { articles, loading, error, retry } = useResources();
  const [category, setCategory] = useState("all");
  const filtered = articles
    .filter((item) => category === "all" || item.category === category)
    .slice(0, 3);
  return (
    <div>
      <section className="relative overflow-hidden border-b border-[#E3E8E1]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-44 top-0 h-[680px] w-[680px] rounded-full bg-[#E7ECDD]/75"
        />
        <div className="relative mx-auto grid max-w-[1160px] items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
          <div>
            <p className="eyebrow mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sage-500" />
              YOUR EXAM SEASON COMPANION
            </p>
            <h1 className="text-[2.8rem] font-semibold leading-[1.24] tracking-[-0.055em] text-primary sm:text-[3.8rem] lg:text-[4.1rem]">
              ช่วงสอบหนักได้
              <br />
              <span className="text-sage-600">แต่ใจคุณเบาลงได้</span>
            </h1>
            <p className="mt-5 font-display text-lg tracking-tight text-secondary">
              Take a breath. You’ve got this.
            </p>
            <p className="mt-6 max-w-md text-base leading-relaxed text-text-secondary">
              EXMELLO ช่วยคุณเช็กความรู้สึก เลือกวิธีพักใจ
              <br className="hidden sm:block" /> แล้วกลับมาโฟกัสกับสิ่งตรงหน้า
              ทีละก้าว
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/checkin"
                className="btn btn-primary !min-h-14 !px-7 !text-base"
              >
                เช็กอินตอนนี้
                <ArrowUpRight size={19} />
              </Link>
              <a href="#core-features" className="btn btn-secondary !min-h-14">
                ดูฟีเจอร์
                <ArrowDown size={16} />
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} />
                เริ่มได้โดยไม่ต้องสมัคร
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} />
                ใช้เวลาเช็กอินเพียง 15 วินาที
              </span>
            </div>
            <div
              aria-hidden="true"
              className="mt-10 hidden items-center gap-4 lg:flex"
            >
              <span className="h-px w-10 bg-sage-300" />
              <span className="font-display text-sm italic text-secondary">
                A little space. A fresh start.
              </span>
            </div>
          </div>
          <div className="relative">
            <QuickCheckin />
            <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-[#DDE6D9] bg-[#F6F8F0] px-4 py-2 text-xs text-secondary">
              <Leaf size={14} />
              ค่อย ๆ ทำ ในจังหวะของคุณ
            </div>
          </div>
        </div>
      </section>

      <section id="core-features" className="page-shell !py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">LESS PRESSURE. MORE SPACE.</p>
            <h2 className="mt-3 text-2xl font-semibold text-primary">
              ไม่ต้องพร้อมทุกเรื่อง
              <br />
              เริ่มจากเรื่องตรงหน้าก็พอ
            </h2>
          </div>
          <div id="how-it-works" className="grid gap-6 sm:grid-cols-3">
            {[
              {
                number: "01",
                title: "ฟังความรู้สึก",
                detail: "เลือกอารมณ์และสิ่งที่กวนใจ โดยไม่ต้องพิมพ์ยาว",
                icon: Smile,
              },
              {
                number: "02",
                title: "เจอก้าวที่เหมาะ",
                detail: "รับคำแนะนำจากสิ่งที่คุณต้องการในตอนนี้",
                icon: Sparkles,
              },
              {
                number: "03",
                title: "ค่อย ๆ ไปต่อ",
                detail: "โฟกัส หายใจ หรือพักสั้น ๆ ในจังหวะที่สบาย",
                icon: Leaf,
              },
            ].map(({ number, title, detail, icon: Icon }) => (
              <div key={number} className="border-l border-[#D8E1D6] pl-5">
                <div className="flex items-center gap-3 text-secondary">
                  <Icon size={19} strokeWidth={1.5} />
                  <span className="text-xs">{number}</span>
                </div>
                <h3 className="mb-2 mt-4 text-base font-semibold text-primary">
                  {title}
                </h3>
                <p className="text-sm text-text-secondary">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="interactive-suite" className="page-shell !pt-7">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">SMALL TOOLS, A LITTLE RELIEF</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
              เลือกพื้นที่ที่ต้องการตอนนี้
            </h2>
          </div>
          <span className="text-sm text-text-secondary">
            เริ่มเมื่อพร้อม พักเมื่ออยากพัก
          </span>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <FocusTimer compact />
          </div>
          <div className="card !bg-[#F0F4EC]">
            <BreathingPreview />
          </div>
          <div className="card relative flex flex-col justify-between overflow-hidden !bg-[#F5EADD] md:col-span-2 lg:col-span-1">
            <div>
              <p className="eyebrow !text-[#815C3E]">A moment to reset</p>
              <h3 className="mt-3 text-2xl font-semibold text-primary">
                วางเรื่องหนัก ๆ<br />
                ไว้สักครู่
              </h3>
              <p className="mt-3 max-w-xs text-sm text-text-secondary">
                พักสายตา จิบน้ำ ยืดเส้น หรือเขียนสิ่งที่อยู่ในหัวแล้วปล่อยไป
              </p>
            </div>
            <div aria-hidden="true" className="my-7 flex justify-center">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border border-[#D9C9B5] bg-white/35">
                <Coffee size={62} strokeWidth={1} className="text-[#9B7855]" />
              </div>
            </div>
            <div>
              <Link
                href="/reset"
                className="btn w-full bg-[#76583F] text-white hover:bg-[#604530]"
              >
                พักสั้น ๆ 1–3 นาที
                <ArrowRight size={17} />
              </Link>
              <p className="mt-4 text-center text-xs text-[#72583F]">
                การพักก็เป็นส่วนหนึ่งของการไปต่อ
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell" id="resources-section">
        <div className="section-rule">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">A LITTLE UNDERSTANDING</p>
              <h2 className="mt-3 text-3xl font-semibold text-primary">
                อ่านสั้น ๆ เพื่อเข้าใจตัวเอง
              </h2>
            </div>
            <Link
              href="/resources"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary"
            >
              บทความทั้งหมด
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div
            className="mb-6 flex flex-wrap gap-2"
            role="group"
            aria-label="หมวดหมู่บทความ"
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
          {loading ? (
            <LoadingCards />
          ) : error ? (
            <StatePanel
              error
              title="บทความยังมาไม่ถึง"
              description={error}
              onRetry={retry}
            />
          ) : filtered.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {filtered.map((article) => (
                <ResourceCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <StatePanel
              title="บทความใหม่กำลังตามมา"
              description="ลองเลือกหมวดอื่น ระหว่างนี้กลับมาดูแลตัวเองสักนิดก็ได้นะ"
              href="/checkin"
            />
          )}
        </div>
      </section>
    </div>
  );
}

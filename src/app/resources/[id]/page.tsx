import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { ApiError, getResource, getResources } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface ResourceDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  let article;
  try {
    article = await getResource(params.id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const relatedArticles = (await getResources()).filter((r) => r.id !== article.id).slice(0, 2);

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <Link
            href="/resources"
            className="inline-flex items-center gap-1.5 font-semibold hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปหน้ารวมบทความ</span>
          </Link>

          <span className="bg-secondary-container px-3 py-1 rounded-full text-primary font-semibold">
            {article.badge}
          </span>
        </div>

        {/* Header Content */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>อ่านประมาณ {article.readingTimeMinutes} นาที</span>
            <span>•</span>
            <span>บทความอิงหลักวิทยาศาสตร์</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary font-display leading-[1.25]">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            {article.summary}
          </p>
        </header>

        {/* Cover Image */}
        <div className="relative w-full h-[260px] sm:h-[380px] rounded-3xl overflow-hidden bg-surface-container border border-stone-200/60 shadow-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Key Takeaways Box */}
        <div className="bg-[#EAF6F0] rounded-3xl p-6 sm:p-8 border border-[#C3E8D1] space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <h3 className="text-base font-bold text-primary font-display">ใจความสำคัญที่นำไปใช้ได้ทันที</h3>
          </div>
          <ul className="space-y-2">
            {article.keyTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Article Body */}
        <article className="prose prose-stone max-w-none text-text-secondary leading-relaxed space-y-6 text-sm sm:text-base border-b border-stone-200 pb-10">
          {article.contentMarkdown.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3
                  key={idx}
                  className="text-xl sm:text-2xl font-bold text-primary font-display pt-4"
                >
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
              const lines = paragraph.split('\n');
              return (
                <ul key={idx} className="list-disc list-inside space-y-2 pl-2">
                  {lines.map((l, lIdx) => (
                    <li key={lIdx} className="leading-relaxed">
                      {l.replace(/^[0-9]\.\s*|-\s*/, '')}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </article>

        {/* Suggested Next Action */}
        {article.suggestedAction && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-lowest shadow-card border border-stone-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#E08A3C] uppercase tracking-wider block mb-1">
                ก้าวถัดไปที่แนะนำ
              </span>
              <h4 className="text-lg font-bold text-primary font-display">
                ลองนำข้อคิดนี้ไปปฏิบัติจริงตอนนี้
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">
                ลงมือทำสิ่งเล็ก ๆ ในขณะที่ความเข้าใจยังสดใหม่อยู่ในหัว
              </p>
            </div>
            <Link
              href={article.suggestedAction.path}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-container text-white text-xs sm:text-sm font-semibold hover:bg-primary shadow-sm active:translate-y-0.5 transition-all whitespace-nowrap"
            >
              <span>{article.suggestedAction.label}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* More Articles */}
        <div className="pt-4 space-y-4">
          <h3 className="text-lg font-bold text-primary font-display">
            อ่านบทความอื่นต่อ
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.id}
                href={`/resources/${rel.id}`}
                className="p-4 rounded-2xl bg-surface-lowest border border-stone-200/60 hover:border-secondary transition-all flex items-center justify-between gap-3 shadow-sm group"
              >
                <div>
                  <span className="text-[11px] font-semibold text-secondary uppercase">
                    {rel.badge} • {rel.readingTimeMinutes} นาที
                  </span>
                  <h5 className="text-xs sm:text-sm font-bold text-primary mt-1 group-hover:text-primary-light transition-colors line-clamp-1">
                    {rel.title}
                  </h5>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

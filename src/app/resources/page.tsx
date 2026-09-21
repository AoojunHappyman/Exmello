'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen } from 'lucide-react';
import { MOCK_RESOURCES } from '@/lib/mock-data';
import { ResourceCard } from '@/components/cards/ResourceCard';

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'study', label: 'เทคนิคการอ่าน' },
    { id: 'stress', label: 'คลายเครียด' },
    { id: 'sleep', label: 'การนอน & ความจำ' },
    { id: 'lifestyle', label: 'วันสอบจริง' },
  ];

  const filteredArticles = MOCK_RESOURCES.filter((article) => {
    const matchesCategory =
      activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-primary text-xs font-semibold mb-2">
            <span>📚</span>
            <span>แหล่งข้อมูลช่วยเหลือ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary font-display">
            บทความและแนวทางดูแลใจช่วงสอบ
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl mt-1">
            เคล็ดลับการอ่านหนังสือ การพักผ่อน และการดูแลตัวเองช่วงสอบ จากมุมมองจิตวิทยาการศึกษา
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาบทความหรือหัวข้อ..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-lowest border border-stone-200/80 text-xs text-text-primary placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200/60 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-primary-container text-white shadow-sm'
                : 'bg-surface-lowest hover:bg-surface-container text-text-secondary border border-stone-200/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ResourceCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-lowest rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 border border-stone-200/60">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-primary font-display">
            ไม่พบบทความที่ตรงกับ &quot;{searchQuery}&quot;
          </h3>
          <p className="text-xs text-text-secondary">
            ลองค้นหาด้วยคำอื่น เช่น &quot;นอน&quot;, &quot;กังวล&quot;, หรือ &quot;โฟกัส&quot;
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="text-xs text-secondary font-semibold hover:underline pt-2"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}

      {/* Bottom Supportive Callout */}
      <div className="bg-secondary-container/30 rounded-3xl p-6 sm:p-8 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-primary font-display">
              อ่านจบแล้วใช่ไหม? มาลองลงมือทำกันเถอะ
            </h4>
            <p className="text-xs text-text-secondary">
              วิธีที่ดีที่สุดในการช่วยให้สมองซึมซับข้อมูลคือการพักหายใจสั้น ๆ 3 นาที
            </p>
          </div>
        </div>
        <Link
          href="/breathing"
          className="px-6 py-2.5 rounded-full bg-primary-container text-white text-xs font-semibold hover:bg-primary transition-all whitespace-nowrap shadow-sm"
        >
          ลองฝึกหายใจ 3 นาที →
        </Link>
      </div>
    </div>
  );
}

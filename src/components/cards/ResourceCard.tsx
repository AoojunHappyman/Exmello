import React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { ResourceArticle } from "@/types";

interface ResourceCardProps {
  article: ResourceArticle;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ article }) => {
  return (
    <article className="group flex flex-col rounded-3xl bg-surface-lowest overflow-hidden border border-stone-200/60 shadow-sm hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.coverImage}
          alt=""
          width={640}
          height={384}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-surface-lowest/95 backdrop-blur-md text-xs font-semibold text-primary shadow-sm">
          {article.badge}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>อ่านประมาณ {article.readingTimeMinutes} นาที</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-primary font-display mb-2 leading-snug group-hover:text-primary-light transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-4">
            {article.summary}
          </p>
        </div>

        {/* Read action */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-primary font-semibold text-sm">
          <Link
            href={`/resources/${article.id}`}
            aria-label={`อ่านบทความ: ${article.title}`}
            className="inline-flex min-h-11 items-center gap-1.5 group-hover:gap-2 transition-all"
          >
            <span>อ่านบทความ</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </div>
    </article>
  );
};

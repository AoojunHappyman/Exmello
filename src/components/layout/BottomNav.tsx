'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Timer, Wind, BookOpen, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'หน้าแรก', href: '/', icon: Home },
    { label: 'โฟกัส', href: '/focus', icon: Timer },
    { label: 'หายใจ', href: '/breathing', icon: Wind },
    { label: 'แหล่งข้อมูล', href: '/resources', icon: BookOpen },
    { label: 'โปรไฟล์', href: '/profile', icon: User },
  ];

  return (
    <nav
      aria-label="การนำทางบนมือถือ"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-lowest/95 backdrop-blur-lg border-t border-stone-200/80 px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <div
                className={`w-10 h-7 flex items-center justify-center rounded-full transition-all ${
                  isActive ? 'bg-secondary-container text-primary' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight font-sans">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'หน้าแรก', href: '/' },
    { label: 'ฟีเจอร์', href: '/#core-features' },
    { label: 'วิธีใช้งาน', href: '/#how-it-works' },
    { label: 'เครื่องมือ', href: '/#interactive-suite' },
    { label: 'Resources', href: '/resources' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#F8F7F2]/90 backdrop-blur-xl shadow-nav border-b border-stone-200/50'
          : 'bg-[#F8F7F2]/80 backdrop-blur-md'
      }`}
    >
      <div className="h-20 max-w-[1240px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:ring-offset-2 rounded-lg"
          aria-label="EXMELLO หน้าแรก"
        >
          <div className="w-9 h-9 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <span className="text-xl">🌱</span>
          </div>
          <span className="text-xl font-bold text-primary tracking-tight font-display">
            EXMELLO
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface-lowest/70 p-1.5 rounded-full border border-stone-200/50 shadow-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-container/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Profile / Account button */}
          <Link
            href="/profile"
            aria-label="โปรไฟล์ผู้ใช้"
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-container transition-colors shadow-sm ml-1"
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Mobile hamburger trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="เปิดเมนูบนมือถือ"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            className="lg:hidden w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-text-primary ml-1"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-menu" className="lg:hidden bg-surface-lowest border-b border-stone-200 px-6 py-5 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-secondary-container text-primary font-semibold'
                    : 'text-text-secondary hover:bg-surface-container'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <Link
                href="/checkin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-full bg-primary-container text-white text-center text-sm font-semibold hover:bg-primary"
              >
                เช็กอินความรู้สึกตอนนี้ 🌱
              </Link>
              <div className="flex items-center justify-between px-2 pt-2 text-xs text-text-muted">
                <span>เพื่อนดูแลใจช่วงสอบ</span>
                <Link href="/help" className="text-secondary hover:underline">
                  ต้องการความช่วยเหลือ?
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

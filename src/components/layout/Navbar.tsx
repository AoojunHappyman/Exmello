"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Leaf, Menu, User, X } from "lucide-react";
import { getAuthSession, onAuthChange } from "@/lib/api";

export const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const sync = () => setSignedIn(Boolean(getAuthSession()));
    sync();
    return onAuthChange(sync);
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  const links = [
    { label: "หน้าแรก", href: "/" },
    { label: "เครื่องมือ", href: "/#core-features" },
    { label: "บทความ", href: "/resources" },
    { label: "My EXMELLO", href: "/dashboard" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-[#E3E8E1]/80 bg-[#F8F7F4]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-3 px-5 sm:px-8">
        <Link
          href="/"
          aria-label="EXMELLO หน้าแรก"
          className="flex items-center gap-2.5 rounded-lg"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-white">
            <Leaf size={21} strokeWidth={1.5} />
          </span>
          <span className="font-display text-xl font-bold tracking-[-0.04em] text-primary">
            exmello<span className="text-sage-500">.</span>
          </span>
        </Link>
        <nav
          aria-label="การนำทางหลัก"
          className="hidden items-center gap-7 lg:flex"
        >
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`rounded-md py-2 text-sm ${pathname === item.href ? "font-semibold text-primary underline decoration-sage-300 decoration-2 underline-offset-8" : "text-text-secondary hover:text-primary"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/checkin"
            className="btn btn-primary hidden sm:inline-flex"
          >
            เช็กอินตอนนี้
            <ArrowUpRight size={16} />
          </Link>
          <Link
            href="/profile"
            aria-label={signedIn ? "บัญชีของฉัน" : "โปรไฟล์และเข้าสู่ระบบ"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DCE3DB] hover:bg-sage-100"
          >
            <User size={19} />
          </Link>
          <button
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sage-100 lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="เมนูเพิ่มเติม"
          className="grid gap-1 border-t border-[#E3E8E1] bg-white p-5 lg:hidden"
        >
          {[
            ...links,
            { label: "ฝึกหายใจ", href: "/breathing" },
            { label: "รีเซ็ตสั้น ๆ", href: "/reset" },
            { label: "ความช่วยเหลือ", href: "/help" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm hover:bg-sage-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

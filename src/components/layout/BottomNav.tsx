"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Smile, Timer, Sprout } from "lucide-react";
export const BottomNav = () => {
  const pathname = usePathname();
  return (
    <nav
      aria-label="การนำทางบนมือถือ"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E3E8E1] bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid h-[72px] max-w-lg grid-cols-4 gap-1">
        {[
          { label: "หน้าแรก", href: "/", icon: Home },
          { label: "เช็กอิน", href: "/checkin", icon: Smile },
          { label: "โฟกัส", href: "/focus", icon: Timer },
          { label: "ของฉัน", href: "/dashboard", icon: Sprout },
        ].map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/checkin" && pathname === "/recommendation");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`my-2 flex flex-col items-center justify-center gap-1 rounded-2xl text-xs transition-colors ${active ? "bg-sage-100 font-semibold text-primary" : "text-text-muted hover:bg-sage-50"}`}
            >
              <Icon size={21} strokeWidth={active ? 2 : 1.6} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

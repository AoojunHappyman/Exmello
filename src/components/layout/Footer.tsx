import Link from "next/link";
import { ArrowUpRight, Leaf } from "lucide-react";
export const Footer = () => (
  <footer className="mt-12 border-t border-[#DCE3DB] bg-[#F0F2EC]">
    <div className="mx-auto max-w-[1160px] px-5 py-10 sm:px-8">
      <div className="flex flex-col justify-between gap-8 md:flex-row">
        <div className="max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-xl font-semibold text-primary"
          >
            <Leaf size={20} />
            exmello.
          </Link>
          <p className="mt-3 text-sm text-text-secondary">
            พื้นที่เล็ก ๆ ให้คุณตั้งหลัก แล้วค่อยไปต่อ
            <br />
            เพื่อนดูแลใจของนักศึกษาในช่วงสอบ
          </p>
        </div>
        <nav
          aria-label="ลิงก์ท้ายหน้า"
          className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm"
        >
          {[
            { label: "เช็กอินความรู้สึก", href: "/checkin" },
            { label: "My EXMELLO", href: "/dashboard" },
            { label: "ฝึกหายใจ", href: "/breathing" },
            { label: "บทความ", href: "/resources" },
            { label: "รีเซ็ตสั้น ๆ", href: "/reset" },
            { label: "บัญชีและข้อมูล", href: "/profile" },
            { label: "เข้าสู่ระบบ", href: "/login" },
            { label: "ความช่วยเหลือ", href: "/help" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-1 text-secondary hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-8 flex flex-col justify-between gap-3 border-t border-[#DCE3DB] pt-6 text-xs text-text-secondary sm:flex-row">
        <p>EXMELLO เป็นเครื่องมือดูแลใจทั่วไป ไม่ใช่บริการทางการแพทย์</p>
        <Link
          href="/help"
          className="inline-flex items-center gap-1 font-semibold text-primary"
        >
          ต้องการคนรับฟัง
          <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="mt-5 flex flex-wrap justify-between gap-3 text-xs text-text-muted">
        <span>© {new Date().getFullYear()} EXMELLO</span>
        <a
          href="https://aoojunhappyman.github.io/My-Profile/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Designed & built by Pattanachai Sawetbunchoed
        </a>
      </div>
    </div>
  </footer>
);

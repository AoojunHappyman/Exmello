import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/ui/MotionProvider";

export const metadata: Metadata = {
  title: "EXMELLO — เพื่อนช่วยดูแลใจในช่วงสอบ",
  description:
    "EXMELLO เพื่อนช่วยดูแลใจในช่วงสอบ ช่วยให้คุณเช็กความรู้สึก รับคำแนะนำที่เหมาะกับสถานการณ์ และกลับมาโฟกัสกับสิ่งที่ต้องทำทีละขั้น",
  keywords: [
    "exam season",
    "student wellness",
    "pomodoro focus timer",
    "breathing exercise",
    "study anxiety",
    "mental reset",
    "ช่วงสอบ",
    "คลายเครียดสอบ",
    "อ่านหนังสือ",
  ],
  authors: [{ name: "ทีมงาน EXMELLO" }],
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-text-primary antialiased min-h-screen flex flex-col font-body">
        <a
          href="#main-content"
          className="fixed -top-20 left-4 z-[100] rounded-xl bg-primary px-5 py-3 text-white focus:top-3"
        >
          ข้ามไปเนื้อหา
        </a>
        <MotionProvider>
          <Navbar />
          <main id="main-content" tabIndex={-1} className="w-full flex-grow">
            {children}
          </main>
          <div className="safe-bottom lg:!pb-0">
            <Footer />
          </div>
          <BottomNav />
        </MotionProvider>
      </body>
    </html>
  );
}

"use client";
import { StatePanel } from "@/components/ui/Feedback";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="page-shell max-w-3xl">
      <StatePanel
        error
        title="หน้านี้ยังโหลดไม่สำเร็จ"
        description="ข้อมูลของคุณไม่ได้ถูกลบ ลองโหลดอีกครั้ง หรือกลับไปเช็กอินก่อนได้เลย"
        onRetry={reset}
        href="/checkin"
      />
    </div>
  );
}

import { StatePanel } from "@/components/ui/Feedback";
export default function NotFound() {
  return (
    <div className="page-shell max-w-3xl">
      <StatePanel
        title="เหมือนเราจะหลงทางนิดหน่อย"
        description="หน้านี้อาจย้ายไปแล้ว กลับไปเริ่มต้นจากพื้นที่ที่คุ้นเคยกันนะ"
        href="/"
        action="กลับหน้าแรก"
      />
    </div>
  );
}

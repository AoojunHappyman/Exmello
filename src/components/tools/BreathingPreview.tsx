"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { BreathingCircle } from "@/components/tools/BreathingCircle";
export function BreathingPreview() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setStep((value) => (value + 1) % 4), 4000);
    return () => clearInterval(timer);
  }, [running]);
  const phases = ["inhale", "hold", "exhale", "rest"] as const;
  return (
    <div className="flex h-full flex-col items-center text-center">
      <p className="eyebrow">A softer breath</p>
      <h3 className="mt-2 text-xl font-semibold text-primary">
        กลับมาอยู่กับลมหายใจ
      </h3>
      <div className="flex flex-1 items-center py-4">
        <BreathingCircle
          phase={running ? phases[step] : "idle"}
          phaseText={
            running
              ? ["หายใจเข้า", "พักลมหายใจ", "หายใจออก", "พักลมหายใจ"][step]
              : "พักสักครู่ก็ได้นะ"
          }
          subText={
            running ? "ค่อย ๆ ไปตามจังหวะที่สบาย" : "ให้ตัวเองได้ช้าลงสักนิด"
          }
        />
      </div>
      <button
        className="btn btn-secondary w-full"
        onClick={() => setRunning(!running)}
      >
        {running ? <Pause size={17} /> : <Play size={17} />}
        {running ? "พักก่อน" : "ลองหายใจด้วยกัน"}
      </button>
      <Link
        className="mt-4 inline-flex items-center gap-2 text-sm text-secondary"
        href="/breathing"
      >
        ฝึกเต็มรูปแบบ
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

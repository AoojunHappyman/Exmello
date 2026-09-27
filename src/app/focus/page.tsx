"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FocusTimer } from "@/components/tools/FocusTimer";
import { LoadingCards } from "@/components/ui/Feedback";
function Content() {
  const params = useSearchParams();
  return (
    <div className="tool-shell">
      <FocusTimer
        initialMinutes={
          params.has("duration") ? Number(params.get("duration")) : undefined
        }
      />
    </div>
  );
}
export default function FocusPage() {
  return (
    <Suspense
      fallback={
        <div className="tool-shell">
          <LoadingCards count={1} />
        </div>
      }
    >
      <Content />
    </Suspense>
  );
}

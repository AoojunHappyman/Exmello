"use client";
import { useEffect, useId, useRef, ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  title,
  onClose,
  children,
  busy = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  busy?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    const previous = document.activeElement as HTMLElement | null;
    element.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-3xl border border-[#E3E8E1] bg-white p-6 text-text-primary shadow-hover backdrop:bg-[#152B24]/45 backdrop:backdrop-blur-sm sm:p-8"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 id={titleId} className="text-xl font-semibold text-primary">
          {title}
        </h2>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-sage-100"
        >
          <X size={19} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

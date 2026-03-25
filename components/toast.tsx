"use client";

import { useEffect } from "react";
import { ToastState } from "@/lib/types";
import { cn } from "@/lib/utils";

type ToastProps = {
  toast: ToastState | null;
  onClose: () => void;
};

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(onClose, 1800);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        className={cn(
          "rounded-full px-4 py-2 text-sm text-white shadow-soft animate-rise",
          toast.tone === "error" ? "bg-danger" : toast.tone === "success" ? "bg-accentStrong" : "bg-ink"
        )}
      >
        {toast.message}
      </div>
    </div>
  );
}

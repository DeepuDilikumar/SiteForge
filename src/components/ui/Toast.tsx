"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type ToastAction = { label: string; onClick: () => void };
type ToastMessage = { id: number; message: string; action?: ToastAction };

const ToastContext = createContext<(message: string, action?: ToastAction) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, action?: ToastAction) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, action });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-4 z-50 sm:left-6">
        {toast ? (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex min-h-12 max-w-[min(560px,calc(100vw-32px))] animate-slide-up items-center gap-4 rounded-sm bg-snackbar py-2 pr-2 pl-4 text-sm text-on-snackbar shadow-2"
          >
            <span className="py-1">{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  setToast(null);
                }}
                className="ml-auto h-9 rounded-full px-3 font-medium text-[#8ab4f8] hover:bg-white/10 focus-visible:outline-[#8ab4f8]"
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

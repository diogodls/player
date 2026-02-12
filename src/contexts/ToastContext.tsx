import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import styles from "./ToastContext.module.scss";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  durationMs: number;
};

type ToastContextValue = {
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  clearAll: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string, durationMs = 4000) => {
      const id = uid();
      const toast: Toast = { id, type, message, durationMs };
      setToasts((prev) => [...prev, toast]);
      const timerId = window.setTimeout(() => remove(id), durationMs);
      timersRef.current.set(id, timerId);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (m, d) => push("success", m, d),
      error: (m, d) => push("error", m, d),
      info: (m, d) => push("info", m, d),
      clearAll: () => {
        timersRef.current.forEach((timer) => window.clearTimeout(timer));
        timersRef.current.clear();
        setToasts([]);
      },
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className={styles.local}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => remove(t.id)}
            className={`${styles.toast} ${styles[t.type]}`}
          >
            <strong className={styles.title}>{t.type}</strong>
            <div className={styles.message}>{t.message}</div>
            <div className={styles.hint}>Clique para fechar</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider />");
  return ctx;
}
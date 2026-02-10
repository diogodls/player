import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

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

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string, durationMs = 2500) => {
      const id = uid();
      const toast: Toast = { id, type, message, durationMs };
      setToasts((prev) => [...prev, toast]);

      window.setTimeout(() => remove(id), durationMs);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (m, d) => push("success", m, d),
      error: (m, d) => push("error", m, d),
      info: (m, d) => push("info", m, d),
      clearAll: () => setToasts([]),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Container dos toasts */}
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 9999,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => remove(t.id)}
            style={{
              minWidth: 260,
              maxWidth: 360,
              padding: "12px 14px",
              borderRadius: 12,
              cursor: "pointer",
              color: "white",
              boxShadow: "0 10px 25px rgba(0,0,0,.25)",
              background:
                t.type === "success"
                  ? "#16a34a"
                  : t.type === "error"
                    ? "#dc2626"
                    : "#2563eb",
            }}
          >
            <strong style={{ textTransform: "capitalize" }}>{t.type}</strong>
            <div style={{ marginTop: 4 }}>{t.message}</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
              Clique para fechar
            </div>
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

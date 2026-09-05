"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X } from "lucide-react";

type ToastType = "INFO" | "SUCCESS" | "ERROR" | "WARNING";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "INFO") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map((toast) => {
          const colors = {
            INFO: "bg-surface border-border text-text",
            SUCCESS: "bg-success/10 border-success/30 text-success",
            ERROR: "bg-danger/10 border-danger/30 text-danger",
            WARNING: "bg-warning/10 border-warning/30 text-warning",
          };
          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between gap-4 p-4 rounded border shadow-lg pointer-events-auto min-w-[300px] max-w-sm ${colors[toast.type]}`}
            >
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-black/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

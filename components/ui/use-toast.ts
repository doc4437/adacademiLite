"use client";

// Simplified toast implementation inspired by shadcn/ui

import * as React from "react";

type Toast = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

export type ToastContextValue = {
  toasts: Toast[];
  toast: (toast: Toast) => void;
  dismiss: (toastId: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((toast: Toast) => {
    setToasts((current) => {
      const id = toast.id ?? Math.random().toString(36).slice(2, 11);
      return [...current, { ...toast, id }];
    });
  }, []);

  const dismiss = React.useCallback((toastId: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  return <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export type { Toast };

"use client";

import * as React from "react";
import { ToastProvider, useToast } from "./use-toast";
import { ToastView } from "./toast";

const ToastViewportInner = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <ToastView key={toast.id} {...toast} onDismiss={() => toast.id && dismiss(toast.id)} />
      ))}
    </div>
  );
};

export const ToastViewport = () => <ToastViewportInner />;

export const ToastRootProvider = ({ children }: { children: React.ReactNode }) => {
  return <ToastProvider>{children}</ToastProvider>;
};

"use client";

import type { ReactNode } from "react";
import { ToastRootProvider, ToastViewport } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastRootProvider>
      {children}
      <ToastViewport />
    </ToastRootProvider>
  );
}

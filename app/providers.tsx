"use client";

import type { ReactNode } from "react";
import { ToastRootProvider, ToastViewport } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastRootProvider>
        {children}
        <ToastViewport />
      </ToastRootProvider>
    </SessionProvider>
  );
}

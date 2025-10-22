import "../styles/globals.css";
import type { ReactNode } from "react";
import { AppProviders } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-muted/30 font-sans">
        <AppProviders>
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-6">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}

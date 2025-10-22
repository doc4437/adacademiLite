import "../styles/globals.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { AppProviders } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-muted/30`}>
        <AppProviders>
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-6">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}

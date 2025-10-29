import "../styles/globals.css";
import type { ReactNode } from "react";
import { AppProviders } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <AppProviders>
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-10">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}

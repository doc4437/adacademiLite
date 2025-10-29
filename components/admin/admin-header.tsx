"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DASHBOARD_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/assignments", label: "Assignments" },
] as const;

export function AdminHeader() {
  const { data } = useSession();
  const pathname = usePathname();
  const email = data?.user?.email ?? "";

  return (
    <header className="rounded-2xl border border-border bg-card/80 p-4 shadow-zen backdrop-blur">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="grow">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Adacademi-Lite</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">
              {email ? `Signed in as ${email}` : "Signed in"}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {DASHBOARD_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-breath ease-breath",
                  "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive && "bg-primary/20 text-primary shadow-zen-sm"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

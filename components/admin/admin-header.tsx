"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const { data } = useSession();
  const email = data?.user?.email ?? "";

  return (
    <div className="mb-6 flex items-center justify-between rounded-md border bg-muted/30 p-3">
      <div className="text-sm text-muted-foreground">
        Signed in{email ? ` as ${email}` : ""}
      </div>
      <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </Button>
    </div>
  );
}


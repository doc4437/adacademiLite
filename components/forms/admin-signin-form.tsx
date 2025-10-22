"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { authenticateAdmin } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { error: undefined as string | undefined, success: false };

export function AdminSignInForm() {
  const [state, formAction] = useFormState(authenticateAdmin, initialState);

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-card p-6 shadow">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-semibold">Admin Access</h1>
        <p className="text-sm text-muted-foreground">Enter the passphrase to manage Adacademi-Lite.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="passphrase">Passphrase</Label>
        <Input id="passphrase" name="passphrase" type="password" placeholder="Passphrase" required />
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      </div>
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
}

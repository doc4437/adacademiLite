"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function StudentAccessForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = accessCode.trim();

    if (trimmed.length === 0) {
      toast({ title: "Enter an access code", variant: "destructive" });
      return;
    }

    startTransition(() => {
      router.push(`/s/${encodeURIComponent(trimmed)}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="grid gap-2 text-left">
        <Label htmlFor="access-code">Student Access Code</Label>
        <Input
          id="access-code"
          name="accessCode"
          placeholder="Enter your code"
          value={accessCode}
          onChange={(event) => setAccessCode(event.target.value)}
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Opening..." : "Go to my assignments"}
      </Button>
    </form>
  );
}

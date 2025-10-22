"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createStudent } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";

export function StudentForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [accessCode, setAccessCode] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createStudent(formData);
      if (result.success) {
        event.currentTarget.reset();
        setAccessCode("");
        toast({ title: "Student added" });
      } else {
        toast({ title: "Could not add student", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="displayName">Name</Label>
        <Input id="displayName" name="displayName" placeholder="Student name" required disabled={isPending} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="accessCode">Access Code</Label>
        <Input
          id="accessCode"
          name="accessCode"
          placeholder="e.g. OLI-1234"
          value={accessCode}
          onChange={(event) => setAccessCode(event.target.value)}
          required
          disabled={isPending}
        />
      </div>
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Add Student"}
        </Button>
      </div>
    </form>
  );
}

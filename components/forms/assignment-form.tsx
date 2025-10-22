"use client";

import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createAssignment } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";

export function AssignmentForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createAssignment(formData);
      if (result.success) {
        event.currentTarget.reset();
        toast({ title: "Assignment created" });
      } else {
        toast({ title: "Could not create assignment", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Assignment title" required disabled={isPending} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sourceUrl">Template URL</Label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          placeholder="https://docs.google.com/.../copy"
          type="url"
          required
          disabled={isPending}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea id="instructions" name="instructions" placeholder="Explain the assignment" required disabled={isPending} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dueAt">Due Date (optional)</Label>
        <Input id="dueAt" name="dueAt" type="date" disabled={isPending} />
      </div>
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Create"}
        </Button>
      </div>
    </form>
  );
}

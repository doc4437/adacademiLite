"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { returnSubmission } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";

export function ReturnDialog({ taskId, studentName }: { taskId: string; studentName: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      await returnSubmission(taskId, notes);
      setNotes("");
      setOpen(false);
      toast({ title: "Task returned", description: `Notified ${studentName}` });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Return
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return to {studentName}</DialogTitle>
          <DialogDescription>Add optional notes to guide next steps.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Feedback or rework instructions"
          rows={4}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Returning..." : "Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { recordSubmission } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";

export function StudentSubmissionDialog({ taskId }: { taskId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [artifactUrl, setArtifactUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("artifactUrl", artifactUrl);
    if (notes) formData.append("notes", notes);

    startTransition(async () => {
      const result = await recordSubmission(formData);
      if (result.success) {
        toast({ title: "Submitted!", description: "Thanks for turning this in." });
        setArtifactUrl("");
        setNotes("");
        setOpen(false);
      } else {
        toast({ title: "Submission failed", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Submit work</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit your link</DialogTitle>
          <DialogDescription>Paste a viewable link to your finished work.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Input
            value={artifactUrl}
            onChange={(event) => setArtifactUrl(event.target.value)}
            placeholder="https://"
            type="url"
            required
          />
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional notes for your teacher"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !artifactUrl}>
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

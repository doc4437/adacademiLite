"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateStudentAccessCode } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";

type StudentAccessCodeDialogProps = {
  studentId: string;
  studentName: string;
  accessCode: string;
};

export function StudentAccessCodeDialog({ studentId, studentName, accessCode }: StudentAccessCodeDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(accessCode);

  useEffect(() => {
    if (open) {
      setValue(accessCode);
    }
  }, [accessCode, open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const trimmed = value.trim();

      const result = await updateStudentAccessCode(studentId, trimmed, accessCode);
      if (!result.success) {
        toast({ title: "Could not update access code", description: result.error, variant: "destructive" });
        return;
      }

      toast({ title: "Access code updated" });
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          Edit code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update access code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor={`access-code-${studentId}`}>New code for {studentName}</Label>
            <Input
              id={`access-code-${studentId}`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              disabled={isPending}
              required
              minLength={4}
              maxLength={64}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

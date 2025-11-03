"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "@/lib/actions";
import { TaskStatus } from "@/lib/schema";
import { useToast } from "@/components/ui/use-toast";

export function StudentCompleteButton({ taskId }: { taskId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await updateTaskStatus(taskId, TaskStatus.SUBMITTED);
      toast({ title: "Marked complete" });
    });
  };

  return (
    <Button size="sm" variant="default" onClick={handleClick} disabled={isPending}>
      {isPending ? "Saving..." : "Mark complete"}
    </Button>
  );
}


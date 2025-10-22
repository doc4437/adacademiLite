"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import { TaskStatus } from "@/lib/schema";
import { taskStatusLabels } from "@/lib/utils";

export function TaskStatusButton({ taskId, status, label }: { taskId: string; status: (typeof TaskStatus)[keyof typeof TaskStatus]; label: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await updateTaskStatus(taskId, status);
      toast({ title: `Status updated`, description: taskStatusLabels[status] });
    });
  };

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? "Updating..." : label}
    </Button>
  );
}

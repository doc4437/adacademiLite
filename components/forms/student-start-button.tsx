"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "@/lib/actions";
import { TaskStatus } from "@/lib/schema";
import { useToast } from "@/components/ui/use-toast";

export function StudentStartButton({ taskId, sourceUrl }: { taskId: string; sourceUrl: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    window.open(sourceUrl, "_blank", "noopener,noreferrer");
    startTransition(async () => {
      await updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);
      toast({ title: "Marked in progress" });
    });
  };

  return (
    <Button size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? "Opening..." : "Start"}
    </Button>
  );
}

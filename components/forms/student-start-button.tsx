"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "@/lib/actions";
import { TaskStatus } from "@/lib/schema";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function StudentStartButton({ taskId, sourceUrl, label = "Start" }: { taskId: string; sourceUrl: string; label?: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = async () => {
    // Try Drive-backed copy first
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/start`, { method: "POST" });
      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        if (data?.provider === "google-drive") {
          // Incremental auth for Drive; return to this page afterwards
          await signIn("google-drive", { callbackUrl: window.location.href });
          return;
        }
      }
      if (res.ok) {
        const data = (await res.json()) as { action: string; url?: string };
        if (data.action === "open" && data.url) {
          window.open(data.url, "_blank", "noopener,noreferrer");
          startTransition(async () => {
            await updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);
            toast({ title: "Marked in progress" });
            router.refresh();
          });
          return;
        }
      }
    } catch {
      // fall through to template URL
    }

    // Fallback: open the provided template URL and mark in progress
    window.open(sourceUrl, "_blank", "noopener,noreferrer");
    startTransition(async () => {
      await updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);
      toast({ title: "Marked in progress" });
      router.refresh();
    });
  };

  return (
    <Button size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? "Opening..." : label}
    </Button>
  );
}

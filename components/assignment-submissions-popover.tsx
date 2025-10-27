"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AssignmentSubmission = {
  taskId: string;
  studentName: string;
  latestArtifact: string | null;
};

export function AssignmentSubmissionsPopover({ submissions }: { submissions: AssignmentSubmission[] }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (submissions.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        className={cn(badgeVariants({ variant: "default" }), "cursor-pointer gap-1")}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Submitted {submissions.length}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 max-w-xs origin-top-right rounded-lg border bg-background p-3 text-sm shadow-lg"
        >
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Submissions</p>
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {submissions.map((submission) => (
              <li key={submission.taskId} className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-medium text-foreground" title={submission.studentName}>
                  {submission.studentName}
                </span>
                {submission.latestArtifact ? (
                  <Link
                    href={submission.latestArtifact}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">No link</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

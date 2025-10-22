"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setStudentActive } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";

type StudentStatusToggleProps = {
  studentId: string;
  active: boolean;
};

export function StudentStatusToggle({ studentId, active }: StudentStatusToggleProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useState(active);

  useEffect(() => {
    setOptimisticActive(active);
  }, [active]);

  const handleToggle = () => {
    startTransition(async () => {
      const nextActive = !optimisticActive;
      setOptimisticActive(nextActive);

      const result = await setStudentActive(studentId, nextActive);

      if (!result.success) {
        setOptimisticActive(active);
        toast({ title: "Could not update status", description: result.error, variant: "destructive" });
        return;
      }

      toast({ title: `Student ${nextActive ? "activated" : "deactivated"}` });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={optimisticActive ? "secondary" : "destructive"}>
        {optimisticActive ? "Active" : "Inactive"}
      </Badge>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={optimisticActive ? "Deactivate student" : "Activate student"}
      >
        {isPending ? "Saving..." : optimisticActive ? "Set inactive" : "Set active"}
      </Button>
    </div>
  );
}

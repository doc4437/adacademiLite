"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { taskStatusLabels, taskStatusOrder } from "@/lib/utils";
import { StudentStartButton } from "./student-start-button";
import { StudentSubmissionDialog } from "./student-submission-dialog";
import { TaskStatus } from "@/lib/schema";
import Link from "next/link";

export type StudentTask = {
  id: string;
  status: (typeof TaskStatus)[keyof typeof TaskStatus];
  assignmentTitle: string;
  instructions: string;
  sourceUrl: string;
  latestArtifact: string | null;
};

export function StudentTaskBoard({ tasks }: { tasks: StudentTask[] }) {
  const grouped = taskStatusOrder.reduce<Record<string, StudentTask[]>>((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      {taskStatusOrder.map((status) => (
        <Card key={status} className="border-muted">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{taskStatusLabels[status]}</CardTitle>
            <Badge variant={status === TaskStatus.RETURNED ? "destructive" : "secondary"}>{grouped[status]?.length ?? 0}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {grouped[status]?.length ? (
              grouped[status]?.map((task) => (
                <div key={task.id} className="space-y-2 rounded-md border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">{task.assignmentTitle}</h3>
                      <p className="text-xs text-muted-foreground">{task.instructions}</p>
                    </div>
                    <div className="flex gap-2">
                      {status === TaskStatus.ASSIGNED ? <StudentStartButton taskId={task.id} sourceUrl={task.sourceUrl} /> : null}
                      {status === TaskStatus.IN_PROGRESS || status === TaskStatus.RETURNED ? (
                        <StudentSubmissionDialog taskId={task.id} />
                      ) : null}
                    </div>
                  </div>
                  {task.latestArtifact ? (
                    <Link href={task.latestArtifact} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                      View last submission
                    </Link>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

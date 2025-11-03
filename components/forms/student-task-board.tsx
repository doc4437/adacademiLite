"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { taskStatusLabels, taskStatusDisplayOrder } from "@/lib/utils";
import { StudentStartButton } from "./student-start-button";
import { StudentSubmissionDialog } from "./student-submission-dialog";
import { StudentCompleteButton } from "./student-complete-button";
import { TaskStatus } from "@/lib/schema";
import Link from "next/link";

export type StudentTask = {
  id: string;
  status: (typeof TaskStatus)[keyof typeof TaskStatus];
  assignmentTitle: string;
  instructions: string;
  sourceUrl: string;
  requiresSubmission: boolean;
  latestArtifact: string | null;
};

type StudentTaskBoardProps = {
  tasks: StudentTask[];
  hiddenStatuses?: (typeof TaskStatus)[keyof typeof TaskStatus][];
};

export function StudentTaskBoard({ tasks, hiddenStatuses = [] }: StudentTaskBoardProps) {
  const visibleStatuses = taskStatusDisplayOrder.filter((status) => !hiddenStatuses.includes(status));

  const grouped = visibleStatuses.reduce<Record<string, StudentTask[]>>((acc, status) => {
    acc[status] = [];
    return acc;
  }, {});

  tasks.forEach((task) => {
    const bucket = task.status === TaskStatus.RETURNED ? TaskStatus.IN_PROGRESS : task.status;
    if (hiddenStatuses.includes(bucket)) {
      return;
    }
    if (bucket in grouped) {
      grouped[bucket]?.push(task);
    }
  });

  return (
    <div className="grid gap-4">
      {visibleStatuses.map((status) => (
        <Card key={status} className="border-muted">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{taskStatusLabels[status]}</CardTitle>
            <Badge variant="secondary">{grouped[status]?.length ?? 0}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {grouped[status]?.length ? (
              grouped[status]?.map((task) => (
                <div key={task.id} className="space-y-2 rounded-md border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">{task.assignmentTitle}</h3>
                      <p className="text-xs text-muted-foreground">{task.instructions}</p>
                      {task.status === TaskStatus.RETURNED ? (
                        <Badge variant="destructive" className="mt-2">
                          Needs updates
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      {status === TaskStatus.ASSIGNED ? (
                        <>
                          <StudentStartButton taskId={task.id} sourceUrl={task.sourceUrl} />
                          {!task.requiresSubmission ? <StudentCompleteButton taskId={task.id} /> : null}
                        </>
                      ) : null}
                      {status === TaskStatus.IN_PROGRESS ? (
                        task.requiresSubmission ? (
                          <StudentSubmissionDialog taskId={task.id} />
                        ) : (
                          <StudentCompleteButton taskId={task.id} />
                        )
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

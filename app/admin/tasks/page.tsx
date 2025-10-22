import Link from "next/link";
import { db } from "@/lib/db";
import { assignments, students, tasks, TaskStatus } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskAssignForm } from "@/components/forms/task-assign-form";
import { ReturnDialog } from "@/components/forms/return-dialog";
import { TaskStatusButton } from "@/components/forms/task-status-button";
import { TaskFilters } from "@/components/forms/task-filters";
import { taskStatusLabels } from "@/lib/utils";
import { and, desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type TaskSearchParams = {
  student?: string | string[];
  status?: string | string[];
};

type AdminTasksPageProps = {
  searchParams?: Promise<TaskSearchParams>;
};

export default async function AdminTasksPage({ searchParams }: AdminTasksPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedStudent =
    typeof resolvedSearchParams.student === "string" ? resolvedSearchParams.student : "";
  const selectedStatus =
    typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "";

  const allStudents = await db
    .select({ id: students.id, displayName: students.displayName })
    .from(students)
    .orderBy(desc(students.createdAt));

  const allAssignments = await db
    .select({ id: assignments.id, title: assignments.title })
    .from(assignments)
    .orderBy(desc(assignments.createdAt));

  const filters: any[] = [];
  if (selectedStudent) filters.push(eq(tasks.studentId, selectedStudent));
  if (selectedStatus) filters.push(eq(tasks.status, selectedStatus as (typeof TaskStatus)[keyof typeof TaskStatus]));

  const query = db
    .select({
      id: tasks.id,
      status: tasks.status,
      updatedAt: tasks.updatedAt,
      studentName: students.displayName,
      studentAccess: students.accessCode,
      assignmentTitle: assignments.title,
      sourceUrl: assignments.sourceUrl,
      latestArtifact: sql<string | null>`(SELECT artifactUrl FROM submissions WHERE submissions.taskId = ${tasks.id} ORDER BY submissions.submittedAt DESC LIMIT 1)`,
    })
    .from(tasks)
    .innerJoin(students, eq(tasks.studentId, students.id))
    .innerJoin(assignments, eq(tasks.assignmentId, assignments.id))
    .orderBy(desc(tasks.updatedAt));

  const taskRows = filters.length ? await query.where(and(...filters)) : await query;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TaskFilters students={allStudents} initialStudent={selectedStudent} initialStatus={selectedStatus} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submission</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taskRows.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium">{task.studentName}</div>
                    <Link href={`/s/${task.studentAccess}`} className="text-xs text-muted-foreground hover:underline">
                      /s/{task.studentAccess}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{task.assignmentTitle}</div>
                    <Link href={task.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                      Template
                    </Link>
                  </TableCell>
                  <TableCell>{taskStatusLabels[task.status]}</TableCell>
                  <TableCell>
                    {task.latestArtifact ? (
                      <Link href={task.latestArtifact} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                        View submission
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    {task.status !== TaskStatus.IN_PROGRESS ? (
                      <TaskStatusButton taskId={task.id} status={TaskStatus.IN_PROGRESS} label="Mark In Progress" />
                    ) : null}
                    {task.status !== TaskStatus.SUBMITTED ? (
                      <TaskStatusButton taskId={task.id} status={TaskStatus.SUBMITTED} label="Mark Submitted" />
                    ) : null}
                    <ReturnDialog taskId={task.id} studentName={task.studentName} />
                  </TableCell>
                </TableRow>
              ))}
              {taskRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No tasks yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assign Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskAssignForm students={allStudents} assignments={allAssignments} />
        </CardContent>
      </Card>
    </div>
  );
}

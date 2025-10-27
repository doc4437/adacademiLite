import Link from "next/link";
import { db } from "@/lib/db";
import { assignments, students, tasks, TaskStatus } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssignmentForm } from "@/components/forms/assignment-form";
import { AssignmentSubmissionsPopover } from "@/components/assignment-submissions-popover";
import { asc, desc, eq, sql } from "drizzle-orm";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addDays, format, startOfWeek } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminAssignmentsPage() {
  const now = new Date();
  const allAssignments = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      sourceUrl: assignments.sourceUrl,
      instructions: assignments.instructions,
      dueAt: assignments.dueAt,
      createdAt: assignments.createdAt,
    })
    .from(assignments)
    .orderBy(desc(assignments.createdAt));

  const assignmentTaskCounts = await db
    .select({
      assignmentId: tasks.assignmentId,
      status: tasks.status,
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .groupBy(tasks.assignmentId, tasks.status);

  const assignmentSubmissionRows = await db
    .select({
      assignmentId: tasks.assignmentId,
      taskId: tasks.id,
      studentName: students.displayName,
      latestArtifact: sql<string | null>`
        (
          SELECT artifactUrl
          FROM submissions
          WHERE submissions.taskId = ${tasks.id}
          ORDER BY submissions.submittedAt DESC
          LIMIT 1
        )
      `,
    })
    .from(tasks)
    .innerJoin(students, eq(tasks.studentId, students.id))
    .where(eq(tasks.status, TaskStatus.SUBMITTED))
    .orderBy(asc(students.displayName));

  const assignmentOverdueCounts = await db
    .select({
      assignmentId: tasks.assignmentId,
      overdueCount: sql<number>`
        coalesce(
          sum(
            case
              when ${assignments.dueAt} is not null
                and ${assignments.dueAt} < ${now}
                and ${tasks.status} != ${TaskStatus.SUBMITTED}
              then 1
              else 0
            end
          ),
          0
        )
      `,
    })
    .from(tasks)
    .innerJoin(assignments, eq(tasks.assignmentId, assignments.id))
    .groupBy(tasks.assignmentId);

  const countsByAssignment = new Map<
    string,
    Partial<Record<(typeof TaskStatus)[keyof typeof TaskStatus], number>>
  >();

  assignmentTaskCounts.forEach((row) => {
    const existing = countsByAssignment.get(row.assignmentId) ?? {};
    existing[row.status] = row.count;
    countsByAssignment.set(row.assignmentId, existing);
  });

  const overdueByAssignment = new Map<string, number>();
  assignmentOverdueCounts.forEach((row) => {
    overdueByAssignment.set(row.assignmentId, row.overdueCount ?? 0);
  });

  const submissionsByAssignment = new Map<
    string,
    {
      taskId: string;
      studentName: string;
      latestArtifact: string | null;
    }[]
  >();
  assignmentSubmissionRows.forEach((row) => {
    const existing = submissionsByAssignment.get(row.assignmentId) ?? [];
    existing.push({
      taskId: row.taskId,
      studentName: row.studentName,
      latestArtifact: row.latestArtifact,
    });
    submissionsByAssignment.set(row.assignmentId, existing);
  });

  const assignmentSummaries = allAssignments.map((assignment) => {
    const counts = countsByAssignment.get(assignment.id) ?? {};
    const assignedCount = counts[TaskStatus.ASSIGNED] ?? 0;
    const inProgressCount = counts[TaskStatus.IN_PROGRESS] ?? 0;
    const submittedCount = counts[TaskStatus.SUBMITTED] ?? 0;
    const returnedCount = counts[TaskStatus.RETURNED] ?? 0;
    const openCount = inProgressCount + returnedCount;
    const pendingCount = assignedCount + openCount;
    const overdueCount = overdueByAssignment.get(assignment.id) ?? 0;
    const dueDate = assignment.dueAt ? new Date(assignment.dueAt) : null;

    return {
      ...assignment,
      assignedCount,
      inProgressCount,
      submittedCount,
      overdueCount,
      openCount,
      pendingCount,
      dueDate,
      submissions: submissionsByAssignment.get(assignment.id) ?? [],
    };
  });

  const activeAssignments = assignmentSummaries.filter((assignment) => assignment.pendingCount > 0);

  const historyGroupsMap = new Map<
    string,
    {
      key: string;
      weekStart: Date | null;
      title: string;
      range?: string;
      assignments: (typeof assignmentSummaries)[number][];
    }
  >();

  assignmentSummaries.forEach((summary) => {
    const { dueDate } = summary;
    const weekStart = dueDate ? startOfWeek(dueDate, { weekStartsOn: 1 }) : null;
    const key = weekStart ? weekStart.toISOString() : "undated";
    const title = weekStart ? `Week of ${format(weekStart, "MMM d")}` : "No due date";
    const range = weekStart ? `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d")}` : undefined;

    const existing = historyGroupsMap.get(key);
    if (existing) {
      existing.assignments.push(summary);
    } else {
      historyGroupsMap.set(key, {
        key,
        weekStart,
        title,
        range,
        assignments: [summary],
      });
    }
  });

  const historyGroups = Array.from(historyGroupsMap.values()).sort((a, b) => {
    if (a.weekStart && b.weekStart) {
      return b.weekStart.getTime() - a.weekStart.getTime();
    }
    if (a.weekStart) return -1;
    if (b.weekStart) return 1;
    return 0;
  });

  const roster = await db
    .select({
      id: students.id,
      displayName: students.displayName,
      active: students.active,
    })
    .from(students)
    .orderBy(desc(students.createdAt));

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Assignments</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Tasks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeAssignments.map((assignment) => {
                const { dueDate, pendingCount, openCount, submittedCount, overdueCount, assignedCount } = assignment;
                const dueSoon =
                  dueDate !== null &&
                  dueDate.getTime() >= now.getTime() &&
                  dueDate.getTime() - now.getTime() <= 48 * 60 * 60 * 1000 &&
                  pendingCount > 0;
                const overdue = dueDate !== null && dueDate.getTime() < now.getTime() && pendingCount > 0;
                const isOverdue = overdueCount > 0;
                const tooltip = isOverdue ? `Overdue: ${overdueCount}` : undefined;

                return (
                  <TableRow key={assignment.id} className={cn(isOverdue ? "bg-destructive/5" : undefined)} title={tooltip}>
                    <TableCell className="space-y-1">
                      <div className="font-medium">{assignment.title}</div>
                      <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
                      <Button asChild variant="link" className="h-auto p-0 text-sm">
                        <Link href={assignment.sourceUrl} target="_blank" rel="noreferrer">
                          Open template
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-2">
                        <span>{formatDate(assignment.dueAt)}</span>
                        {overdue ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : dueSoon ? (
                          <Badge variant="outline">Due soon</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {isOverdue ? <Badge variant="destructive">Overdue {overdueCount}</Badge> : null}
                        {openCount > 0 ? <Badge variant="secondary">Open {openCount}</Badge> : null}
                        {assignedCount > 0 ? <Badge variant="outline">Assigned {assignedCount}</Badge> : null}
                        {pendingCount === 0 && submittedCount === 0 ? (
                          <span className="text-xs text-muted-foreground">No tasks</span>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {allAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    No assignments yet.
                  </TableCell>
                </TableRow>
              ) : null}
              {allAssignments.length > 0 && activeAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    No active assignments. Completed items are listed in Assignment History.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Create Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentForm students={roster} />
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Assignment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {historyGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Assignments will appear here once they are created.</p>
          ) : (
            historyGroups.map((group) => (
              <div key={group.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{group.title}</p>
                  {group.range ? <span className="text-xs text-muted-foreground">{group.range}</span> : null}
                </div>
                <div className="space-y-3">
                  {group.assignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-lg border p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-medium">{assignment.title}</div>
                          <p className="text-xs text-muted-foreground">
                            Due {assignment.dueDate ? format(assignment.dueDate, "MMM d") : "No due date"}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          {assignment.overdueCount > 0 ? (
                            <Badge variant="destructive">Overdue {assignment.overdueCount}</Badge>
                          ) : null}
                          {assignment.openCount > 0 ? (
                            <Badge variant="secondary">Open {assignment.openCount}</Badge>
                          ) : null}
                          {assignment.assignedCount > 0 ? (
                            <Badge variant="outline">Assigned {assignment.assignedCount}</Badge>
                          ) : null}
                          {assignment.submittedCount > 0 ? (
                            assignment.submissions.length > 0 ? (
                              <AssignmentSubmissionsPopover submissions={assignment.submissions} />
                            ) : (
                              <Badge>Submitted {assignment.submittedCount}</Badge>
                            )
                          ) : null}
                          {assignment.pendingCount === 0 && assignment.submittedCount === 0 ? (
                            <span className="text-xs text-muted-foreground">No tasks</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

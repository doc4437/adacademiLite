import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { assignments, students, tasks, TaskStatus } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { StudentTaskBoard, type StudentTask } from "@/components/forms/student-task-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentSubmissionsPopover } from "@/components/assignment-submissions-popover";
import { Badge } from "@/components/ui/badge";
import { addDays, format, startOfWeek } from "date-fns";

export const dynamic = "force-dynamic";

type StudentPortalPageProps = {
  params: Promise<{ accessCode: string }>;
};

export default async function StudentPortalPage({ params }: StudentPortalPageProps) {
  const { accessCode } = await params;
  const [student] = await db.select().from(students).where(eq(students.accessCode, accessCode)).limit(1);

  if (!student) {
    notFound();
  }

  const taskRows = await db
    .select({
      id: tasks.id,
      status: tasks.status,
      assignmentTitle: assignments.title,
      instructions: assignments.instructions,
      assignmentId: assignments.id,
      dueAt: assignments.dueAt,
      sourceUrl: assignments.sourceUrl,
      requiresSubmission: assignments.requiresSubmission,
      latestArtifact: sql<string | null>`(SELECT artifactUrl FROM submissions WHERE submissions.taskId = ${tasks.id} ORDER BY submissions.submittedAt DESC LIMIT 1)`,
    })
    .from(tasks)
    .innerJoin(assignments, eq(tasks.assignmentId, assignments.id))
    .where(eq(tasks.studentId, student.id));

  const tasksForBoard: StudentTask[] = taskRows
    .filter((task) => task.status !== TaskStatus.SUBMITTED)
    .map((task) => ({
      id: task.id,
      status: task.status,
      assignmentTitle: task.assignmentTitle,
      instructions: task.instructions,
      sourceUrl: task.sourceUrl,
      requiresSubmission: task.requiresSubmission,
      latestArtifact: task.latestArtifact,
    }));

  const historyGroupsMap = new Map<
    string,
    {
      key: string;
      weekStart: Date | null;
      title: string;
      range?: string;
      tasks: (typeof taskRows)[number][];
    }
  >();

  taskRows.forEach((task) => {
    const dueDate = task.dueAt ? new Date(task.dueAt) : null;
    const weekStart = dueDate ? startOfWeek(dueDate, { weekStartsOn: 1 }) : null;
    const key = weekStart ? weekStart.toISOString() : "undated";
    const title = weekStart ? `Week of ${format(weekStart, "MMM d")}` : "No due date";
    const range = weekStart ? `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d")}` : undefined;

    const existing = historyGroupsMap.get(key);
    if (existing) {
      existing.tasks.push(task);
    } else {
      historyGroupsMap.set(key, {
        key,
        weekStart,
        title,
        range,
        tasks: [task],
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {student.displayName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Open your assignments to work in Google Docs, YouTube, or other tools. When you finish, submit a link or mark it complete.
          </p>
        </CardContent>
      </Card>
      <StudentTaskBoard tasks={tasksForBoard} hiddenStatuses={[TaskStatus.SUBMITTED]} />
      <Card>
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
                  {group.tasks.map((task) => (
                    <div key={task.id} className="rounded-lg border p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-medium">{task.assignmentTitle}</div>
                          <p className="text-xs text-muted-foreground">
                            Due {task.dueAt ? format(new Date(task.dueAt), "MMM d") : "No due date"}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          {task.status === TaskStatus.SUBMITTED ? (
                            task.latestArtifact ? (
                              <AssignmentSubmissionsPopover
                                submissions={[
                                  {
                                    taskId: task.id,
                                    studentName: student.displayName,
                                    latestArtifact: task.latestArtifact ?? null,
                                  },
                                ]}
                              />
                            ) : (
                              <Badge>Completed</Badge>
                            )
                          ) : null}
                          {task.status === TaskStatus.IN_PROGRESS ? <Badge variant="secondary">In Progress</Badge> : null}
                          {task.status === TaskStatus.ASSIGNED ? <Badge variant="secondary">Assigned</Badge> : null}
                          {task.status === TaskStatus.RETURNED ? (
                            <Badge variant="destructive">Needs updates</Badge>
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

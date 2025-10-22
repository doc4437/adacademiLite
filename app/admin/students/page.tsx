import Link from "next/link";
import { db } from "@/lib/db";
import { assignments, students, tasks, TaskStatus } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StudentForm } from "@/components/forms/student-form";
import { desc, eq, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { StudentStatusToggle } from "@/components/admin/student-status-toggle";
import { StudentAccessCodeDialog } from "@/components/forms/student-access-code-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const now = new Date();
  const allStudents = await db
    .select({
      id: students.id,
      displayName: students.displayName,
      accessCode: students.accessCode,
      active: students.active,
      createdAt: students.createdAt,
    })
    .from(students)
    .orderBy(desc(students.createdAt));

  const studentTaskCounts = await db
    .select({
      studentId: tasks.studentId,
      status: tasks.status,
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .groupBy(tasks.studentId, tasks.status);

  const studentOverdueCounts = await db
    .select({
      studentId: tasks.studentId,
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
    .groupBy(tasks.studentId);

  const countsByStudent = new Map<
    string,
    Partial<Record<(typeof TaskStatus)[keyof typeof TaskStatus], number>>
  >();

  studentTaskCounts.forEach((row) => {
    const existing = countsByStudent.get(row.studentId) ?? {};
    existing[row.status] = row.count;
    countsByStudent.set(row.studentId, existing);
  });

  const overdueByStudent = new Map<string, number>();
  studentOverdueCounts.forEach((row) => {
    overdueByStudent.set(row.studentId, row.overdueCount ?? 0);
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Students</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Access Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tasks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStudents.map((student) => {
                const counts = countsByStudent.get(student.id) ?? {};
                const assignedCount = counts[TaskStatus.ASSIGNED] ?? 0;
                const inProgressCount = counts[TaskStatus.IN_PROGRESS] ?? 0;
                const submittedCount = counts[TaskStatus.SUBMITTED] ?? 0;
                const returnedCount = counts[TaskStatus.RETURNED] ?? 0;
                const openCount = assignedCount + inProgressCount;
                const hasTasks = openCount + submittedCount + returnedCount > 0;
                const overdueCount = overdueByStudent.get(student.id) ?? 0;
                const isOverdue = overdueCount > 0;
                const returnedBadgeVariant = isOverdue ? "outline" : "destructive";

                return (
                  <TableRow key={student.id} className={cn(isOverdue ? "bg-destructive/5" : undefined)}>
                    <TableCell className="font-medium">{student.displayName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/s/${student.accessCode}`} className="text-primary hover:underline">
                          {student.accessCode}
                        </Link>
                        <StudentAccessCodeDialog
                          studentId={student.id}
                          studentName={student.displayName}
                          accessCode={student.accessCode}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StudentStatusToggle studentId={student.id} active={student.active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {isOverdue ? <Badge variant="destructive">Overdue {overdueCount}</Badge> : null}
                        {openCount > 0 ? <Badge variant="secondary">Open {openCount}</Badge> : null}
                        {submittedCount > 0 ? <Badge>Submitted {submittedCount}</Badge> : null}
                        {returnedCount > 0 ? (
                          <Badge variant={returnedBadgeVariant}>Returned {returnedCount}</Badge>
                        ) : null}
                        {!hasTasks ? <span className="text-xs text-muted-foreground">No tasks</span> : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {allStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No students yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add Student</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm />
        </CardContent>
      </Card>
    </div>
  );
}

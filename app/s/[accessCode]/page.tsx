import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { assignments, students, tasks } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { StudentTaskBoard, type StudentTask } from "@/components/forms/student-task-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function StudentPortalPage({ params }: { params: { accessCode: string } }) {
  const [student] = await db.select().from(students).where(eq(students.accessCode, params.accessCode)).limit(1);

  if (!student) {
    notFound();
  }

  const taskRows = await db
    .select({
      id: tasks.id,
      status: tasks.status,
      assignmentTitle: assignments.title,
      instructions: assignments.instructions,
      sourceUrl: assignments.sourceUrl,
      latestArtifact: sql<string | null>`(SELECT artifactUrl FROM submissions WHERE submissions.taskId = ${tasks.id} ORDER BY submissions.submittedAt DESC LIMIT 1)`,
    })
    .from(tasks)
    .innerJoin(assignments, eq(tasks.assignmentId, assignments.id))
    .where(eq(tasks.studentId, student.id));

  const tasksForBoard: StudentTask[] = taskRows.map((task) => ({
    id: task.id,
    status: task.status,
    assignmentTitle: task.assignmentTitle,
    instructions: task.instructions,
    sourceUrl: task.sourceUrl,
    latestArtifact: task.latestArtifact,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {student.displayName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Open your assignment templates to work in Google Docs, Canva, or other tools. When you finish, submit a link so your teacher can review your work.
          </p>
        </CardContent>
      </Card>
      <StudentTaskBoard tasks={tasksForBoard} />
    </div>
  );
}

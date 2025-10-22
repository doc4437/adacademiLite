import Link from "next/link";
import { db } from "@/lib/db";
import { assignments } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssignmentForm } from "@/components/forms/assignment-form";
import { desc, sql } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminAssignmentsPage() {
  const allAssignments = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      sourceUrl: assignments.sourceUrl,
      instructions: assignments.instructions,
      dueAt: assignments.dueAt,
      createdAt: assignments.createdAt,
      taskCount: sql<number>`(SELECT count(*) FROM tasks WHERE tasks.assignmentId = ${assignments.id})`,
    })
    .from(assignments)
    .orderBy(desc(assignments.createdAt));

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
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
              {allAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="space-y-1">
                    <div className="font-medium">{assignment.title}</div>
                    <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
                    <Button asChild variant="link" className="h-auto p-0 text-sm">
                      <Link href={assignment.sourceUrl} target="_blank" rel="noreferrer">
                        Open template
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell>{formatDate(assignment.dueAt)}</TableCell>
                  <TableCell className="text-right">{assignment.taskCount}</TableCell>
                </TableRow>
              ))}
              {allAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    No assignments yet.
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
          <AssignmentForm />
        </CardContent>
      </Card>
    </div>
  );
}

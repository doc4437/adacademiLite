import Link from "next/link";
import { db } from "@/lib/db";
import { students } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StudentForm } from "@/components/forms/student-form";
import { desc, sql } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const allStudents = await db
    .select({
      id: students.id,
      displayName: students.displayName,
      accessCode: students.accessCode,
      active: students.active,
      createdAt: students.createdAt,
      taskCount: sql<number>`(SELECT count(*) FROM tasks WHERE tasks.studentId = ${students.id})`,
    })
    .from(students)
    .orderBy(desc(students.createdAt));

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
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
              {allStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.displayName}</TableCell>
                  <TableCell>
                    <Link href={`/s/${student.accessCode}`} className="text-primary hover:underline">
                      {student.accessCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.active ? "secondary" : "destructive"}>
                      {student.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{student.taskCount}</TableCell>
                </TableRow>
              ))}
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

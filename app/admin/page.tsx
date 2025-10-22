import Link from "next/link";
import { db } from "@/lib/db";
import { assignments, students, tasks } from "@/lib/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { taskStatusLabels, taskStatusOrder } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(students);
  const [assignmentCount] = await db.select({ count: sql<number>`count(*)` }).from(assignments);

  const statusCounts = await Promise.all(
    taskStatusOrder.map(async (status) => {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(eq(tasks.status, status));
      return { status, count: result?.count ?? 0 };
    })
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Manage student roster and access codes.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end justify-between">
          <p className="text-3xl font-semibold">{studentCount?.count ?? 0}</p>
          <Button asChild variant="outline">
            <Link href="/admin/students">View students</Link>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>Create and manage templates.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end justify-between">
          <p className="text-3xl font-semibold">{assignmentCount?.count ?? 0}</p>
          <Button asChild variant="outline">
            <Link href="/admin/assignments">View assignments</Link>
          </Button>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Task Status</CardTitle>
          <CardDescription>Quick summary of current workload.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {statusCounts.map((item) => (
            <div key={item.status} className="rounded-md border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">{taskStatusLabels[item.status]}</p>
              <p className="text-2xl font-semibold">{item.count}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

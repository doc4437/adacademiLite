import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { StudentAccessForm } from "@/components/forms/student-access-form";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Adacademi-Lite</CardTitle>
          <CardDescription>
            A lightweight per-student assignment router for homeschool and tutoring workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            Manage students, track assignments, and collect submission links from their external workspaces.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild>
                <Link href="/admin">
                  Admin Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/students">View Students</Link>
              </Button>
            </div>
            <div className="rounded-md border bg-muted/30 p-4 text-left">
              <h2 className="text-sm font-semibold">Students:</h2>
              <p className="mb-3 mt-1 text-xs text-muted-foreground">
                Have your access code ready to jump straight to your assignments.
              </p>
              <StudentAccessForm />
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

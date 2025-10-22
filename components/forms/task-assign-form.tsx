"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { assignTasks } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AssignableStudent = {
  id: string;
  displayName: string;
};

export type AssignableAssignment = {
  id: string;
  title: string;
};

export function TaskAssignForm({ students, assignments }: { students: AssignableStudent[]; assignments: AssignableAssignment[] }) {
  const { toast } = useToast();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignmentId, setAssignmentId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const toggleStudent = (id: string) => {
    setSelectedStudents((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    selectedStudents.forEach((studentId) => formData.append("studentIds", studentId));
    formData.append("assignmentId", assignmentId);

    startTransition(async () => {
      const result = await assignTasks(formData);
      if (result.success) {
        setSelectedStudents([]);
        setAssignmentId("");
        toast({ title: "Tasks assigned" });
      } else {
        toast({ title: "Could not assign tasks", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label>Assignment</Label>
        <Select value={assignmentId} onValueChange={setAssignmentId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose assignment" />
          </SelectTrigger>
          <SelectContent>
            {assignments.map((assignment) => (
              <SelectItem key={assignment.id} value={assignment.id}>
                {assignment.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Students</Label>
        <div className="grid gap-2 rounded-md border p-4">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students available.</p>
          ) : (
            students.map((student) => (
              <label key={student.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  disabled={isPending}
                />
                <span>{student.displayName}</span>
              </label>
            ))
          )}
        </div>
      </div>
      <Button type="submit" disabled={isPending || !assignmentId || selectedStudents.length === 0}>
        {isPending ? "Assigning..." : "Assign"}
      </Button>
    </form>
  );
}

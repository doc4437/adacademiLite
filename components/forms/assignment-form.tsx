"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createAssignment } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AssignmentFormStudent = {
  id: string;
  displayName: string;
  active: boolean;
};

export function AssignmentForm({ students }: { students: AssignmentFormStudent[] }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [assignScope, setAssignScope] = useState<"all" | "selected">("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [requiresSubmission, setRequiresSubmission] = useState(true);

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((current) =>
      current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]
    );
  };

  const handleAssignScopeChange = (nextScope: "all" | "selected") => {
    setAssignScope(nextScope);
    if (nextScope === "all") {
      setSelectedStudents([]);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget; // cache before async work
    const formData = new FormData(form);
    formData.set("assignScope", assignScope);
    formData.set("requiresSubmission", String(requiresSubmission));
    formData.delete("studentIds");
    if (assignScope === "selected") {
      selectedStudents.forEach((studentId) => formData.append("studentIds", studentId));
    }

    startTransition(async () => {
      const result = await createAssignment(formData);
      if (result.success) {
        form.reset();
        setAssignScope("all");
        setSelectedStudents([]);
        setRequiresSubmission(true);
        toast({ title: "Assignment created" });
      } else {
        toast({ title: "Could not create assignment", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Assignment title" required disabled={isPending} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sourceUrl">Resource URL</Label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          placeholder="https://docs.google.com/.../copy or https://youtu.be/..."
          type="url"
          required
          disabled={isPending}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea id="instructions" name="instructions" placeholder="Explain the assignment" required disabled={isPending} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dueAt">Due Date (optional)</Label>
        <Input id="dueAt" name="dueAt" type="date" disabled={isPending} />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="requiresSubmission"
          name="requiresSubmission"
          type="checkbox"
          className="h-4 w-4 rounded border"
          checked={requiresSubmission}
          onChange={(e) => setRequiresSubmission(e.target.checked)}
          disabled={isPending}
        />
        <Label htmlFor="requiresSubmission">Students must submit a link</Label>
      </div>
      <div className="grid gap-2">
        <Label>Assign to</Label>
        <Select value={assignScope} onValueChange={(value: "all" | "selected") => handleAssignScopeChange(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Assign scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All students</SelectItem>
            <SelectItem value="selected">Specific students</SelectItem>
          </SelectContent>
        </Select>
        {assignScope === "selected" ? (
          <div className="grid gap-2 rounded-md border p-4">
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students available.</p>
            ) : (
              students.map((student) => (
                <label key={student.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border"
                    name="studentIds"
                    value={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    disabled={isPending}
                  />
                  <span>
                    {student.displayName}
                    {!student.active ? " (inactive)" : ""}
                  </span>
                </label>
              ))
            )}
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Create"}
        </Button>
      </div>
    </form>
  );
}

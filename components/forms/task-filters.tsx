"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskStatusLabels } from "@/lib/utils";
import { TaskStatus } from "@/lib/schema";

export function TaskFilters({
  students,
  initialStudent,
  initialStatus,
}: {
  students: { id: string; displayName: string }[];
  initialStudent: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.replace(query ? `/admin/tasks?${query}` : `/admin/tasks`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={initialStudent} onValueChange={(value) => updateParam("student", value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All students" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All students</SelectItem>
          {students.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              {student.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={initialStatus} onValueChange={(value) => updateParam("status", value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All statuses</SelectItem>
          {Object.values(TaskStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {taskStatusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

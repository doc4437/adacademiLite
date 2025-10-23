"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { assignments, students, submissions, tasks, TaskStatus } from "./schema";
import { eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const studentSchema = z.object({
  displayName: z.string().min(1, "Name is required"),
  accessCode: z.string().min(4, "Access code must be at least 4 characters"),
  active: z.boolean().default(true),
});

const studentStatusSchema = z.object({
  studentId: z.string().min(1, "Student id is required"),
  active: z.boolean(),
});

const studentAccessCodeSchema = z.object({
  studentId: z.string().min(1, "Student id is required"),
  previousAccessCode: z.string().optional(),
  accessCode: z.string().min(4, "Access code must be at least 4 characters").max(64, "Access code is too long"),
});
const assignmentSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    sourceUrl: z.string().url("Provide a valid URL"),
    instructions: z.string().min(1, "Instructions are required"),
    dueAt: z.string().optional().nullable(),
    assignScope: z.enum(["all", "selected"]).default("all"),
    studentIds: z.array(z.string().min(1)).optional(),
  })
  .refine((value) => (value.assignScope === "selected" ? (value.studentIds?.length ?? 0) > 0 : true), {
    message: "Select at least one student",
    path: ["studentIds"],
  });

const taskAssignmentSchema = z.object({
  studentIds: z.array(z.string().min(1)),
  assignmentId: z.string().min(1),
});

const submissionSchema = z.object({
  taskId: z.string().min(1),
  artifactUrl: z.string().url("Provide a valid URL"),
  notes: z.string().optional().nullable(),
});

export async function createStudent(formData: FormData) {
  const parsed = studentSchema.safeParse({
    displayName: formData.get("displayName"),
    accessCode: formData.get("accessCode"),
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const now = new Date();

  await db.insert(students).values({
    id: createId(),
    displayName: parsed.data.displayName,
    accessCode: parsed.data.accessCode,
    active: parsed.data.active,
    createdAt: now,
  });

  revalidatePath("/admin/students");
  return { success: true };
}

export async function setStudentActive(studentId: string, active: boolean) {
  const parsed = studentStatusSchema.safeParse({ studentId, active });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors.join(", ") };
  }

  await db
    .update(students)
    .set({ active: parsed.data.active })
    .where(eq(students.id, parsed.data.studentId));

  revalidatePath("/admin/students");
  return { success: true };
}

export async function updateStudentAccessCode(studentId: string, accessCode: string, previousAccessCode?: string) {
  const parsed = studentAccessCodeSchema.safeParse({ studentId, accessCode, previousAccessCode });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors.join(", ") };
  }

  try {
    await db
      .update(students)
      .set({ accessCode: parsed.data.accessCode })
      .where(eq(students.id, parsed.data.studentId));
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return { success: false, error: "That access code is already in use." };
    }
    console.error("Failed to update student access code", error);
    return { success: false, error: "Something went wrong updating the access code." };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/s/${parsed.data.accessCode}`);
  if (parsed.data.previousAccessCode && parsed.data.previousAccessCode !== parsed.data.accessCode) {
    revalidatePath(`/s/${parsed.data.previousAccessCode}`);
  }

  return { success: true };
}

export async function createAssignment(formData: FormData) {
  const parsed = assignmentSchema.safeParse({
    title: formData.get("title"),
    sourceUrl: formData.get("sourceUrl"),
    instructions: formData.get("instructions"),
    dueAt: formData.get("dueAt"),
    assignScope: typeof formData.get("assignScope") === "string" ? (formData.get("assignScope") as string) : "all",
    studentIds: formData.getAll("studentIds").map((value) => value.toString()),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  const now = new Date();
  const assignmentId = createId();

  await db.insert(assignments).values({
    id: assignmentId,
    title: parsed.data.title,
    sourceUrl: parsed.data.sourceUrl,
    instructions: parsed.data.instructions,
    dueAt: dueAt ?? undefined,
    createdAt: now,
  });

  let targetStudentIds: string[] = [];

  if (parsed.data.assignScope === "selected" && parsed.data.studentIds) {
    targetStudentIds = parsed.data.studentIds;
  } else if (parsed.data.assignScope === "all") {
    const allStudentRows = await db.select({ id: students.id }).from(students);
    targetStudentIds = allStudentRows.map((row) => row.id);
  }

  if (targetStudentIds.length > 0) {
    const taskRows = targetStudentIds.map((studentId) => ({
      id: createId(),
      studentId,
      assignmentId,
      status: TaskStatus.ASSIGNED,
      createdAt: now,
      updatedAt: now,
    }));

    await db.insert(tasks).values(taskRows);

    const affectedStudents = await db
      .select({ accessCode: students.accessCode })
      .from(students)
      .where(inArray(students.id, targetStudentIds));

    affectedStudents.forEach((student) => {
      if (student.accessCode) {
        revalidatePath(`/s/${student.accessCode}`);
      }
    });
  }

  revalidatePath("/admin/assignments");
  revalidatePath("/admin/tasks");
  revalidatePath("/admin");
  return { success: true };
}

export async function assignTasks(formData: FormData) {
  const parsed = taskAssignmentSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    studentIds: Array.isArray(formData.getAll("studentIds"))
      ? (formData.getAll("studentIds") as string[])
      : [formData.get("studentIds") as string],
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const now = new Date();

  const pairs = parsed.data.studentIds.map((studentId) => ({
    id: createId(),
    studentId,
    assignmentId: parsed.data.assignmentId,
    status: TaskStatus.ASSIGNED,
    createdAt: now,
    updatedAt: now,
  }));

  if (pairs.length === 0) {
    return { success: false, error: "Select at least one student" };
  }

  await db.insert(tasks).values(pairs);

  const affectedStudents = await db
    .select({ accessCode: students.accessCode })
    .from(students)
    .where(inArray(students.id, parsed.data.studentIds));

  revalidatePath("/admin/tasks");
  revalidatePath("/admin");
  affectedStudents.forEach((student) => {
    if (student.accessCode) {
      revalidatePath(`/s/${student.accessCode}`);
    }
  });

  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: (typeof TaskStatus)[keyof typeof TaskStatus]) {
  await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  const [taskRow] = await db
    .select({ accessCode: students.accessCode })
    .from(tasks)
    .innerJoin(students, eq(tasks.studentId, students.id))
    .where(eq(tasks.id, taskId));

  if (taskRow?.accessCode) {
    revalidatePath(`/s/${taskRow.accessCode}`);
  }

  revalidatePath("/admin/tasks");
}

export async function bulkUpdateStatus(taskIds: string[], status: (typeof TaskStatus)[keyof typeof TaskStatus]) {
  if (taskIds.length === 0) return;

  await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(inArray(tasks.id, taskIds));

  revalidatePath("/admin/tasks");
}

export async function recordSubmission(formData: FormData) {
  const parsed = submissionSchema.safeParse({
    taskId: formData.get("taskId"),
    artifactUrl: formData.get("artifactUrl"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const now = new Date();

  await db.insert(submissions).values({
    id: createId(),
    taskId: parsed.data.taskId,
    artifactUrl: parsed.data.artifactUrl,
    notes: parsed.data.notes ?? null,
    submittedAt: now,
  });

  await db
    .update(tasks)
    .set({ status: TaskStatus.SUBMITTED, updatedAt: now })
    .where(eq(tasks.id, parsed.data.taskId));

  const [taskRow] = await db
    .select({ accessCode: students.accessCode })
    .from(tasks)
    .innerJoin(students, eq(tasks.studentId, students.id))
    .where(eq(tasks.id, parsed.data.taskId));

  if (taskRow?.accessCode) {
    revalidatePath(`/s/${taskRow.accessCode}`);
  }

  revalidatePath("/admin/tasks");
  return { success: true };
}

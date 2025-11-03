import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const TaskStatus = {
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  SUBMITTED: "SUBMITTED",
  RETURNED: "RETURNED",
} as const;

const cuid = () => text().$defaultFn(() => createId()).primaryKey();

export const students = sqliteTable("students", {
  id: cuid(),
  displayName: text({ length: 255 }).notNull(),
  accessCode: text({ length: 64 }).notNull().unique(),
  active: integer({ mode: "boolean" }).notNull().default(true),
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const assignments = sqliteTable("assignments", {
  id: cuid(),
  title: text({ length: 255 }).notNull(),
  sourceUrl: text().notNull(),
  instructions: text().notNull(),
  // When false, students can mark complete without submitting a link
  requiresSubmission: integer({ mode: "boolean" }).notNull().default(true),
  dueAt: integer({ mode: "timestamp_ms" }),
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const tasks = sqliteTable("tasks", {
  id: cuid(),
  studentId: text().notNull().references(() => students.id, { onDelete: "cascade" }),
  assignmentId: text().notNull().references(() => assignments.id, { onDelete: "cascade" }),
  status: text({ length: 32 })
    .notNull()
    .$type<(typeof TaskStatus)[keyof typeof TaskStatus]>()
    .default(TaskStatus.ASSIGNED),
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const submissions = sqliteTable("submissions", {
  id: cuid(),
  taskId: text().notNull().references(() => tasks.id, { onDelete: "cascade" }),
  artifactUrl: text().notNull(),
  submittedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  notes: text(),
});

export const studentRelations = relations(students, ({ many }) => ({
  tasks: many(tasks),
}));

export const assignmentRelations = relations(assignments, ({ many }) => ({
  tasks: many(tasks),
}));

export const taskRelations = relations(tasks, ({ one, many }) => ({
  student: one(students, {
    fields: [tasks.studentId],
    references: [students.id],
  }),
  assignment: one(assignments, {
    fields: [tasks.assignmentId],
    references: [assignments.id],
  }),
  submissions: many(submissions),
}));

export const submissionRelations = relations(submissions, ({ one }) => ({
  task: one(tasks, {
    fields: [submissions.taskId],
    references: [tasks.id],
  }),
}));

import "dotenv/config";
import { db } from "../lib/db";
import { assignments, students, tasks } from "../lib/schema";
import { createId } from "@paralleldrive/cuid2";

async function reset() {
  await db.delete(tasks);
  await db.delete(assignments);
  await db.delete(students);
}

async function main() {
  await reset();

  const now = new Date();

  const seedStudents = [
    {
      id: createId(),
      displayName: "Olivia",
      accessCode: `OLI-${createId().slice(0, 6).toUpperCase()}`,
      active: true,
      createdAt: now,
    },
    {
      id: createId(),
      displayName: "Amelia",
      accessCode: `AME-${createId().slice(0, 6).toUpperCase()}`,
      active: true,
      createdAt: now,
    },
  ];

  await db.insert(students).values(seedStudents);

  const seedAssignments = [
    {
      id: createId(),
      title: "Algebra – Linear Equations",
      sourceUrl: "https://docs.google.com/document/d/FILE_ID/copy",
      instructions: "Work the problems and show your steps clearly.",
      createdAt: now,
    },
    {
      id: createId(),
      title: "Sermon on the Mount – Reflection",
      sourceUrl: "https://docs.google.com/document/d/FILE_ID/copy",
      instructions: "Write 400–600 words and include at least two citations.",
      createdAt: now,
    },
    {
      id: createId(),
      title: "History – Timeline Cards",
      sourceUrl: "https://docs.google.com/document/d/FILE_ID/copy",
      instructions: "Complete five entries with dates and short descriptions.",
      createdAt: now,
    },
  ];

  await db.insert(assignments).values(seedAssignments);

  const seedTasks = seedStudents.flatMap((student) =>
    seedAssignments.map((assignment) => ({
      id: createId(),
      studentId: student.id,
      assignmentId: assignment.id,
      createdAt: now,
      updatedAt: now,
      status: "ASSIGNED" as const,
    }))
  );

  await db.insert(tasks).values(seedTasks);

  const allStudents = await db.select().from(students);
  console.log("Seeded students (magic links):");
  for (const student of allStudents) {
    console.log(`- ${student.displayName}: /s/${student.accessCode}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

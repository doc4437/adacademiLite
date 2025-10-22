import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { TaskStatus } from "./schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const urlSchema = z
  .string()
  .url({ message: "Must be a valid URL" })
  .max(2048, "URL too long");

export function validateUrl(value: string) {
  return urlSchema.safeParse(value);
}

export const taskStatusLabels: Record<(typeof TaskStatus)[keyof typeof TaskStatus], string> = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  RETURNED: "Returned",
};

export const taskStatusOrder: (typeof TaskStatus)[keyof typeof TaskStatus][] = [
  TaskStatus.ASSIGNED,
  TaskStatus.IN_PROGRESS,
  TaskStatus.SUBMITTED,
  TaskStatus.RETURNED,
];

export function formatDate(value: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

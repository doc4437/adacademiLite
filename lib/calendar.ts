import { format, isToday } from "date-fns";

export function formatDueDate(value: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  if (isToday(date)) return "Due today";
  return `Due ${format(date, "MMM d")}`;
}

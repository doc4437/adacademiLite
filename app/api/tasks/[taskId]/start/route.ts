import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignments, tasks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

function extractGoogleFileId(url: string): { fileId: string | null; kind: "document" | "spreadsheets" | "presentation" | null } {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("docs.google.com")) {
      // Patterns:
      // https://docs.google.com/document/d/<id>/copy
      // https://docs.google.com/spreadsheets/d/<id>/copy
      // https://docs.google.com/presentation/d/<id>/copy
      const parts = u.pathname.split("/").filter(Boolean);
      const kind = parts[0] as any;
      const idIndex = parts.findIndex((p) => p === "d");
      if (idIndex !== -1 && parts[idIndex + 1]) {
        return { fileId: parts[idIndex + 1], kind: kind };
      }
    }
  } catch {}
  return { fileId: null, kind: null };
}

function editorUrlFor(kind: string | null, id: string): string {
  if (!kind) return `https://drive.google.com/file/d/${id}/view`;
  if (kind === "document") return `https://docs.google.com/document/d/${id}/edit`;
  if (kind === "spreadsheets") return `https://docs.google.com/spreadsheets/d/${id}/edit`;
  if (kind === "presentation") return `https://docs.google.com/presentation/d/${id}/edit`;
  return `https://drive.google.com/file/d/${id}/view`;
}

export async function POST(req: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const params = await context.params;
  const taskId = params.taskId;

  // Get task + assignment
  const [task] = await db
    .select({
      id: tasks.id,
      assignmentId: tasks.assignmentId,
      sourceUrl: assignments.sourceUrl,
      title: assignments.title,
    })
    .from(tasks)
    .innerJoin(assignments, eq(tasks.assignmentId, assignments.id))
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Parse template
  const { fileId: templateId, kind } = extractGoogleFileId(task.sourceUrl);
  if (!templateId) {
    // Not a Google template; fall back to opening the source URL
    return NextResponse.json({ action: "open", url: task.sourceUrl });
  }

  // If we already created a copy for this task, just return it
  const [existing] = await db
    .select({ driveFileId: tasks.driveFileId, driveKind: tasks.driveKind })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);
  if (existing?.driveFileId) {
    const url = editorUrlFor(existing.driveKind ?? kind, existing.driveFileId);
    return NextResponse.json({ action: "open", url, fileId: existing.driveFileId });
  }

  // Get NextAuth JWT to find Google token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const hasDrive = typeof (token as any)?.scope === "string" && (token as any).scope.includes("https://www.googleapis.com/auth/drive.file");

  if (!token || !hasDrive || !(token as any).accessToken) {
    // Client should trigger incremental auth for provider id 'google-drive'
    return NextResponse.json({ action: "auth", provider: "google-drive" }, { status: 401 });
  }

  // Create a copy in the student's Drive
  const copyRes = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(templateId)}/copy?fields=id,mimeType,name,webViewLink`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${(token as any).accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: task.title,
      // appProperties can be helpful for traceability
      appProperties: { taskId },
    }),
  });

  if (!copyRes.ok) {
    const detail = await copyRes.text().catch(() => "");
    return NextResponse.json({ error: "Drive copy failed", detail }, { status: 502 });
  }

  const copied = (await copyRes.json()) as { id: string; mimeType?: string; name?: string; webViewLink?: string };
  const url = editorUrlFor(kind, copied.id);

  // Persist the Drive linkage for Resume functionality
  await db
    .update(tasks)
    .set({ driveFileId: copied.id, driveKind: kind ?? null, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  return NextResponse.json({ action: "open", url, fileId: copied.id });
}

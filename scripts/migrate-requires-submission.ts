import { createClient } from "@libsql/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_CONNECTION_URL is required");

  const client = createClient({ url, authToken });
  try {
    const info = await client.execute(`PRAGMA table_info('assignments')`);
    const hasColumn = info.rows.some((row: any) => row.name === "requiresSubmission");
    if (hasColumn) {
      console.log("Column requiresSubmission already exists. Nothing to do.");
      return;
    }
    console.log("Adding column requiresSubmission to assignments...");
    await client.execute(
      `ALTER TABLE assignments ADD COLUMN requiresSubmission integer NOT NULL DEFAULT 1`
    );
    console.log("Done.");
  } finally {
    // libsql client does not expose a close, it relies on fetch under the hood
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


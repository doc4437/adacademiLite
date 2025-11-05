import { createClient } from "@libsql/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function ensureColumn(client: any, table: string, column: string, ddl: string) {
  const info = await client.execute(`PRAGMA table_info('${table}')`);
  const hasColumn = info.rows.some((row: any) => row.name === column);
  if (hasColumn) {
    console.log(`Column ${column} already exists on ${table}.`);
    return false;
  }
  console.log(`Adding column ${column} to ${table}...`);
  await client.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  return true;
}

async function main() {
  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_CONNECTION_URL is required");

  const client = createClient({ url, authToken });
  try {
    const added1 = await ensureColumn(client, "tasks", "driveFileId", "text");
    const added2 = await ensureColumn(client, "tasks", "driveKind", "text");
    if (!added1 && !added2) {
      console.log("Nothing to migrate.");
    } else {
      console.log("Migration complete.");
    }
  } finally {
    // libsql client uses fetch; no explicit close
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


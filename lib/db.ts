import "server-only";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "./env";

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof createClient>;
};

const client =
  globalForDb.client ??
  createClient({
    url: env.TURSO_CONNECTION_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });

if (env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client);

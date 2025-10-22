import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

const { TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_CONNECTION_URL) {
  throw new Error("TURSO_CONNECTION_URL is required to run Drizzle commands");
}

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: TURSO_CONNECTION_URL,
    authToken: TURSO_AUTH_TOKEN,
  },
});

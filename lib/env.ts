import { z } from "zod";

const envSchema = z.object({
  TURSO_CONNECTION_URL: z.string().min(1, "Turso connection URL required"),
  TURSO_AUTH_TOKEN: z.string().min(1, "Turso auth token required"),
  ADMIN_PASSPHRASE: z.string().min(1, "Admin passphrase required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse({
  TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  ADMIN_PASSPHRASE: process.env.ADMIN_PASSPHRASE,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  console.warn("Invalid environment variables", parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      TURSO_CONNECTION_URL: "",
      TURSO_AUTH_TOKEN: "",
      ADMIN_PASSPHRASE: process.env.ADMIN_PASSPHRASE ?? "",
      NODE_ENV: process.env.NODE_ENV ?? "development",
    };

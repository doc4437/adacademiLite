import { cookies } from "next/headers";
import { env } from "./env";

const ADMIN_COOKIE = "adacademi_admin";

export function hasAdminSession() {
  const cookieStore = cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "1";
}

export function requireAdminSession() {
  return hasAdminSession();
}

export async function createAdminSession() {
  const cookieStore = cookies();
  cookieStore.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function validateAdminPassphrase(passphrase: string) {
  return passphrase === env.ADMIN_PASSPHRASE;
}

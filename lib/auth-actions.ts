"use server";

import { revalidatePath } from "next/cache";
import { createAdminSession, validateAdminPassphrase } from "./auth";

export async function authenticateAdmin(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const passphrase = (formData.get("passphrase") ?? "").toString();

  if (!validateAdminPassphrase(passphrase)) {
    return { error: "Invalid passphrase", success: false };
  }

  await createAdminSession();
  revalidatePath("/admin");
  return { error: undefined, success: true };
}

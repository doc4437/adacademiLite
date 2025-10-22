import type { ReactNode } from "react";
import { hasAdminSession } from "@/lib/auth";
import { AdminSignInForm } from "@/components/forms/admin-signin-form";

export const metadata = {
  title: "Admin • Adacademi-Lite",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const signedIn = hasAdminSession();

  if (!signedIn) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center">
        <AdminSignInForm />
      </div>
    );
  }

  return <>{children}</>;
}

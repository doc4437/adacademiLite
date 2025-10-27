import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/admin-header";

export const metadata = {
  title: "Admin • Adacademi-Lite",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <AdminHeader />
      {children}
    </div>
  );
}

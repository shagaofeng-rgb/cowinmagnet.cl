import AdminShell from "@/components/admin/AdminShell";
import { requireAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({ children }) {
  await requireAdminSession();
  return <AdminShell>{children}</AdminShell>;
}

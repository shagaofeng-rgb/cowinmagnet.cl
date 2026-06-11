import { getAdminSession } from "@/lib/adminAuth";

export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return null;
}

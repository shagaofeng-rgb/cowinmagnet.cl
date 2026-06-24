import { NextResponse } from "next/server";
import { requireAdminSession, verifyAdminCredentials } from "@/lib/adminAuth";
import { passwordMeetsPolicy, upsertStoredAdminPassword } from "@/lib/adminAccountStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = await requireAdminSession();
  const body = await request.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword || "");
  const nextPassword = String(body.nextPassword || "");

  if (!(await verifyAdminCredentials(session.email, currentPassword))) {
    return NextResponse.json({ success: false, error: "CURRENT_PASSWORD_INVALID" }, { status: 401 });
  }

  if (!passwordMeetsPolicy(nextPassword)) {
    return NextResponse.json({ success: false, error: "PASSWORD_POLICY_NOT_MET" }, { status: 400 });
  }

  await upsertStoredAdminPassword({ email: session.email, password: nextPassword });
  return NextResponse.json({ success: true, email: session.email });
}

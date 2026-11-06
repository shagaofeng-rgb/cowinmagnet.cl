import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { preferredLocale } from "@/lib/preferredLocale";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const requestHeaders = await headers();
  const requestCookies = await cookies();
  redirect("/" + preferredLocale({
    saved: requestCookies.get("cowinmagnet_locale")?.value,
    userAgent: requestHeaders.get("user-agent") || "",
    languages: requestHeaders.get("accept-language") || "",
    country: requestHeaders.get("x-vercel-ip-country") || ""
  }));
}

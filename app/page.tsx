import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const supportedLocales = new Set(["es-cl", "es", "pt-br", "en"]);
const crawlerPattern = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp/i;

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const requestHeaders = await headers();
  const requestCookies = await cookies();
  const savedLocale = requestCookies.get("cowinmagnet_locale")?.value?.toLowerCase();

  if (savedLocale && supportedLocales.has(savedLocale)) redirect(`/${savedLocale}`);
  if (crawlerPattern.test(requestHeaders.get("user-agent") || "")) redirect("/es-cl");
  if (requestHeaders.get("x-vercel-ip-country") === "BR") redirect("/pt-br");

  const acceptedLanguages = requestHeaders.get("accept-language") || "";
  if (/\bpt(?:-|;|,|$)/i.test(acceptedLanguages)) redirect("/pt-br");
  if (/\ben(?:-|;|,|$)/i.test(acceptedLanguages)) redirect("/en");
  redirect("/es-cl");
}

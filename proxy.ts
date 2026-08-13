import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const localeCookieName = "cowinmagnet_locale";
const supportedLocales = new Set(["es-cl", "es", "pt-br", "en"]);
const crawlerPattern = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp/i;

function preferredLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(localeCookieName)?.value?.toLowerCase();
  if (cookieLocale && supportedLocales.has(cookieLocale)) return cookieLocale;

  // Search bots retain the Spanish Chile canonical entry point. This only uses
  // request headers for routing and does not persist a visitor's IP or country.
  if (crawlerPattern.test(request.headers.get("user-agent") || "")) return "es-cl";
  if (request.headers.get("x-vercel-ip-country") === "BR") return "pt-br";

  const languages = request.headers.get("accept-language") || "";
  if (/\bpt(?:-|;|,|$)/i.test(languages)) return "pt-br";
  if (/\ben(?:-|;|,|$)/i.test(languages)) return "en";
  return "es-cl";
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  if (host === "www.cowinmagnet.cl") {
    const canonicalUrl = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, "https://cowinmagnet.cl");
    return NextResponse.redirect(canonicalUrl, 308);
  }

  if (request.method === "POST" && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/api/webhook/send_article", request.url));
  }
  if (request.method === "GET" && request.nextUrl.pathname === "/") {
    const response = NextResponse.redirect(new URL(`/${preferredLocale(request)}`, request.url), 307);
    response.headers.set("cache-control", "private, no-store");
    response.headers.set("vary", "Cookie, Accept-Language, x-vercel-ip-country");
    return response;
  }
  return NextResponse.next();
}

export const config = { matcher: "/:path*" };

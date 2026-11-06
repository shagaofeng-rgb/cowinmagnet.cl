import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { preferredLocale } from "@/lib/preferredLocale";
import { productRedirectPath } from "@/lib/productUrlAliases";

const localeCookieName = "cowinmagnet_locale";

export function proxy(request: NextRequest) {
  if (request.method === "POST" && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/api/webhook/send_article", request.url));
  }
  if (request.method === "GET" && request.nextUrl.pathname === "/") {
    const locale = preferredLocale({
      saved: request.cookies.get(localeCookieName)?.value,
      userAgent: request.headers.get("user-agent") || "",
      languages: request.headers.get("accept-language") || "",
      country: request.headers.get("x-vercel-ip-country") || ""
    });
    const target = request.nextUrl.clone();
    target.pathname = "/" + locale;
    const response = NextResponse.redirect(target, 307);
    response.headers.set("cache-control", "private, no-store");
    response.headers.set("vary", "Cookie, Accept-Language, x-vercel-ip-country");
    return response;
  }
  const productTarget = productRedirectPath(request.nextUrl.pathname);
  if (productTarget && (request.method === "GET" || request.method === "HEAD")) {
    const target = request.nextUrl.clone();
    target.pathname = productTarget;
    return NextResponse.redirect(target, 308);
  }
  const locale = request.nextUrl.pathname.match(/^\/(es-cl|es|pt-br|en)(?:\/|$)/i)?.[1]?.toLowerCase();
  if (!locale) return NextResponse.next();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-cowin-locale", locale);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ["/", "/(es-cl|es|pt-br|en)/:path*"] };

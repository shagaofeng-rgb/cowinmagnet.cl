import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.method === "POST" && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/api/webhook/send_article", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/" };

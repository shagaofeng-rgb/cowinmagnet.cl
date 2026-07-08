import { GET as blogRssGet } from "../../blog/rss.xml/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ locale: "es-cl" | "es" | "pt-br" | "en" }> }) {
  return blogRssGet(request, context);
}

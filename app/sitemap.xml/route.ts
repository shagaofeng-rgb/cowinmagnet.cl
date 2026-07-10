import { getSitemapDocument } from "@/lib/sitemapManager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const document = await getSitemapDocument("sitemap.xml");
  if (!document?.xml) return new Response("Sitemap unavailable", { status: 503 });

  const etag = `\"${document.checksum || "sitemap"}\"`;
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: { etag } });
  return new Response(document.xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      etag,
      ...(document.generated_at ? { "last-modified": new Date(document.generated_at).toUTCString() } : {})
    }
  });
}

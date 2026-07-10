import { getSitemapDocument } from "@/lib/sitemapManager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  if (!/^sitemap-(pages|categories|products|posts)(-\d+)?\.xml$/.test(filename)) {
    return new Response("Not found", { status: 404 });
  }
  const document = await getSitemapDocument(filename);
  if (!document?.xml) return new Response("Not found", { status: 404 });

  const etag = `\"${document.checksum || filename}\"`;
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

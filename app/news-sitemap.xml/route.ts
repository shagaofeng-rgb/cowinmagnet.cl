import { getPublishedPosts } from "@/data/blog";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

const baseUrl = "https://cowinmagnet.cl";

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getPublishedPosts("es-cl");
  const since = Date.now() - 48 * 60 * 60 * 1000;
  const freshNews = posts
    .filter((post) => post.sourceUrl)
    .filter((post) => new Date(post.publishedAt || post.date).getTime() >= since)
    .slice(0, 100);

  const urls = freshNews.map((post) => {
    const publishedAt = new Date(post.publishedAt || post.date).toISOString();
    return `
  <url>
    <loc>${baseUrl}/es-cl/blog/${escapeXml(post.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Cowinmagnet.cl News</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${publishedAt}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=1800"
    }
  });
}

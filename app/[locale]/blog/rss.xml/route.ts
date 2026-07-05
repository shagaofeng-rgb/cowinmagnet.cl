import { getPublishedPosts } from "@/data/blog";
import { Locale } from "@/data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const posts = (await getPublishedPosts(locale)).slice(0, 40);
  const siteUrl = "https://cowinmagnet.cl";
  const feedUrl = `${siteUrl}/${locale}/blog/rss.xml`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Cowinmagnet LATAM News</title>
    <link>${siteUrl}/${locale}/blog</link>
    <description>Industry news with Cowinmagnet technical analysis for magnetic separation, mining, recycling and bulk handling.</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${posts.map((post) => {
      const url = `${siteUrl}/${locale}/blog/${post.slug}`;
      return `<item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt || post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.summary)}</description>
      ${post.sourceUrl ? `<source url="${escapeXml(post.sourceUrl)}">${escapeXml(post.sourceTitle || post.sourceDomain || "External source")}</source>` : ""}
    </item>`;
    }).join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300"
    }
  });
}

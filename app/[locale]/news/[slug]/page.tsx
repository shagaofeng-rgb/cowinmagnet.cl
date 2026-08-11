import { notFound } from "next/navigation";
import Image from "next/image";
import { ArticleContent } from "@/components/ArticleContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { getNewsBySlug, staticPosts } from "@/data/news";
import { Locale, localizedPath } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";
// CMS news slugs can change without a rebuild, so published pages render on demand.
export const dynamicParams = true;
export const revalidate = 0;

function displayImage(src = "") {
  return src || "/assets/markets/chile-copper-ore.jpg";
}

export function generateStaticParams() {
  return staticPosts.flatMap((post) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getNewsBySlug(slug, locale);
  return {
    title: post ? post.title : "News",
    description: post?.summary,
    alternates: post ? localizedAlternates(locale, `news/${post.slug}`) : undefined,
    openGraph: post ? {
      title: post.title,
      description: post.summary,
      images: post.image ? [displayImage(post.image)] : undefined,
      type: "article"
    } : undefined
  };
}

export default async function NewsPostPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getNewsBySlug(slug, locale);
  if (!post) notFound();
  const image = displayImage(post.image);
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt || post.date,
    dateModified: post.publishedAt || post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Cowinmagnet.cl" },
    image: [image],
    mainEntityOfPage: `https://cowinmagnet.cl/${locale}/news/${post.slug}`,
    isBasedOn: post.sourceUrl || undefined,
    keywords: post.seoKeywords?.join(", "),
    articleSection: post.categoryTitle || "Industry News",
    about: post.topicClusterId || "magnetic separation equipment"
  };

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "News", href: localizedPath(locale, "news") }, { label: post.title }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <HeroBanner eyebrow={post.date} title={post.title} summary={post.summary} image={image} />
      <section className="band news-article-layout">
        <article className="news-article">
          <div className="news-source-box">
            <p><strong>Fuente original:</strong> {post.sourceUrl ? <a href={post.sourceUrl} target="_blank" rel="nofollow noopener noreferrer">{post.sourceTitle || post.sourceDomain || post.sourceUrl}</a> : "No indicada"}</p>
            {post.sourcePublishedAt ? <p><strong>Fecha de publicación de la fuente:</strong> {new Intl.DateTimeFormat(locale === "es-cl" ? "es-CL" : locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(post.sourcePublishedAt))}</p> : null}
            {post.sourceFetchedAt ? <p><strong>Fecha de consulta editorial:</strong> {new Intl.DateTimeFormat(locale === "es-cl" ? "es-CL" : locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(post.sourceFetchedAt))}</p> : null}
            <p>{post.editorialDisclaimer || "Esta es una síntesis editorial independiente. No reproduce el artículo completo de la fuente original."}</p>
            {post.imageCredit ? <p><strong>Imagen:</strong> {post.imageCredit}. Politica: {post.imagePolicy || "remote source image with credit"}.</p> : null}
          </div>
          {post.image ? <Image className="news-article-image" src={post.image} alt={post.title} width={1080} height={640} unoptimized /> : null}
          <ArticleContent body={post.body || ""} />
          {post.citations?.length ? (
            <section>
              <h2>Fuentes utilizadas</h2>
              <ul>{post.citations.map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="nofollow noopener noreferrer">{item.title || item.domain}</a></li>)}</ul>
            </section>
          ) : null}
        </article>
      </section>
    </>
  );
}

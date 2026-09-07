import { notFound } from "next/navigation";
import Image from "next/image";
import { ArticleContent } from "@/components/ArticleContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { getNewsBySlug, staticPosts } from "@/data/news";
import { Locale, localizedPath, t } from "@/data/site";
import { contentIndexingMetadata } from "@/lib/localizedContent";

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
  const indexing = post ? contentIndexingMetadata(post, locale, `news/${post.slug}`) : null;
  return {
    title: post ? post.title : "News",
    description: post?.summary,
    robots: indexing?.indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: indexing?.alternates,
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
  const indexing = contentIndexingMetadata(post, locale, `news/${post.slug}`);
  const image = displayImage(post.image);
  const contentLanguage = post.localized?.[locale] ? (locale === "es-cl" ? "es-CL" : locale === "pt-br" ? "pt-BR" : locale) : post.contentLanguage || "es";
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
    mainEntityOfPage: `https://cowinmagnet.cl/${indexing.canonicalLocale}/news/${post.slug}`,
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
            <p><strong>{t(locale, "Fuente original", "Fonte original", "Original source")}:</strong> {post.sourceUrl ? <a href={post.sourceUrl} target="_blank" rel="nofollow noopener noreferrer">{post.sourceTitle || post.sourceDomain || post.sourceUrl}</a> : t(locale, "No indicada", "Nao informada", "Not provided")}</p>
            {post.sourcePublishedAt ? <p><strong>{t(locale, "Fecha de publicacion de la fuente", "Data de publicacao da fonte", "Source publication date")}:</strong> {new Intl.DateTimeFormat(locale === "es-cl" ? "es-CL" : locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(post.sourcePublishedAt))}</p> : null}
            {post.sourceFetchedAt ? <p><strong>{t(locale, "Fecha de consulta editorial", "Data da consulta editorial", "Editorial access date")}:</strong> {new Intl.DateTimeFormat(locale === "es-cl" ? "es-CL" : locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(post.sourceFetchedAt))}</p> : null}
            <p>{post.editorialDisclaimer || t(locale, "Esta es una sintesis editorial independiente. No reproduce el articulo completo de la fuente original.", "Esta e uma sintese editorial independente. Nao reproduz o artigo completo da fonte original.", "This is an independent editorial summary and does not reproduce the full source article.")}</p>
            {post.imageCredit ? <p><strong>{t(locale, "Imagen", "Imagem", "Image")}:</strong> {post.imageCredit}. {t(locale, "Politica", "Politica", "Policy")}: {post.imagePolicy || "remote source image with credit"}.</p> : null}
          </div>
          {post.image ? <Image className="news-article-image" src={post.image} alt={post.title} width={1080} height={640} unoptimized /> : null}
          <div lang={contentLanguage}><ArticleContent body={post.body || ""} /></div>
          {post.citations?.length ? (
            <section>
              <h2>{t(locale, "Fuentes utilizadas", "Fontes utilizadas", "Sources used")}</h2>
              <ul>{post.citations.map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="nofollow noopener noreferrer">{item.title || item.domain}</a></li>)}</ul>
            </section>
          ) : null}
        </article>
      </section>
    </>
  );
}

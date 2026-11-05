import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArticleContent, articleSections } from "@/components/ArticleContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorImage, InteriorLink, InteriorSection } from "@/components/Interior";
import { editorialDate } from "@/components/EditorialList";
import { getNewsBySlug } from "@/data/news";
import { Locale, localizedPath, t } from "@/data/site";
import { contentIndexingMetadata } from "@/lib/localizedContent";

function displayImage(src = "") {
  return src || "/assets/markets/chile-copper-ore.jpg";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  await connection();
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
  await connection();
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

  const sections = articleSections(post.body || "");
  const date = post.publishedAt || post.date;
  const label = t(locale, "Noticias", "Notícias", "News");
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label, href: localizedPath(locale, "news") }, { label: post.categoryTitle || label }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <InteriorSection><div className="article-shell">
      <article className="article-copy" lang={contentLanguage}>
        <p className="meta">{date ? <time dateTime={date}>{editorialDate(date, locale)}</time> : null}{post.sourceDomain || post.categoryTitle || label ? <> · {post.sourceDomain || post.categoryTitle || label}</> : null}</p>
        <h1>{post.title}</h1>{post.summary ? <p className="lead">{post.summary}</p> : null}
        {post.image ? <figure><InteriorImage src={image} alt={post.title} className="article-cover" priority />{post.imageCredit ? <figcaption>{post.imageCredit}</figcaption> : null}</figure> : null}
        <div className="panel article-source" id="original-source">
            <p><strong>{t(locale, "Fuente original", "Fonte original", "Original source")}:</strong> {post.sourceUrl ? <a href={post.sourceUrl} target="_blank" rel="nofollow noopener noreferrer">{post.sourceTitle || post.sourceDomain || post.sourceUrl}</a> : t(locale, "No indicada", "Nao informada", "Not provided")}</p>
            {post.sourcePublishedAt ? <p><strong>{t(locale, "Fecha de publicacion de la fuente", "Data de publicacao da fonte", "Source publication date")}:</strong> {editorialDate(post.sourcePublishedAt, locale)}</p> : null}
            {post.sourceFetchedAt ? <p><strong>{t(locale, "Fecha de consulta editorial", "Data da consulta editorial", "Editorial access date")}:</strong> {editorialDate(post.sourceFetchedAt, locale)}</p> : null}
            <p>{post.editorialDisclaimer || t(locale, "Esta es una sintesis editorial independiente. No reproduce el articulo completo de la fuente original.", "Esta e uma sintese editorial independente. Nao reproduz o artigo completo da fonte original.", "This is an independent editorial summary and does not reproduce the full source article.")}</p>
            {post.imageCredit ? <p><strong>{t(locale, "Imagen", "Imagem", "Image")}:</strong> {post.imageCredit}. {t(locale, "Politica", "Politica", "Policy")}: {post.imagePolicy || "remote source image with credit"}.</p> : null}
          </div>
        <div className="article-body"><ArticleContent body={post.body || ""} /></div>
        {post.citations?.length ? (
            <section>
              <h2>{t(locale, "Fuentes utilizadas", "Fontes utilizadas", "Sources used")}</h2>
              <ul>{post.citations.map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="nofollow noopener noreferrer">{item.title || item.domain}</a></li>)}</ul>
            </section>
          ) : null}
      </article>
      <aside className="panel article-aside"><h2>{t(locale, "En este artículo", "Neste artigo", "In this article")}</h2>
        {sections.length ? <nav aria-label={t(locale, "Índice", "Índice", "Contents")}>{sections.map((section) => <a key={section.id} href={"#" + section.id}>{section.label}</a>)}</nav> : null}
        {post.sourceUrl ? <a href="#original-source">{t(locale, "Fuente original", "Fonte original", "Original source")}</a> : null}
        <InteriorLink href={localizedPath(locale, "industries")}>{t(locale, "Ver industrias", "Ver indústrias", "View industries")}</InteriorLink>
        <InteriorLink href={localizedPath(locale, "technical-support")}>{t(locale, "Soporte técnico", "Suporte técnico", "Technical support")}</InteriorLink>
      </aside>
    </div></InteriorSection>
  </Interior>;
}

import { connection } from "next/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorImage, InteriorLink, InteriorSection } from "@/components/Interior";
import { editorialDate } from "@/components/EditorialList";
import { ArticleContent, articleSections } from "@/components/ArticleContent";
import { getPublishedBlogArticle } from "@/lib/blogContent";
import { Locale, localizedPath, t } from "@/data/site";
import { contentIndexingMetadata } from "@/lib/localizedContent";


export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }): Promise<Metadata> {
  await connection();
  const { locale, slug } = await params;
  const post = await getPublishedBlogArticle(slug, locale);
  const indexing = post ? contentIndexingMetadata(post, locale, `blog/${post.slug}`) : null;
  return post ? {
    title: post.title,
    description: post.summary,
    robots: indexing?.indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: indexing?.alternates,
    openGraph: { type: "article", title: post.title, description: post.summary, images: post.image ? [post.image] : undefined }
  } : { title: "Blog" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  await connection();
  const { locale, slug } = await params;
  const post = await getPublishedBlogArticle(slug, locale);
  if (!post) notFound();
  const indexing = contentIndexingMetadata(post, locale, `blog/${post.slug}`);
  const image = post.image;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Cowinmagnet.cl" },
    mainEntityOfPage: `https://cowinmagnet.cl/${indexing.canonicalLocale}/blog/${post.slug}`,
    image: image ? [image] : undefined,
    articleSection: post.categoryTitle
  };
  const sections = articleSections(post.body || "");
  const date = post.publishedAt || post.createdAt;
  const label = "Blog";
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label, href: localizedPath(locale, "blog") }, { label: post.categoryTitle || label }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <InteriorSection><div className="article-shell">
      <article className="article-copy" lang={post.localized?.[locale] ? locale : "es"}>
        <p className="meta">{date ? <time dateTime={date}>{editorialDate(date, locale)}</time> : null}{post.categoryTitle || label ? <> · {post.categoryTitle || label}</> : null}</p>
        <h1>{post.title}</h1>{post.summary ? <p className="lead">{post.summary}</p> : null}
        {image ? <figure><InteriorImage src={image} alt={post.title} className="article-cover product-cover" priority /></figure> : null}
        <div className="article-body"><ArticleContent body={post.body || ""} /></div>
      </article>
      <aside className="panel article-aside"><h2>{t(locale, "En este artículo", "Neste artigo", "In this article")}</h2>
        {sections.length ? <nav aria-label={t(locale, "Índice", "Índice", "Contents")}>{sections.map((section) => <a key={section.id} href={"#" + section.id}>{section.label}</a>)}</nav> : null}
        <InteriorLink href={localizedPath(locale, "products")}>{t(locale, "Ver equipos", "Ver equipamentos", "View equipment")}</InteriorLink>
        <InteriorLink href={localizedPath(locale, "technical-support")}>{t(locale, "Soporte técnico", "Suporte técnico", "Technical support")}</InteriorLink>
      </aside>
    </div></InteriorSection>
  </Interior>;
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { getPublishedBlogArticle } from "@/lib/blogContent";
import { Locale, localizedPath } from "@/data/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPublishedBlogArticle(slug, locale);
  return post ? {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/${locale}/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.summary, images: post.image ? [post.image] : undefined }
  } : { title: "Blog" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPublishedBlogArticle(slug, locale);
  if (!post) notFound();
  const body = post.body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
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
    mainEntityOfPage: `https://cowinmagnet.cl/${locale}/blog/${post.slug}`,
    image: image ? [image] : undefined,
    articleSection: post.categoryTitle
  };
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Blog", href: localizedPath(locale, "blog") }, { label: post.title }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <HeroBanner eyebrow={post.categoryTitle} title={post.title} summary={post.summary} image={image || undefined} />
      <section className="band news-article-layout">
        <article className="news-article">
          <p className="news-meta-line">{(post.publishedAt || post.createdAt || "").slice(0, 10)} | {post.author}</p>
          {image ? <img className="news-article-image" src={image} alt={post.title} loading="lazy" /> : null}
          {body.map((block) => {
            if (block.startsWith("## ")) return <h2 key={block}>{block.replace(/^## /, "")}</h2>;
            if (block.startsWith("- ")) {
              return <ul key={block}>{block.split(/\n/).map((line) => <li key={line}>{line.replace(/^- /, "")}</li>)}</ul>;
            }
            return <p key={block}>{block}</p>;
          })}
        </article>
      </section>
    </>
  );
}

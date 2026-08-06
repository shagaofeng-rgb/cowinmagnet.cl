import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { getPublishedBlogArticles } from "@/lib/blogContent";
import { Locale, localizedPath, t } from "@/data/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Blog | Magnetic Separation Knowledge" : locale === "pt-br" ? "Blog | Conhecimento em separacao magnetica" : "Blog | Conocimiento en separacion magnetica",
    description: locale === "en" ? "Published technical articles for magnetic separation, mining, recycling and bulk handling." : "Articulos tecnicos publicados sobre separacion magnetica, mineria, reciclaje y manejo de graneles.",
    alternates: { canonical: `/${locale}/blog` }
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const posts = await getPublishedBlogArticles(locale);

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Blog" }]} />
      <HeroBanner
        eyebrow="Blog"
        title={t(locale, "Guias y conocimientos tecnicos", "Guias e conhecimento tecnico", "Technical guides and insights")}
        summary={t(locale, "Articulos publicados desde el CMS para apoyar decisiones de separacion magnetica, mineria, reciclaje y manejo de graneles.", "Artigos publicados pelo CMS para apoiar decisoes sobre separacao magnetica, mineracao, reciclagem e manuseio de graneis.", "Published CMS articles supporting magnetic separation, mining, recycling and bulk-handling decisions.")}
      />
      <section className="band">
        <div className="news-grid">
          {posts.map((post) => (
            <article className="news-card" key={post.slug}>
              {post.image ? <img src={post.image} alt={post.title} loading="lazy" /> : null}
              <div className="news-card-body">
                <p className="eyebrow">{post.categoryTitle}</p>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <small>{(post.publishedAt || post.createdAt || "").slice(0, 10)} | {post.author}</small>
                <Link href={localizedPath(locale, `blog/${post.slug}`)}>{t(locale, "Leer articulo", "Ler artigo", "Read article")}</Link>
              </div>
            </article>
          ))}
        </div>
        {!posts.length ? <p>{t(locale, "Aun no hay articulos publicados.", "Ainda nao ha artigos publicados.", "No published articles yet.")}</p> : null}
      </section>
    </>
  );
}

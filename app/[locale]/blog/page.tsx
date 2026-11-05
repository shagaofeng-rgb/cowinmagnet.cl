import { connection } from "next/server";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, Intro, type PageQuery } from "@/components/Interior";
import { EditorialList } from "@/components/EditorialList";
import { getPublishedBlogArticles } from "@/lib/blogContent";
import { Locale, t } from "@/data/site";
import { collectionIndexingMetadata } from "@/lib/localizedContent";


export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  await connection();
  const { locale } = await params;
  const posts = await getPublishedBlogArticles(locale, { includeBody: true });
  const indexing = collectionIndexingMetadata(posts, locale, "blog");
  return {
    title: locale === "en" ? "Blog | Magnetic Separation Knowledge" : locale === "pt-br" ? "Blog | Conhecimento em separacao magnetica" : "Blog | Conocimiento en separacion magnetica",
    description: locale === "en" ? "Published technical articles for magnetic separation, mining, recycling and bulk handling." : "Articulos tecnicos publicados sobre separacion magnetica, mineria, reciclaje y manejo de graneles.",
    robots: indexing.indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: indexing.alternates
  };
}

export default async function BlogPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<PageQuery> }) {
  await connection();
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const posts = await getPublishedBlogArticles(locale);
  const title = t(locale, "Blog técnico", "Blog técnico", "Technical blog");
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: "Blog" }]} />
    <Intro title={title} summary={t(locale, "Guías de selección, instalación y aplicación de equipos magnéticos.", "Guias de seleção, instalação e aplicação de equipamentos magnéticos.", "Guides to magnetic equipment selection, installation and applications.")} />
    <EditorialList locale={locale} type="blog" posts={posts} query={query} />
  </Interior>;
}

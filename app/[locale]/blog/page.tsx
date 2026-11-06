import { connection } from "next/server";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, Intro, type PageQuery } from "@/components/Interior";
import { EditorialList } from "@/components/EditorialList";
import { getPublishedBlogArticles } from "@/lib/blogContent";
import { Locale, t } from "@/data/site";
import { editorialIndexingMetadata } from "@/lib/localizedContent";


export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<PageQuery> }): Promise<Metadata> {
  await connection();
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const posts = await getPublishedBlogArticles(locale, { includeBody: true });
  return {
    title: t(locale, "Blog técnico de separación magnética", "Blog técnico de separação magnética", "Magnetic Separation Technical Blog"),
    description: t(locale, "Guías técnicas sobre separación magnética, minería, reciclaje y manejo de materiales a granel.", "Guias técnicos sobre separação magnética, mineração, reciclagem e manuseio de materiais a granel.", "Technical guides on magnetic separation, mining, recycling and bulk material handling."),
    ...editorialIndexingMetadata(posts, locale, "blog", query)
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

import { connection } from "next/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, Intro, type PageQuery } from "@/components/Interior";
import { EditorialList } from "@/components/EditorialList";
import { getPublishedNews } from "@/data/news";
import { Locale, t } from "@/data/site";
import type { Metadata } from "next";
import { collectionIndexingMetadata } from "@/lib/localizedContent";


export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  await connection();
  const { locale } = await params;
  const posts = await getPublishedNews(locale, { includeBody: true });
  const indexing = collectionIndexingMetadata(posts, locale, "news");
  const title = locale === "en" ? "Industry News for Magnetic Separation in the Americas" : locale === "pt-br" ? "Noticias industriais de separacao magnetica nas Americas" : "Noticias industriales de separacion magnetica en Americas";
  const description = locale === "en"
    ? "Editorial briefs from cited external sources with Cowinmagnet technical analysis for mining, recycling, cement and magnetic separation buyers."
    : locale === "pt-br"
      ? "Resumos editoriais com fontes citadas e analise tecnica para mineracao, reciclagem, cimento e separacao magnetica."
      : "Resumimos fuentes externas relevantes y agregamos una lectura tecnica para mineria, reciclaje, cemento y separacion magnetica.";
  return {
    title,
    description,
    robots: indexing.indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: indexing.alternates
  };
}

export default async function NewsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<PageQuery> }) {
  await connection();
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const posts = await getPublishedNews(locale);
  const title = t(locale, "Noticias de la industria", "Notícias do setor", "Industry news");
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: t(locale, "Noticias", "Notícias", "News") }]} />
    <Intro title={title} summary={t(locale, "Actualidad de minería, procesamiento de minerales y reciclaje.", "Atualizações de mineração, processamento mineral e reciclagem.", "Updates from mining, mineral processing and recycling.")} />
    <EditorialList locale={locale} type="news" posts={posts} query={query} />
  </Interior>;
}

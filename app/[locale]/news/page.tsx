import { connection } from "next/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, Intro, type PageQuery } from "@/components/Interior";
import { EditorialList } from "@/components/EditorialList";
import { getPublishedNews } from "@/data/news";
import { Locale, t } from "@/data/site";
import type { Metadata } from "next";
import { editorialIndexingMetadata } from "@/lib/localizedContent";


export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<PageQuery> }): Promise<Metadata> {
  await connection();
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const posts = await getPublishedNews(locale, { includeBody: true });
  return {
    title: t(locale, "Noticias de minería, reciclaje y separación magnética", "Notícias de mineração, reciclagem e separação magnética", "Mining, Recycling and Magnetic Separation News"),
    description: t(locale, "Actualidad de minería, reciclaje, cemento y separación magnética en Chile y las Américas.", "Notícias de mineração, reciclagem, cimento e separação magnética no Chile e nas Américas.", "Industry news on mining, recycling, cement and magnetic separation in Chile and the Americas."),
    ...editorialIndexingMetadata(posts, locale, "news", query)
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

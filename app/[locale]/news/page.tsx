import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { getPublishedNews } from "@/data/news";
import { Locale, localizedPath, t } from "@/data/site";
import Link from "next/link";
import type { Metadata } from "next";
import { htmlLanguageByLocale } from "@/lib/seo";
import { collectionIndexingMetadata } from "@/lib/localizedContent";
import { PaginationNav } from "@/components/PaginationNav";
import { paginateList, parseListPagination } from "@/lib/listPagination";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function displayImage(src = "") {
  return src || "/assets/markets/chile-copper-ore.jpg";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const posts = await getPublishedNews(locale);
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

export default async function NewsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  const query = await searchParams;
  const posts = await getPublishedNews(locale);
  const paged = paginateList(posts, parseListPagination(query, { defaultPageSize: 9, allowedPageSizes: [9] }));

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Noticias", "Noticias", "News") }]} />
      <HeroBanner
        eyebrow={t(locale, "Noticias", "Noticias", "News")}
        title={t(locale, "Noticias industriales de Sudamerica", "Noticias industriais da America do Sul", "Industrial news from South America")}
        summary={t(locale, "Resumimos fuentes externas relevantes y agregamos una lectura tecnica para mineria, reciclaje, cemento y separacion magnetica.", "Resumimos fontes externas relevantes e adicionamos uma leitura tecnica para mineracao, reciclagem, cimento e separacao magnetica.", "We summarize relevant cited sources and add a technical view for mining, recycling, cement and magnetic separation.")}
      />
      <section className="band">
        {locale === "en" || locale === "pt-br" ? <p className="news-language-note">{t(locale, "", "Os artigos mantem o idioma editorial original quando uma traducao revisada nao esta disponivel.", "Articles retain their original editorial language when a reviewed translation is not available.")}</p> : null}
        <div className="news-grid">
          {paged.items.map((post) => (
            <article className="news-card" key={post.slug} lang={post.localized?.[locale] ? htmlLanguageByLocale[locale] : post.contentLanguage || "es"}>
              {post.image ? <Image src={displayImage(post.image)} alt={post.title} width={720} height={430} unoptimized /> : null}
              <div className="news-card-body">
                <p className="eyebrow">{post.categoryTitle || "Industry News"}</p>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <small>{post.date} | {post.author}</small>
                {post.sourceUrl ? <small>{t(locale, "Fuente", "Fonte", "Source")}: {post.sourceTitle || post.sourceDomain}</small> : null}
                <Link href={localizedPath(locale, `news/${post.slug}`)}>{t(locale, "Leer noticia", "Ler noticia", "Read news")}</Link>
              </div>
            </article>
          ))}
        </div>
        <PaginationNav meta={paged.meta} pathname={localizedPath(locale, "news")} params={query} locale={locale} />
      </section>
    </>
  );
}

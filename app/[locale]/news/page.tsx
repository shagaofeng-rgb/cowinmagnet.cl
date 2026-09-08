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

function displayDate(value: string | undefined, locale: Locale) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const language = locale === "es-cl" ? "es-CL" : locale === "pt-br" ? "pt-BR" : "en-US";
  return new Intl.DateTimeFormat(language, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function displayAuthor(value: string | undefined, locale: Locale) {
  if (!value || /^(admin|administrator)$/i.test(value.trim())) return t(locale, "Equipo editorial Cowinmagnet", "Equipe editorial Cowinmagnet", "Cowinmagnet editorial team");
  return value;
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
  const showingStart = paged.meta.total ? (paged.meta.page - 1) * paged.meta.pageSize + 1 : 0;
  const showingEnd = Math.min(paged.meta.page * paged.meta.pageSize, paged.meta.total);
  const countLabel = paged.meta.total
    ? t(locale, `Mostrando ${showingStart}-${showingEnd} de ${paged.meta.total}`, `Mostrando ${showingStart}-${showingEnd} de ${paged.meta.total}`, `Showing ${showingStart}-${showingEnd} of ${paged.meta.total}`)
    : t(locale, "Aún no hay noticias publicadas", "Ainda não há notícias publicadas", "No published news yet");

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Noticias", "Noticias", "News") }]} />
      <HeroBanner
        eyebrow={t(locale, "Noticias", "Noticias", "News")}
        title={t(locale, "Noticias industriales de Sudamerica", "Noticias industriais da America do Sul", "Industrial news from South America")}
        summary={t(locale, "Resumimos fuentes externas relevantes y agregamos una lectura tecnica para mineria, reciclaje, cemento y separacion magnetica.", "Resumimos fontes externas relevantes e adicionamos uma leitura tecnica para mineracao, reciclagem, cimento e separacao magnetica.", "We summarize relevant cited sources and add a technical view for mining, recycling, cement and magnetic separation.")}
      />
      <section className="band editorial-index-section">
        {locale === "en" || locale === "pt-br" ? <p className="news-language-note">{t(locale, "", "Os artigos mantem o idioma editorial original quando uma traducao revisada nao esta disponivel.", "Articles retain their original editorial language when a reviewed translation is not available.")}</p> : null}
        <div className="editorial-index-head">
          <div>
            <p className="eyebrow">{t(locale, "ACTUALIZACIONES SELECCIONADAS", "ATUALIZACOES SELECIONADAS", "CURATED UPDATES")}</p>
            <h2>{t(locale, "Noticias para decisiones de proceso", "Noticias para decisoes de processo", "News for process decisions")}</h2>
          </div>
          <p className="editorial-index-count">{countLabel}</p>
        </div>
        <div className="news-grid editorial-grid">
          {paged.items.map((post) => (
            <article className="news-card editorial-card" key={post.slug} lang={post.localized?.[locale] ? htmlLanguageByLocale[locale] : post.contentLanguage || "es"}>
              <Link className="editorial-card-visual" href={localizedPath(locale, `news/${post.slug}`)} aria-label={post.title}>
                {post.image ? <Image src={displayImage(post.image)} alt="" width={720} height={430} unoptimized /> : <span className="editorial-card-fallback" aria-hidden="true">{t(locale, "NOTICIAS", "NOTICIAS", "NEWS")}</span>}
              </Link>
              <div className="news-card-body editorial-card-body">
                <div className="editorial-card-meta"><span>{post.categoryTitle || "Industry News"}</span><time dateTime={post.date}>{displayDate(post.date, locale)}</time></div>
                <h2><Link href={localizedPath(locale, `news/${post.slug}`)}>{post.title}</Link></h2>
                <p>{post.summary}</p>
                <div className="editorial-card-footer">
                  <small>{post.sourceUrl ? `${t(locale, "Fuente", "Fonte", "Source")}: ${post.sourceTitle || post.sourceDomain}` : displayAuthor(post.author, locale)}</small>
                  <Link href={localizedPath(locale, `news/${post.slug}`)}>{t(locale, "Leer noticia", "Ler noticia", "Read news")} <span aria-hidden="true">→</span></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <PaginationNav meta={paged.meta} pathname={localizedPath(locale, "news")} params={query} locale={locale} />
        {!posts.length ? <p className="editorial-empty">{t(locale, "Cuando se publiquen nuevas fuentes verificadas, aparecerán aquí.", "Quando novas fontes verificadas forem publicadas, elas aparecerão aqui.", "New verified coverage will appear here when it is published.")}</p> : null}
      </section>
    </>
  );
}

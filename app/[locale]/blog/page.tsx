import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { getPublishedBlogArticles } from "@/lib/blogContent";
import { Locale, localizedPath, t } from "@/data/site";
import { collectionIndexingMetadata } from "@/lib/localizedContent";
import { PaginationNav } from "@/components/PaginationNav";
import { paginateList, parseListPagination } from "@/lib/listPagination";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const posts = await getPublishedBlogArticles(locale);
  const indexing = collectionIndexingMetadata(posts, locale, "blog");
  return {
    title: locale === "en" ? "Blog | Magnetic Separation Knowledge" : locale === "pt-br" ? "Blog | Conhecimento em separacao magnetica" : "Blog | Conocimiento en separacion magnetica",
    description: locale === "en" ? "Published technical articles for magnetic separation, mining, recycling and bulk handling." : "Articulos tecnicos publicados sobre separacion magnetica, mineria, reciclaje y manejo de graneles.",
    robots: indexing.indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: indexing.alternates
  };
}

export default async function BlogPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  const query = await searchParams;
  const posts = await getPublishedBlogArticles(locale);
  const paged = paginateList(posts, parseListPagination(query, { defaultPageSize: 9, allowedPageSizes: [9] }));
  const showingStart = paged.meta.total ? (paged.meta.page - 1) * paged.meta.pageSize + 1 : 0;
  const showingEnd = Math.min(paged.meta.page * paged.meta.pageSize, paged.meta.total);
  const countLabel = paged.meta.total
    ? t(locale, `Mostrando ${showingStart}-${showingEnd} de ${paged.meta.total}`, `Mostrando ${showingStart}-${showingEnd} de ${paged.meta.total}`, `Showing ${showingStart}-${showingEnd} of ${paged.meta.total}`)
    : t(locale, "Aún no hay artículos publicados", "Ainda não há artigos publicados", "No published articles yet");

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Blog" }]} />
      <HeroBanner
        eyebrow="Blog"
        title={t(locale, "Guias y conocimientos tecnicos", "Guias e conhecimento tecnico", "Technical guides and insights")}
        summary={t(locale, "Articulos publicados desde el CMS para apoyar decisiones de separacion magnetica, mineria, reciclaje y manejo de graneles.", "Artigos publicados pelo CMS para apoiar decisoes sobre separacao magnetica, mineracao, reciclagem e manuseio de graneis.", "Published CMS articles supporting magnetic separation, mining, recycling and bulk-handling decisions.")}
      />
      <section className="band editorial-index-section">
        <div className="editorial-index-head">
          <div>
            <p className="eyebrow">{t(locale, "BIBLIOTECA TECNICA", "BIBLIOTECA TECNICA", "TECHNICAL LIBRARY")}</p>
            <h2>{t(locale, "Guías para definir su equipo", "Guias para definir seu equipamento", "Guides for defining your equipment")}</h2>
          </div>
          <p className="editorial-index-count">{countLabel}</p>
        </div>
        <div className="news-grid editorial-grid">
          {paged.items.map((post) => (
            <article className="news-card editorial-card" key={post.slug}>
              <Link className="editorial-card-visual" href={localizedPath(locale, `blog/${post.slug}`)} aria-label={post.title}>
                {post.image ? <img src={post.image} alt="" loading="lazy" /> : <span className="editorial-card-fallback" aria-hidden="true">{t(locale, "GUÍA", "GUIA", "GUIDE")}</span>}
              </Link>
              <div className="news-card-body editorial-card-body">
                <div className="editorial-card-meta"><span>{post.categoryTitle || "Blog"}</span><time dateTime={post.publishedAt || post.createdAt}>{displayDate(post.publishedAt || post.createdAt, locale)}</time></div>
                <h2><Link href={localizedPath(locale, `blog/${post.slug}`)}>{post.title}</Link></h2>
                <p>{post.summary}</p>
                <div className="editorial-card-footer">
                  <small>{displayAuthor(post.author, locale)}</small>
                  <Link href={localizedPath(locale, `blog/${post.slug}`)}>{t(locale, "Leer articulo", "Ler artigo", "Read article")} <span aria-hidden="true">→</span></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <PaginationNav meta={paged.meta} pathname={localizedPath(locale, "blog")} params={query} locale={locale} />
        {!posts.length ? <p className="editorial-empty">{t(locale, "Cuando se publiquen guías técnicas, aparecerán aquí.", "Quando guias técnicos forem publicados, eles aparecerão aqui.", "Published technical guides will appear here.")}</p> : null}
      </section>
    </>
  );
}

import Link from "next/link";
import { InteriorCard, InteriorImage, InteriorLink, InteriorRow, InteriorSection, queryValue, type PageQuery } from "@/components/Interior";
import { PaginationNav } from "@/components/PaginationNav";
import { htmlLanguageByLocale } from "@/lib/seo";
import { paginateList, parseListPagination } from "@/lib/listPagination";
import { localizedPath, t, type Locale } from "@/data/site";

type Entry = {
  slug: string;
  title: string;
  summary: string;
  image?: string;
  categoryTitle?: string;
  date?: string;
  publishedAt?: string;
  createdAt?: string;
  localized?: Record<string, unknown>;
  contentLanguage?: string;
};

export function editorialDate(value: string | undefined, locale: Locale) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(htmlLanguageByLocale[locale], { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

function sourceLanguage(post: Entry, locale: Locale) {
  return post.localized?.[locale] ? htmlLanguageByLocale[locale] : post.contentLanguage || "es";
}

export function EditorialList({ locale, type, posts, query }: { locale: Locale; type: "news" | "blog"; posts: Entry[]; query: PageQuery }) {
  const blog = type === "blog";
  const path = localizedPath(locale, type);
  const topics = [...new Set(posts.flatMap((item) => item.categoryTitle?.trim() ? [item.categoryTitle.trim()] : []))];
  const topic = topics.includes(queryValue(query, "topic")) ? queryValue(query, "topic") : "";
  const filtered = topic ? posts.filter((item) => item.categoryTitle?.trim() === topic) : posts;
  const paged = paginateList(filtered, parseListPagination(query, { defaultPageSize: 9, allowedPageSizes: [9] }));
  const featured = paged.meta.page === 1 ? paged.items[0] : undefined;
  const rest = featured ? paged.items.slice(1) : paged.items;
  const read = blog ? t(locale, "Leer guía", "Ler guia", "Read guide") : t(locale, "Leer noticia", "Ler notícia", "Read news");
  const format = (item: Entry) => {
    const date = item.publishedAt || item.date || item.createdAt;
    return <>{item.categoryTitle || (blog ? "Blog" : t(locale, "Noticias", "Notícias", "News"))}
      {date ? <> · <time dateTime={date}>{editorialDate(date, locale)}</time></> : null}</>;
  };
  return <InteriorSection className="article-list">
    {topics.length > 1 ? <div className="toolbar">
      {topics.length <= 7 ? <nav className="chips" aria-label={t(locale, "Temas", "Temas", "Topics")}>
        <Link className="chip" href={path} aria-current={!topic ? "page" : undefined}>{t(locale, "Todos", "Todos", "All")}</Link>
        {topics.map((name) => <Link className="chip" key={name} href={{ pathname: path, query: { topic: name } }} aria-current={topic === name ? "page" : undefined}>{name}</Link>)}
      </nav> : <form className="topic-form" action={path}><label>{t(locale, "Tema", "Tema", "Topic")} <select name="topic" className="field" defaultValue={topic}>
        <option value="">{t(locale, "Todos", "Todos", "All")}</option>{topics.map((name) => <option key={name}>{name}</option>)}</select></label>
        <button className="btn alt" type="submit">{t(locale, "Filtrar", "Filtrar", "Filter")}</button></form>}
    </div> : null}
    {featured ? <article className={"editorial" + (!featured.image ? " is-text" : "")} lang={sourceLanguage(featured, locale)}>
      {featured.image ? <InteriorImage src={featured.image} className={"editorial-image" + (blog ? " product-cover" : "")} alt="" priority /> : null}
      <div className="editorial-copy"><p className="meta">{format(featured)}</p><h2>{featured.title}</h2>
        {featured.summary ? <p className="editorial-excerpt">{featured.summary}</p> : null}
        <InteriorLink href={path + "/" + featured.slug}>{read}</InteriorLink>
      </div>
    </article> : null}
    {blog ? <div className="grid">{rest.map((item) => <div key={item.slug} lang={sourceLanguage(item, locale)} className="editorial-grid-item"><InteriorCard title={item.title} image={item.image} summary={item.summary} meta={format(item)} href={path + "/" + item.slug} label={read} /></div>)}</div> :
      <div>{rest.map((item) => <div key={item.slug} className="news-list-item" lang={sourceLanguage(item, locale)}><InteriorRow icon="calendar"
        title={<Link href={path + "/" + item.slug}>{item.title}</Link>} summary={format(item)}
        action={<InteriorLink href={path + "/" + item.slug}>{read}</InteriorLink>} /></div>)}</div>}
    {!paged.items.length ? <div className="panel cl-empty"><h2>{blog ? t(locale, "Aún no hay guías publicadas", "Ainda não há guias publicadas", "No published guides yet") : t(locale, "Aún no hay noticias publicadas", "Ainda não há notícias publicadas", "No published news yet")}</h2>
      <InteriorLink href={localizedPath(locale, "technical-support")}>{t(locale, "Consultar soporte técnico", "Consultar suporte técnico", "Get technical support")}</InteriorLink></div> : null}
    <PaginationNav meta={paged.meta} pathname={path} params={topic ? { topic } : undefined} locale={locale} />
  </InteriorSection>;
}

import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import { Interior, InteriorLink, InteriorRow, InteriorSection, Intro, queryValue, type PageQuery } from "@/components/Interior";
import { InteriorIcon, type InteriorIconName } from "@/components/InteriorIcon";
import { PaginationNav } from "@/components/PaginationNav";
import { industries, solutions, markets, chileRegions, productCategories, getCategoryDisplay } from "@/data/catalog";
import { catalogLocalization, getCatalogLocalizations, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { productPresentation } from "@/data/productPresentation";
import { technicalResources } from "@/data/technicalResources";
import { paginateList, parseListPagination } from "@/lib/listPagination";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates, localizedEntityCopy } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "Buscar", "Buscar", "Search"),
    description: t(locale, "Busqueda de productos, industrias, soluciones, mercados y recursos tecnicos de Cowinmagnet LATAM.", "Busca de produtos, industrias, solucoes, mercados e recursos tecnicos da Cowinmagnet LATAM.", "Search Cowinmagnet LATAM products, industries, solutions, markets and technical resources."),
    alternates: localizedAlternates(locale, "search"),
    robots: { index: false, follow: true }
  };
}

type ResultType = "product" | "industry" | "solution" | "market" | "resource";
type SearchItem = { kind: ResultType; title: string; summary: string; href: string; extra?: string; download?: boolean };

function normalize(value: string) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

async function findMatches(locale: Locale, value: string, kind: string) {
  const normalized = normalize(value);
  const terms = [...new Set(normalized.split(" ").filter(Boolean))].slice(0, 12);
  if (!terms.length) return [];
  const catalog = !kind || kind === "product" ? await getPublishedCatalogProducts() : [];
  const localizations = catalog.length ? await getCatalogLocalizations(locale) : new Map();
  const entries: SearchItem[] = catalog.map((product) => {
    const view = productPresentation(product, locale);
    const editorial = catalogLocalization(localizations, locale, product.slug);
    const category = productCategories.find((item) => item.slug === product.category);
    return { kind: "product", title: editorial?.title || view.title, summary: editorial?.summary || view.applications.join(" · "), href: localizedPath(locale, "products/" + product.category + "/" + product.slug), extra: [product.slug, product.title, category ? getCategoryDisplay(category, locale).title : "", view.summary].join(" ") };
  });
  for (const [type, route, items] of [["industry", "industries", industries], ["solution", "solutions", solutions], ["market", "markets", markets]] as const) {
    if (kind && kind !== type) continue;
    for (const item of items) { const view = localizedEntityCopy(locale, type, item.slug, item.title, item.summary);
      entries.push({ kind: type, title: view.title, summary: view.summary, href: localizedPath(locale, route + "/" + item.slug), extra: item.slug }); }
  }
  if (!kind || kind === "market") for (const region of chileRegions) {
    const view = localizedEntityCopy(locale, "region", region.slug, region.title, region.summary);
    entries.push({ kind: "market", title: view.title, summary: view.summary, href: localizedPath(locale, "markets/chile/" + region.slug), extra: region.slug + " Chile" });
  }
  if (!kind || kind === "resource") {
    entries.push(...technicalResources(locale).map((doc): SearchItem => ({ ...doc, kind: "resource", download: true })));
    entries.push({ kind: "resource", title: t(locale, "Soporte técnico", "Suporte técnico", "Technical support"), summary: t(locale, "Selección, instalación y mantenimiento", "Seleção, instalação e manutenção", "Selection, installation and maintenance"), href: localizedPath(locale, "technical-support") });
  }
  return entries.flatMap((entry) => {
    const title = normalize(entry.title);
    const combined = normalize([entry.title, entry.summary, entry.extra].filter(Boolean).join(" "));
    if (!terms.every((term) => combined.includes(term))) return [];
    const rank = (title === normalized ? 30 : title.includes(normalized) ? 15 : 0) + terms.filter((term) => title.includes(term)).length;
    return [{ ...entry, rank }];
  }).sort((a, b) => b.rank - a.rank || a.title.localeCompare(b.title, locale));
}

export default async function SearchPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<PageQuery> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const value = queryValue(query, "q").trim().slice(0, 140);
  const pathname = localizedPath(locale, "search");
  const labels: Record<ResultType, [string, InteriorIconName]> = {
    product: [t(locale, "Producto", "Produto", "Product"), "magnet"], industry: [t(locale, "Industria", "Indústria", "Industry"), "building-factory-2"],
    solution: [t(locale, "Solución", "Solução", "Solution"), "shield-check"], market: [t(locale, "Mercado", "Mercado", "Market"), "world"],
    resource: [t(locale, "Recurso", "Recurso", "Resource"), "file-text"]
  };
  const requested = queryValue(query, "type");
  const kind = Object.hasOwn(labels, requested) ? requested : "";
  const results = value ? await findMatches(locale, value, kind) : [];
  const { items, meta } = paginateList(results, parseListPagination(query, { defaultPageSize: 12, allowedPageSizes: [12] }));
  const title = t(locale, "Buscar", "Buscar", "Search");
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: title }]} />
    <Intro title={t(locale, "Buscar en Cowinmagnet", "Buscar na Cowinmagnet", "Search Cowinmagnet")} summary={t(locale, "Busque por modelo, industria o aplicación.", "Busque por modelo, indústria ou aplicação.", "Search by model, industry or application.")} />
    <InteriorSection>
      <form className="searchbox" action={pathname} role="search"><input name="q" type="search" required maxLength={140} aria-label={title} defaultValue={value} placeholder={t(locale, "Ej. RCYD", "Ex. RCYD", "E.g. RCYD")} /><button className="btn" type="submit"><InteriorIcon name="search" />{title}</button></form>
      {value ? <>
        <nav className="chips search-filters" aria-label={t(locale, "Tipo de resultado", "Tipo de resultado", "Result type")}>
          <Link className="chip" href={{ pathname, query: { q: value } }} aria-current={!kind ? "page" : undefined}>{t(locale, "Todos", "Todos", "All")}</Link>
          {Object.entries(labels).map(([key, [label]]) => <Link className="chip" key={key} href={{ pathname, query: { q: value, type: key } }} aria-current={kind === key ? "page" : undefined}>{label}</Link>)}
        </nav>
        {items.length ? <div className="panel"><p className="meta">{meta.total} {t(locale, "resultados", "resultados", "results")}</p>{items.map((item) => <InteriorRow key={item.href} icon={labels[item.kind][1]} title={item.title} summary={labels[item.kind][0] + " · " + item.summary}
          action={item.download ? <a href={item.href} download className="quiet">{t(locale, "Descargar", "Baixar", "Download")}</a> : <InteriorLink href={item.href}>{t(locale, "Abrir", "Abrir", "Open")}</InteriorLink>} />)}</div> :
          <div className="panel cl-empty"><h2>{t(locale, "Sin resultados", "Sem resultados", "No results")}</h2><p>{t(locale, "Pruebe un código de modelo o un término más corto.", "Tente um código de modelo ou um termo mais curto.", "Try a model code or a shorter term.")}</p><InteriorLink href={localizedPath(locale, "products")}>{t(locale, "Explorar catálogo", "Explorar catálogo", "Browse catalog")}</InteriorLink></div>}
        {items.length ? <PaginationNav meta={meta} locale={locale} pathname={pathname} params={{ q: value, type: kind || undefined }} /> : null}
      </> : <p className="search-filters"><InteriorLink href={localizedPath(locale, "products")}>{t(locale, "Explorar catálogo", "Explorar catálogo", "Browse catalog")}</InteriorLink></p>}
    </InteriorSection>
  </Interior>;
}

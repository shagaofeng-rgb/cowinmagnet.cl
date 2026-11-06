import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import { Interior, InteriorCard, InteriorLink, InteriorSection, Intro, queryValue, type PageQuery } from "@/components/Interior";
import { InteriorIcon } from "@/components/InteriorIcon";
import { getProductTruthCard } from "@/data/productTruth";
import { getProductDetailContent } from "@/data/productDetailContent";
import { getCategoryDisplay, productCategories, productCopy } from "@/data/catalog";
import { catalogLocalization, getCatalogLocalizations, getPublishedCatalogCategories, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { Locale, localizedPath, t } from "@/data/site";
import type { Metadata } from "next";
import { localizedListMetadata, localizedProductSeo } from "@/lib/seo";
import { productPresentation } from "@/data/productPresentation";
import { PaginationNav } from "@/components/PaginationNav";
import { paginateList, parseListPagination } from "@/lib/listPagination";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 12;

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: Locale; category: string }>; searchParams: Promise<PageQuery> }): Promise<Metadata> {
  const [{ locale, category: categorySlug }, query, catalog] = await Promise.all([params, searchParams, getPublishedCatalogProducts()]);
  const categories = await getPublishedCatalogCategories(catalog);
  const category = categories.find((item) => item.slug === categorySlug);
  const display = category ? (productCategories.some((item) => item.slug === category.slug) ? getCategoryDisplay(category as (typeof productCategories)[number], locale) : { title: category.title, summary: category.summary }) : null;
  return {
    title: display ? localizedProductSeo(locale, display.title) : "Product Category",
    description: display?.summary,
    ...localizedListMetadata(locale, "products/" + categorySlug, query, catalog.filter((item) => item.category === categorySlug).length, PAGE_SIZE, ["magnet", "cleaning", "application", "sort"])
  };
}

type CatalogProduct = Awaited<ReturnType<typeof getPublishedCatalogProducts>>[number];

function filterData(product: CatalogProduct) {
  const truth = getProductTruthCard(product.slug);
  const name = product.slug;
  return {
    magnet: truth?.magnetType === "electromagnetico" || !truth && name.includes("electromagnetic") ? "electromagnetic" :
      truth?.magnetType === "permanente" || !truth && name.includes("permanent") ? "permanent" : "",
    cleaning: truth?.discharge === "autolimpiante" || !truth && /self-(cleaning|dumping)|automatic/.test(name) ? "automatic" :
      truth?.discharge === "manual" || !truth && /manual/.test(name) ? "manual" : "",
    application: /pipeline|pipe/.test(name) ? "pipe" :
      product.category === "suspended-self-unloading-iron-removers" || /overband|conveyor-belt|self-dumping/.test(name) ? "conveyor" :
      /wet|ctb|ctn|cts/.test(name) ? "wet" : /dry/.test(name) ? "dry" : ""
  };
}

export default async function ProductCategoryPage({ params, searchParams }: { params: Promise<{ locale: Locale; category: string }>; searchParams: Promise<PageQuery> }) {
  const [{ locale, category: categorySlug }, query, catalog] = await Promise.all([params, searchParams, getPublishedCatalogProducts()]);
  const categories = await getPublishedCatalogCategories(catalog);
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) notFound();
  const l = (es: string, pt: string, en: string) => t(locale, es, pt, en);
  const pathname = localizedPath(locale, "products/" + categorySlug);
  const list = catalog.filter((item) => item.category === categorySlug).map((product) => ({ product, facets: filterData(product) }));
  const groups = [
    { key: "magnet", title: l("Tipo de imán", "Tipo de ímã", "Magnet type"), options: { permanent: l("Permanente", "Permanente", "Permanent"), electromagnetic: l("Electromagnético", "Eletromagnético", "Electromagnetic") } },
    { key: "cleaning", title: l("Limpieza", "Limpeza", "Cleaning"), options: { automatic: l("Autolimpiante", "Autolimpante", "Self-cleaning"), manual: "Manual" } },
    { key: "application", title: l("Instalación", "Instalação", "Installation"), options: { conveyor: l("Correa", "Correia", "Conveyor"), pipe: l("Tubería", "Tubulação", "Pipeline"), wet: l("Proceso húmedo", "Processo úmido", "Wet process"), dry: l("Proceso seco", "Processo seco", "Dry process") } }
  ] as const;
  const facets = groups.map((group) => {
    const options = Object.entries(group.options).filter(([value]) => list.some((item) => item.facets[group.key] === value));
    return { ...group, options, value: options.some(([value]) => value === queryValue(query, group.key)) ? queryValue(query, group.key) : "" };
  });
  const order = queryValue(query, "sort") === "model" ? "model" : "";
  const filtered = list.filter(({ facets: item }) => facets.every(({ key, value }) => !value || item[key] === value));
  if (order) filtered.sort((a, b) => a.product.title.localeCompare(b.product.title, locale, { numeric: true }));
  const paged = paginateList(filtered, parseListPagination(query, { defaultPageSize: PAGE_SIZE, allowedPageSizes: [PAGE_SIZE] }));
  const localizations = await getCatalogLocalizations(locale);
  const display = getCategoryDisplay(category, locale);
  const heading = category.key === "permanent" ? l("Separadores magnéticos suspendidos", "Separadores magnéticos suspensos", "Suspended magnetic separators") : display.title;
  const productLabel = l("Ver ficha", "Ver ficha", "View product");
  const filterQuery = Object.fromEntries(facets.filter(({ value }) => value).map(({ key, value }) => [key, value]));
  const filterHref = (key: string, value: string) => ({
    pathname, query: { ...filterQuery, ...(order ? { sort: order } : {}), [key]: value || undefined }
  });
  const filters = <div className="filter">
    <h3>{l("Familia", "Família", "Family")}</h3>
    <Link href={localizedPath(locale, "products")}>{l("Todas las familias", "Todas as famílias", "All families")}</Link>
    {categories.map((item) => item.slug === categorySlug
      ? <strong key={item.slug} aria-current="page">{getCategoryDisplay(item, locale).title}</strong>
      : <Link key={item.slug} href={localizedPath(locale, "products/" + item.slug)}>{getCategoryDisplay(item, locale).title}</Link>)}
    {facets.filter((group) => group.options.length > 1).map((group) => <fieldset key={group.key}>
      <legend>{group.title}</legend>
      <div className="chips">
        <Link className="chip" href={filterHref(group.key, "")} aria-current={!group.value ? "page" : undefined}>{l("Todos", "Todos", "All")}</Link>
        {group.options.map(([value, label]) => <Link key={value} className="chip" href={filterHref(group.key, value)}
          aria-current={group.value === value ? "page" : undefined}>{label}</Link>)}
      </div>
    </fieldset>)}
  </div>;
  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: productCopy[locale].products, href: localizedPath(locale, "products") }, { label: display.title }]} />
    <Intro title={heading} summary={display.summary} />
    <InteriorSection>
      <div className="sidebar-layout">
        <aside className="panel filter-desktop">{filters}</aside>
        <div>
          <details className="filter-mobile"><summary><InteriorIcon name="adjustments-horizontal" /> {l("Filtrar equipos", "Filtrar equipamentos", "Filter equipment")}</summary>{filters}</details>
          <div className="toolbar"><strong>{paged.meta.total} {l("modelos", "modelos", "models")}</strong>
            {facets.some(({ value }) => value) || order ? <InteriorLink href={pathname}>{l("Limpiar filtros", "Limpar filtros", "Clear filters")}</InteriorLink> : null}
            <form action={pathname} method="get" className="catalog-sort">
              {Object.entries(filterQuery).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
              <label>{l("Orden", "Ordem", "Sort")} <select className="field" name="sort" defaultValue={order}>
                <option value="">{l("Catálogo", "Catálogo", "Catalog")}</option>
                <option value="model">{l("Modelo A-Z", "Modelo A-Z", "Model A-Z")}</option>
              </select></label>
              <button className="btn alt" type="submit">{l("Aplicar", "Aplicar", "Apply")}</button>
            </form>
          </div>
          {paged.items.length ? <div className="grid">{paged.items.map(({ product, facets: item }) => {
            const presentation = productPresentation(product, locale);
            const editorial = catalogLocalization(localizations, locale, product.slug);
            const model = getProductDetailContent(product, locale).series;
            const attributes = facets.map(({ key, options }) => options.find(([value]) => value === item[key])?.[1]).filter(Boolean).slice(0, 2);
            return <InteriorCard key={product.slug} title={editorial?.title || presentation.title} image={product.image} meta={model}
              summary={editorial?.summary || attributes.join(" · ") || presentation.applications[0]} href={pathname + "/" + product.slug} label={productLabel} equipment />;
          })}</div> : <div className="panel"><h3>{l("No hay modelos con estos filtros", "Nenhum modelo com estes filtros", "No models match these filters")}</h3>
            <InteriorLink href={localizedPath(locale, "technical-support")}>{l("Consultar soporte", "Consultar suporte", "Get technical support")}</InteriorLink></div>}
          <PaginationNav meta={paged.meta} pathname={pathname} params={query} locale={locale} />
        </div>
      </div>
    </InteriorSection>
  </Interior>;
}

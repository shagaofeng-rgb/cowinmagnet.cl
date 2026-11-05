import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Interior, InteriorImage, InteriorLink, InteriorRow, InteriorSection, Intro } from "@/components/Interior";
import type { InteriorIconName } from "@/components/InteriorIcon";
import { PaginationNav } from "@/components/PaginationNav";
import { categoryImages, getCategoryDisplay, productCategories, productCopy } from "@/data/catalog";
import { getPublishedCatalogCategories, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import { paginateList, parseListPagination } from "@/lib/listPagination";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  return { title: copy.productCenterTitle, description: copy.productCenterSummary, alternates: localizedAlternates(locale, "products") };
}

export default async function ProductsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  const query = await searchParams;
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  const products = await getPublishedCatalogProducts();
  const categories = await getPublishedCatalogCategories(products);
  const pagination = parseListPagination(query, { defaultPageSize: 8, allowedPageSizes: [8] });
  const { items: paginatedCategories, meta } = paginateList(categories, pagination);

  const heading = t(locale, "Equipos de separación magnética", "Equipamentos de separação magnética", "Magnetic separation equipment");
  const featured = categories.find((item) => item.key === "permanent") ?? categories[0];
  const icons: Record<string, InteriorIconName> = { permanent: "magnet", electro: "filter", recycling: "recycle", components: "settings", application: "building-factory-2" };

  return <Interior locale={locale}>
    <Breadcrumbs locale={locale} items={[{ label: copy.products }]} />
    <Intro title={heading} summary={t(locale, "Encuentre equipos por familia o por el problema que necesita resolver.", "Encontre equipamentos por família ou pelo problema que precisa resolver.", "Find equipment by family or by the problem you need to solve.")} />
    <InteriorSection>
      <div className="split catalog-overview">
        <div>
          <h2>{t(locale, "Familias de equipos", "Famílias de equipamentos", "Equipment families")}</h2>
          {paginatedCategories.map((category) => {
            const display = getCategoryDisplay(category, locale);
            return <InteriorRow key={category.slug} icon={icons[category.key] || "magnet"} title={display.title} summary={display.summary}
              action={<InteriorLink href={localizedPath(locale, "products/" + category.slug)}>{t(locale, "Ver equipos", "Ver equipamentos", "View equipment")}</InteriorLink>} />;
          })}
          <PaginationNav meta={meta} pathname={localizedPath(locale, "products")} params={query} locale={locale} />
        </div>
        {featured ? <div className="panel">
          <div className="card-img equipment"><InteriorImage src={categoryImages[featured.key]} alt={getCategoryDisplay(featured, locale).title} /></div>
          <div className="card-body">
            <h3>{t(locale, "Separadores para correas", "Separadores para correias", "Conveyor separators")}</h3>
            <p>{t(locale, "Compare alternativas permanentes y electromagnéticas según su instalación.", "Compare alternativas permanentes e eletromagnéticas conforme a instalação.", "Compare permanent and electromagnetic options for your installation.")}</p>
            <InteriorLink href={localizedPath(locale, "products/" + featured.slug)}>{t(locale, "Ver separadores suspendidos", "Ver separadores suspensos", "View suspended separators")}</InteriorLink>
          </div>
        </div> : null}
      </div>
    </InteriorSection>
  </Interior>;
}

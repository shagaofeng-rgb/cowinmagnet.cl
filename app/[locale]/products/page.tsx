import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { categoryImages, getCategoryDisplay, productCategories, productCopy } from "@/data/catalog";
import { getPublishedCatalogCategories, getPublishedCatalogProducts } from "@/data/productCatalog.server";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  return { title: copy.productCenterTitle, description: copy.productCenterSummary, alternates: localizedAlternates(locale, "products") };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  const products = await getPublishedCatalogProducts();
  const categories = await getPublishedCatalogCategories(products);

  return <>
    <Breadcrumbs locale={locale} items={[{ label: copy.products }]} />
    <HeroBanner
      eyebrow={copy.products}
      title={t(locale, "Familias de equipos para proyectos industriales", "Famílias de equipamentos para projetos industriais", "Equipment families for industrial projects")}
      summary={t(locale, "Revise las familias del catálogo principal COWIN y entre al equipo que necesita. La selección final se confirma con las condiciones de su proceso.", "Revise as famílias do catálogo principal COWIN e acesse o equipamento necessário. A seleção final é confirmada com as condições do processo.", "Browse the COWIN main-catalog families and open the equipment you need. Final selection is confirmed from your process conditions.")}
      image="/assets/brief/south-africa/products/rcyd-permanent-self-cleaning.jpg"
    />
    <section className="band brief-page compact-catalog">
      <div className="brief-intro"><p className="eyebrow">{t(locale, "Catálogo principal", "Catálogo principal", "Main catalog")}</p><h2>{t(locale, "Todos los productos están organizados por aplicación", "Todos os produtos estão organizados por aplicação", "All products are organized by application")}</h2><p>{t(locale, `${products.length} productos sincronizados desde el catálogo principal de COWIN.`, `${products.length} produtos sincronizados do catálogo principal COWIN.`, `${products.length} products synchronized from the COWIN main catalog.`)}</p></div>
      <div className="family-grid">
        {categories.map((category) => {
          const display = productCategories.some((item) => item.slug === category.slug) ? getCategoryDisplay(category as (typeof productCategories)[number], locale) : { title: category.title, summary: category.summary };
          const count = products.filter((product) => product.category === category.slug).length;
          const image = categoryImages[category.key] || "/assets/products/rcyd-type-permanent-magnet-self-dumping-iron-remover/rcyd-type-permanent-magnet-self-dumping-iron-remover-01.jpg";
          return <Link className="family-card" href={localizedPath(locale, `products/${category.slug}`)} key={category.slug}>
            <Image src={image} alt={display.title} width={720} height={520} />
            <div><span>{count} {t(locale, "productos", "produtos", "products")}</span><h2>{display.title}</h2><p>{display.summary}</p><strong>{t(locale, "Ver familia", "Ver família", "View family")}</strong></div>
          </Link>;
        })}
      </div>
    </section>
    <section className="band muted selection-cta"><div><p className="eyebrow">{t(locale, "Selección técnica", "Seleção técnica", "Technical selection")}</p><h2>{t(locale, "Cuéntenos qué necesita separar o proteger", "Conte-nos o que você precisa separar ou proteger", "Tell us what you need to separate or protect")}</h2><p>{t(locale, "Para comenzar solo necesitamos el material, la capacidad aproximada, el país y el equipo o problema que desea resolver.", "Para começar, precisamos apenas do material, da capacidade aproximada, do país e do equipamento ou problema a resolver.", "To start, we only need the material, approximate capacity, country and the equipment or problem to solve.")}</p></div><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>{copy.fullQuote}</Link></section>
  </>;
}

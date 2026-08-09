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
      summary={t(locale, "Explore las familias de equipos COWIN y encuentre la solución adecuada para su proceso. La selección final se confirma según las condiciones de operación.", "Explore as famílias de equipamentos COWIN e encontre a solução adequada para o seu processo. A seleção final é confirmada conforme as condições de operação.", "Explore COWIN equipment families and find the right solution for your process. Final selection is confirmed from operating conditions.")}
      image="/assets/brief/south-africa/products/rcyd-permanent-self-cleaning.jpg"
    />
    <section className="band brief-page compact-catalog">
      <div className="brief-intro"><p className="eyebrow">{t(locale, "Catálogo de equipos", "Catálogo de equipamentos", "Equipment catalog")}</p><h2>{t(locale, "Encuentre equipos organizados por aplicación", "Encontre equipamentos organizados por aplicação", "Find equipment organized by application")}</h2><p>{t(locale, `${products.length} equipos disponibles para proyectos de minería, reciclaje y manejo de materiales.`, `${products.length} equipamentos disponíveis para projetos de mineração, reciclagem e movimentação de materiais.`, `${products.length} equipment options for mining, recycling, and material-handling projects.`)}</p></div>
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
    <section className="band muted selection-cta"><div><p className="eyebrow">{t(locale, "Selección técnica", "Seleção técnica", "Technical selection")}</p><h2>{t(locale, "Cuéntenos qué necesita separar o proteger", "Conte-nos o que você precisa separar ou proteger", "Tell us what you need to separate or protect")}</h2><p>{t(locale, "Para comenzar, solo necesitamos el material, la capacidad aproximada, el país y el equipo o problema que desea resolver.", "Para começar, precisamos apenas do material, da capacidade aproximada, do país e do equipamento ou problema a resolver.", "To start, we only need the material, approximate capacity, country, and the equipment or problem to solve.")}</p></div><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>{copy.fullQuote}</Link></section>
  </>;
}

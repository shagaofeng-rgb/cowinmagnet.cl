import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { categoryImages, productCategories } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export const metadata = { title: "Products" };

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Products" }]} />
      <HeroBanner eyebrow="Products" title="Centro de productos magneticos" summary="Categorias, listas de productos, aplicaciones y CTA para seleccion tecnica." image="/assets/generated/product-permanent-separator.png" />
      <section className="band">
        <div className="page-grid">
          {productCategories.map((category) => <ContentCard key={category.slug} title={category.title} summary={category.summary} image={categoryImages[category.key]} href={localizedPath(locale, `products/${category.slug}`)} />)}
        </div>
      </section>
    </>
  );
}

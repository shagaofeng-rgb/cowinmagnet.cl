import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { categoryImages, getCategoryDisplay, productCategories, productCopy } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export const metadata = { title: "Products" };

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = productCopy[locale] ?? productCopy["es-cl"];

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: copy.products }]} />
      <HeroBanner eyebrow={copy.products} title={copy.productCenterTitle} summary={copy.productCenterSummary} image="/assets/generated/product-permanent-separator.png" />
      <section className="band">
        <div className="page-grid">
          {productCategories.map((category) => {
            const display = getCategoryDisplay(category, locale);
            return <ContentCard key={category.slug} title={display.title} summary={display.summary} image={categoryImages[category.key]} href={localizedPath(locale, `products/${category.slug}`)} />;
          })}
        </div>
      </section>
    </>
  );
}

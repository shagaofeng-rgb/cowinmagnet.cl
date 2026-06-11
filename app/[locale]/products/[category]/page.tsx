import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { categoryImages, getCategoryDisplay, getProductSummary, productCategories, productCopy, products } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export function generateStaticParams() {
  return productCategories.flatMap((category) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, category: category.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = productCategories.find((item) => item.slug === categorySlug);
  return {
    title: category ? category.title : "Product Category",
    description: category?.summary
  };
}

export default async function ProductCategoryPage({ params }: { params: Promise<{ locale: Locale; category: string }> }) {
  const { locale, category: categorySlug } = await params;
  const category = productCategories.find((item) => item.slug === categorySlug);
  if (!category) notFound();
  const list = products.filter((item) => item.category === categorySlug);
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  const display = getCategoryDisplay(category, locale);
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: copy.products, href: localizedPath(locale, "products") }, { label: display.title }]} />
      <HeroBanner eyebrow={copy.productCategory} title={display.title} summary={display.summary} image={categoryImages[category.key]} />
      <section className="band"><div className="page-grid">{list.map((product) => <ContentCard key={product.slug} title={product.title} summary={getProductSummary(product, locale)} image={product.image} href={localizedPath(locale, `products/${categorySlug}/${product.slug}`)} />)}</div></section>
    </>
  );
}

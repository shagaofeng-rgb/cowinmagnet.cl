import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentCard } from "@/components/ContentCard";
import { HeroBanner } from "@/components/HeroBanner";
import { categoryImages, productCategories, products } from "@/data/catalog";
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
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Products", href: localizedPath(locale, "products") }, { label: category.title }]} />
      <HeroBanner eyebrow="Product Category" title={category.title} summary={category.summary} image={categoryImages[category.key]} />
      <section className="band"><div className="page-grid">{list.map((product) => <ContentCard key={product.slug} title={product.title} summary={product.summary} image={product.image} href={localizedPath(locale, `products/${categorySlug}/${product.slug}`)} />)}</div></section>
    </>
  );
}

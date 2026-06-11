import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { posts } from "@/data/blog";
import { products } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export function generateStaticParams() {
  return posts.flatMap((post) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  return {
    title: post ? post.title : "Blog",
    description: post?.summary
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Blog", href: localizedPath(locale, "blog") }, { label: post.title }]} />
      <HeroBanner eyebrow={post.date} title={post.title} summary={post.summary} />
      <section className="band"><article className="section-heading"><p><strong>Autor:</strong> {post.author}</p><h2>Tabla de contenido</h2><ol><li>Problema industrial</li><li>Datos de seleccion</li><li>Productos relacionados</li><li>CTA</li></ol><p>Este articulo es una plantilla editorial local. Antes de produccion, validar datos, fuentes y enlaces.</p></article></section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">Related Products</p><h2>Productos relacionados</h2></div><div className="page-grid">{products.slice(0, 2).map((product) => <article className="content-card" key={product.slug}><div className="content-card-body"><h3>{product.title}</h3><p>{product.summary}</p><Link href={localizedPath(locale, `products/${product.category}/${product.slug}`)}>Ver producto</Link></div></article>)}</div></section>
      <section className="band"><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>Solicitar cotizacion</Link></section>
    </>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { getPostBySlug, posts } from "@/data/blog";
import { getProductSummary, productCopy, products } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return posts.flatMap((post) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale);
  return {
    title: post ? post.title : "Blog",
    description: post?.summary,
    alternates: post?.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    openGraph: post ? {
      title: post.title,
      description: post.summary,
      images: post.image ? [post.image] : undefined,
      type: "article"
    } : undefined
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  const articleBody = post.body ? post.body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean) : [];
  const image = post.image || "/assets/markets/chile-copper-ore.jpg";
  const relatedProducts = post.relatedProducts?.length
    ? post.relatedProducts
      .map((relation) => products.find((product) => product.slug === relation.slug && product.category === relation.category) || products.find((product) => product.slug === relation.slug))
      .filter(Boolean)
      .slice(0, 3)
    : products.slice(0, 2);
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt || post.date,
    dateModified: post.publishedAt || post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Cowinmagnet.cl" },
    image: [image],
    mainEntityOfPage: `https://cowinmagnet.cl/${locale}/blog/${post.slug}`,
    isBasedOn: post.sourceUrl || undefined,
    keywords: post.seoKeywords?.join(", "),
    articleSection: post.categoryTitle || "Industry News",
    about: post.topicClusterId || "magnetic separation equipment",
    mentions: relatedProducts.map((product) => ({
      "@type": "Product",
      name: product?.title,
      url: `https://cowinmagnet.cl/${locale}/products/${product?.category}/${product?.slug}`
    }))
  };

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Blog", href: localizedPath(locale, "blog") }, { label: post.title }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <HeroBanner eyebrow={post.date} title={post.title} summary={post.summary} image={image} />
      <section className="band news-article-layout">
        <article className="news-article">
          <div className="news-source-box">
            <p><strong>Fuente citada:</strong> {post.sourceUrl ? <a href={post.sourceUrl} target="_blank" rel="nofollow noopener noreferrer">{post.sourceTitle || post.sourceDomain || post.sourceUrl}</a> : "Cowinmagnet editorial"}</p>
            {post.sourceUrl ? <p>Esta noticia es un resumen editorial con analisis propio. No reproduce el articulo completo de la fuente original.</p> : null}
            {post.sourcePublishedAt ? <p><strong>Fecha original:</strong> {new Date(post.sourcePublishedAt).toISOString()}</p> : null}
            {post.sourceFetchedAt ? <p><strong>Fecha de consulta:</strong> {new Date(post.sourceFetchedAt).toISOString()}</p> : null}
            {post.imageCredit ? <p><strong>Imagen:</strong> {post.imageCredit}. Politica: {post.imagePolicy || "remote source image with credit"}.</p> : null}
          </div>
          {post.image ? <Image className="news-article-image" src={post.image} alt={post.title} width={1080} height={640} unoptimized /> : null}
          {post.geoSummary ? <section className="geo-answer-box"><p className="eyebrow">AI / GEO Summary</p><p>{post.geoSummary}</p></section> : null}
          {articleBody.length ? articleBody.map((block) => {
            if (block.startsWith("## ")) return <h2 key={block}>{block.replace(/^## /, "")}</h2>;
            if (block.startsWith("- ")) {
              return <ul key={block}>{block.split(/\n/).map((line) => <li key={line}>{line.replace(/^- /, "")}</li>)}</ul>;
            }
            return <p key={block}>{block}</p>;
          }) : (
            <>
              <h2>Tabla de contenido</h2>
              <ol><li>Problema industrial</li><li>Datos de seleccion</li><li>Productos relacionados</li><li>CTA</li></ol>
              <p>Este articulo es una plantilla editorial local. Antes de produccion, validar datos, fuentes y enlaces.</p>
            </>
          )}
          {post.citations?.length ? (
            <section>
              <h2>Fuentes utilizadas</h2>
              <ul>{post.citations.map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="nofollow noopener noreferrer">{item.title || item.domain}</a></li>)}</ul>
            </section>
          ) : null}
          {post.topicClusterId ? <p className="news-meta-line">Topic cluster: {post.topicClusterId} | Information gain score: {post.informationGainScore} | Duplication score: {post.duplicationScore}</p> : null}
        </article>
      </section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">Related Products</p><h2>{copy.relatedTitle}</h2></div><div className="page-grid">{relatedProducts.map((product) => product ? <article className="content-card" key={product.slug}><img src={product.image} alt={product.title} /><div className="content-card-body"><h3>{product.title}</h3><p>{getProductSummary(product, locale)}</p><Link href={localizedPath(locale, `products/${product.category}/${product.slug}`)}>{copy.viewProduct}</Link></div></article> : null)}</div></section>
      <section className="band"><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>Solicitar cotizacion</Link></section>
    </>
  );
}

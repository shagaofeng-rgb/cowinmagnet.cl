import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { posts } from "@/data/blog";
import { Locale, localizedPath } from "@/data/site";
import Link from "next/link";

export const metadata = { title: "Blog" };

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Blog" }]} />
      <HeroBanner eyebrow="Blog" title="Recursos sobre separacion magnetica" summary="Articulos con tabla de contenido, productos relacionados y CTA de cotizacion." />
      <section className="band"><div className="page-grid">{posts.map((post) => <article className="content-card" key={post.slug}><div className="content-card-body"><h3>{post.title}</h3><p>{post.summary}</p><small>{post.date} | {post.author}</small><br /><Link href={localizedPath(locale, `blog/${post.slug}`)}>Leer articulo</Link></div></article>)}</div></section>
    </>
  );
}

import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { getPublishedPosts } from "@/data/blog";
import { Locale, localizedPath } from "@/data/site";
import Link from "next/link";

export const metadata = { title: "Blog" };

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const posts = await getPublishedPosts(locale);

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "News" }]} />
      <HeroBanner eyebrow="News" title="Noticias industriales de Sudamerica" summary="Resumimos fuentes externas relevantes y agregamos una lectura tecnica para mineria, reciclaje, cemento y separacion magnetica." />
      <section className="band">
        <div className="news-grid">
          {posts.map((post) => (
            <article className="news-card" key={post.slug}>
              {post.image ? <Image src={post.image} alt={post.title} width={720} height={430} unoptimized /> : null}
              <div className="news-card-body">
                <p className="eyebrow">{post.categoryTitle || "Industry News"}</p>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <small>{post.date} | {post.author}</small>
                {post.sourceUrl ? <small>Fuente: {post.sourceTitle || post.sourceDomain}</small> : null}
                <Link href={localizedPath(locale, `blog/${post.slug}`)}>Leer noticia</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { getPublishedPosts } from "@/data/blog";
import { Locale, localizedPath } from "@/data/site";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "en" ? "Industry News for Magnetic Separation in the Americas" : locale === "pt-br" ? "Noticias industriais de separacao magnetica nas Americas" : "Noticias industriales de separacion magnetica en Americas";
  const description = locale === "en"
    ? "Editorial briefs from cited external sources with Cowinmagnet technical analysis for mining, recycling, cement and magnetic separation buyers."
    : locale === "pt-br"
      ? "Resumos editoriais com fontes citadas e analise tecnica para mineracao, reciclagem, cimento e separacao magnetica."
      : "Resumimos fuentes externas relevantes y agregamos una lectura tecnica para mineria, reciclaje, cemento y separacion magnetica.";
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        "es-CL": "/es-cl/blog",
        es: "/es/blog",
        "pt-BR": "/pt-br/blog",
        en: "/en/blog",
        "x-default": "/es-cl/blog"
      }
    }
  };
}

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

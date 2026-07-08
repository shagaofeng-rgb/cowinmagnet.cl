import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { getPublishedPosts } from "@/data/blog";
import { Locale, localizedPath, t } from "@/data/site";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function displayImage(src = "") {
  return src || "/assets/markets/chile-copper-ore.jpg";
}

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
      canonical: `/${locale}/news`,
      languages: {
        "es-CL": "/es-cl/news",
        es: "/es/news",
        "pt-BR": "/pt-br/news",
        en: "/en/news",
        "x-default": "/es-cl/news"
      }
    }
  };
}

export default async function NewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const posts = await getPublishedPosts(locale);

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t(locale, "Noticias", "Noticias", "News") }]} />
      <HeroBanner
        eyebrow={t(locale, "Noticias", "Noticias", "News")}
        title={t(locale, "Noticias industriales de Sudamerica", "Noticias industriais da America do Sul", "Industrial news from South America")}
        summary={t(locale, "Resumimos fuentes externas relevantes y agregamos una lectura tecnica para mineria, reciclaje, cemento y separacion magnetica.", "Resumimos fontes externas relevantes e adicionamos uma leitura tecnica para mineracao, reciclagem, cimento e separacao magnetica.", "We summarize relevant cited sources and add a technical view for mining, recycling, cement and magnetic separation.")}
      />
      <section className="band">
        <div className="news-grid">
          {posts.map((post) => (
            <article className="news-card" key={post.slug}>
              {post.image ? <Image src={displayImage(post.image)} alt={post.title} width={720} height={430} unoptimized /> : null}
              <div className="news-card-body">
                <p className="eyebrow">{post.categoryTitle || "Industry News"}</p>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <small>{post.date} | {post.author}</small>
                {post.sourceUrl ? <small>{t(locale, "Fuente", "Fonte", "Source")}: {post.sourceTitle || post.sourceDomain}</small> : null}
                <Link href={localizedPath(locale, `news/${post.slug}`)}>{t(locale, "Leer noticia", "Ler noticia", "Read news")}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

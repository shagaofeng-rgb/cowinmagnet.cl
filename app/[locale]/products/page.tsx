import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { briefProductGroups, getBriefProductHref } from "@/data/brief";
import { productCopy } from "@/data/catalog";
import { Locale, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  return {
    title: copy.productCenterTitle,
    description: copy.productCenterSummary,
    alternates: localizedAlternates(locale, "products")
  };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = productCopy[locale] ?? productCopy["es-cl"];

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: copy.products }]} />
      <HeroBanner
        eyebrow={copy.products}
        title={t(locale, "Productos principales de separacion magnetica", "Produtos principais de separacao magnetica", "Main magnetic separation products")}
        summary={t(
          locale,
          "Una vista clara por familias: equipos suspendidos, separadores magneticos, reciclaje y componentes de filtracion.",
          "Uma visao clara por familias: equipamentos suspensos, separadores magneticos, reciclagem e componentes de filtracao.",
          "A clear view by family: suspended equipment, magnetic separators, recycling systems and filtration components."
        )}
        image="/assets/brief/rcyd-self-cleaning-permanent-magnet.jpg"
      />
      <section className="band brief-page">
        <div className="brief-intro">
          <p className="eyebrow">{t(locale, "Catalogo simple", "Catalogo simples", "Simple catalog")}</p>
          <h2>{t(locale, "Productos clave para cotizacion tecnica", "Produtos chave para cotacao tecnica", "Key products for technical quotation")}</h2>
          <p>{t(
            locale,
            "La seleccion final depende del material, ancho de cinta, capacidad, altura de instalacion, ambiente y energia disponible. Esta pagina deja solo las familias utiles para revisar rapido.",
            "A selecao final depende do material, largura da correia, capacidade, altura de instalacao, ambiente e energia disponivel. Esta pagina mostra somente as familias uteis para revisao rapida.",
            "Final selection depends on material, belt width, capacity, installation height, environment and available power. This page keeps the useful product families easy to scan."
          )}</p>
        </div>
        <div className="brief-stack">
          {briefProductGroups.map((group) => (
            <section className="brief-group" id={group.id} key={group.id}>
              <div className="brief-group-head">
                <p className="eyebrow">{group.products.length} {t(locale, "productos", "produtos", "products")}</p>
                <h2>{group.title[locale]}</h2>
                <p>{group.summary[locale]}</p>
              </div>
              <div className="brief-product-list">
                {group.products.map((product) => (
                  <article className="brief-product-row" key={product.model}>
                    <Image src={product.image} alt={`${product.model} ${product.title}`} width={260} height={190} />
                    <div>
                      <span>{product.model}</span>
                      <h3>{product.title}</h3>
                      <p>{product.summary}</p>
                    </div>
                    <Link className="text-link" href={getBriefProductHref(locale, product)}>
                      {product.href ? copy.viewProduct : copy.fullQuote}
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}

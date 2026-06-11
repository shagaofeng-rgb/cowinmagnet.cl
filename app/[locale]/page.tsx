import Link from "next/link";
import { HeroBanner } from "@/components/HeroBanner";
import { productCategories, industries, solutions, markets } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const base = (path = "") => localizedPath(locale, path);
  return (
    <>
      <HeroBanner eyebrow="Cowinmagnet LATAM" title="Equipos de Separacion Magnetica para Chile y Sudamerica" summary="Proveedor de soluciones magneticas y socio de exportacion para mineria, proteccion de cintas, eliminacion de hierro trampa y proyectos industriales." />
      <section className="band home-overview">
        <div className="section-heading home-heading">
          <p className="eyebrow">Products, industries and markets</p>
          <h2>Un solo acceso para revisar productos, aplicaciones y datos de seleccion.</h2>
          <p>La portada queda como resumen operativo. Cada bloque lleva a una pagina independiente con URL propia, contenido tecnico y formulario de cotizacion.</p>
        </div>
        <div className="home-layout">
          <article className="home-main-card">
            <div>
              <p className="eyebrow">Product center</p>
              <h3>Cinco familias sincronizadas con el sitio principal</h3>
              <p>Separadores suspendidos, equipos de separacion, deteccion, reciclaje, filtros magneticos y equipos de aplicacion industrial.</p>
            </div>
            <div className="home-product-list">
              {productCategories.map((category) => (
                <Link href={base(`products/${category.slug}`)} key={category.slug}>
                  <span>{category.title}</span>
                  <small>Ver categoria</small>
                </Link>
              ))}
            </div>
            <Link className="button primary" href={base("products")}>Ver todos los productos</Link>
          </article>

          <div className="home-side-grid">
            <article>
              <p className="eyebrow">Industries</p>
              <h3>Aplicaciones prioritarias</h3>
              <div className="home-link-row">
                {industries.slice(0, 4).map((item) => <Link href={base(`industries/${item.slug}`)} key={item.slug}>{item.title}</Link>)}
              </div>
              <Link className="text-link" href={base("industries")}>Ver industrias</Link>
            </article>
            <article>
              <p className="eyebrow">Markets</p>
              <h3>Mercados sudamericanos</h3>
              <div className="home-link-row">
                {markets.slice(0, 5).map((item) => <Link href={base(`markets/${item.slug}`)} key={item.slug}>{item.title}</Link>)}
              </div>
              <Link className="text-link" href={base("markets")}>Explorar mercados</Link>
            </article>
            <article>
              <p className="eyebrow">Solutions</p>
              <h3>Problemas comunes</h3>
              <div className="home-link-row">
                {solutions.slice(0, 4).map((item) => <Link href={base(`solutions/${item.slug}`)} key={item.slug}>{item.title}</Link>)}
              </div>
              <Link className="text-link" href={base("solutions")}>Ver soluciones</Link>
            </article>
            <article className="home-quote-card">
              <p className="eyebrow">Quote</p>
              <h3>Enviar datos para seleccion</h3>
              <p>Material, ancho de cinta, velocidad, altura, contaminante, voltaje y frecuencia.</p>
              <Link className="button primary" href={base("request-a-quote")}>Solicitar cotizacion</Link>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

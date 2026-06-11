import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HeroBanner } from "@/components/HeroBanner";
import { QuoteForm } from "@/components/QuoteForm";
import { productCategories, products } from "@/data/catalog";
import { Locale, localizedPath } from "@/data/site";

export function generateStaticParams() {
  return products.flatMap((product) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, category: product.category, productSlug: product.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params;
  const product = products.find((item) => item.slug === productSlug);
  return {
    title: product ? product.title : "Product",
    description: product?.summary
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: Locale; category: string; productSlug: string }> }) {
  const { locale, category: categorySlug, productSlug } = await params;
  const product = products.find((item) => item.category === categorySlug && item.slug === productSlug);
  const category = productCategories.find((item) => item.slug === categorySlug);
  if (!product || !category) notFound();
  const relatedProducts = products.filter((item) => item.category === categorySlug && item.slug !== product.slug).slice(0, 3);
  const technicalRows = [
    "Tipo de sistema magnetico",
    "Intensidad del campo",
    "Altura de suspension",
    "Ancho y velocidad de la cinta",
    "Espesor de la capa",
    "Tamano del material",
    "Instalacion transversal o en linea",
    "Limpieza manual o automatica",
    "Potencia del motor y electroiman",
    "Metodo de enfriamiento",
    "Voltaje y frecuencia",
    "Numero de fases",
    "Grado de proteccion",
    "Temperatura ambiente",
    "Altitud del sitio",
    "Dimensiones y peso",
    "Gabinete de control",
    "Opciones exteriores y anticorrosion"
  ];
  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: "Products", href: localizedPath(locale, "products") }, { label: category.title, href: localizedPath(locale, `products/${category.slug}`) }, { label: product.title }]} />
      <HeroBanner eyebrow="Product Detail" title={product.title} summary={product.summary} image={product.image} />
      <section className="band">
        <div className="geo-grid">
          <article><h3>Descripcion general</h3><p>{product.summary}</p></article>
          <article><h3>Caracteristicas principales</h3><ul>{product.features.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><h3>Aplicaciones principales</h3><ul>{product.applications.map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>
      <section className="band muted">
        <div className="section-heading">
          <p className="eyebrow">Product Images</p>
          <h2>Imagenes del producto</h2>
          <p>Imagen ilustrativa para revision local. Antes de produccion, sustituir por foto real verificada o mantener disclosure de ilustracion.</p>
        </div>
        <div className="page-grid">
          <article className="content-card"><img src={product.image} alt={`${product.title} main image`} /><div className="content-card-body"><h3>Vista principal</h3><p>Referencia visual para identificar la familia de equipo.</p></div></article>
          <article className="content-card"><img src={category.key === "components" ? "/assets/generated/product-magnetic-components.png" : "/assets/generated/latam-mining-overband.png"} alt={`${product.title} application image`} /><div className="content-card-body"><h3>Aplicacion</h3><p>Uso tipico en cintas, chancado, minerales, agregados o procesos industriales.</p></div></article>
          <article className="content-card"><img src="/assets/generated/application-cement-aggregates.png" alt={`${product.title} installation reference`} /><div className="content-card-body"><h3>Instalacion</h3><p>La posicion final se confirma con layout, altura, flujo y estructura disponible.</p></div></article>
        </div>
      </section>
      <section className="band">
        <div className="geo-grid">
          <article><h3>Principio de funcionamiento</h3><p>El equipo usa un campo magnetico para atraer o separar contaminantes ferrosos del flujo de material. La eficiencia depende de distancia, granulometria, velocidad, espesor de capa y propiedades del contaminante.</p></article>
          <article><h3>Opciones de instalacion</h3><p>Puede revisarse instalacion transversal, en linea, sobre chute o en punto de transferencia. La estructura, acceso de limpieza y seguridad se validan antes de cotizar.</p></article>
          <article><h3>Configuraciones opcionales</h3><p>Gabinete de control, proteccion exterior, tratamiento anticorrosion, autolimpieza, sensores, enfriamiento y tension/frecuencia se confirman por proyecto.</p></article>
        </div>
      </section>
      <section className="band muted">
        <div className="section-heading"><p className="eyebrow">Technical Parameters</p><h2>Parametros tecnicos a confirmar</h2><p>No se publican valores inventados. Estos campos definen la hoja tecnica y la cotizacion.</p></div>
        <table className="spec-table"><tbody>{technicalRows.map((item) => <tr key={item}><th>{item}</th><td>Confirmar con datos del proyecto</td></tr>)}</tbody></table>
      </section>
      <section className="band">
        <div className="geo-grid">
          <article><h3>Guia de seleccion</h3><p>Enviar material, tamano maximo, capacidad, ancho y velocidad de cinta, espesor de capa, altura de suspension, contaminante, altitud, temperatura, voltaje, frecuencia y fases.</p></article>
          <article><h3>Condiciones de operacion</h3><p>Polvo, humedad, corrosion, trabajo exterior, altitud, temperatura y regimen de operacion pueden cambiar la seleccion del sistema magnetico y gabinete.</p></article>
          <article><h3>Mantenimiento</h3><p>Revisar limpieza, banda autolimpiante, rodamientos, fijaciones, gabinete, cables y acumulacion de material segun plan operativo del sitio.</p></article>
        </div>
      </section>
      <section className="band muted">
        <div className="geo-grid">
          <article><h3>Repuestos</h3><p>Bandas, rodillos, rodamientos, raspadores, sensores, componentes electricos y piezas de desgaste se definen por modelo y ambiente.</p></article>
          <article><h3>Embalaje y envio</h3><p>El embalaje, puerto, dimensiones, peso, proteccion anticorrosion y documentacion de exportacion se confirman antes del despacho.</p></article>
          <article><h3>Descargas</h3><p>Use los cuestionarios descargables para preparar datos tecnicos antes de solicitar seleccion.</p><Link className="button light" href="/downloads/selection-questionnaire.txt">Descargar cuestionario</Link></article>
        </div>
      </section>
      <section className="band">
        <FAQAccordion items={[["Hay stock local?", "No se declara stock local sin evidencia."], ["Se puede adaptar OEM/ODM?", "Se puede coordinar segun alcance y validacion tecnica."], ["Que datos necesito?", "Material, cinta, altura, capacidad, contaminante y condiciones ambientales."]]} />
      </section>
      <section className="band muted">
        <div className="section-heading"><p className="eyebrow">Related</p><h2>Productos relacionados</h2></div>
        <div className="page-grid">{relatedProducts.map((item) => <article className="content-card" key={item.slug}><img src={item.image} alt={item.title} /><div className="content-card-body"><h3>{item.title}</h3><p>{item.summary}</p><Link href={localizedPath(locale, `products/${item.category}/${item.slug}`)}>Ver producto</Link></div></article>)}</div>
      </section>
      <section className="band">
        <div className="geo-grid">
          <article><h3>Industrias relacionadas</h3><p>Mineria, transportadores, cemento, agregados, reciclaje y manejo de graneles.</p><Link href={localizedPath(locale, "industries")}>Ver industrias</Link></article>
          <article><h3>Soluciones relacionadas</h3><p>Eliminacion de hierro trampa, proteccion de chancadores, proteccion de cintas y autolimpieza.</p><Link href={localizedPath(locale, "solutions")}>Ver soluciones</Link></article>
          <article><h3>Soporte tecnico</h3><p>Revise guias de seleccion, instalacion, mantenimiento y descargas.</p><Link href={localizedPath(locale, "technical-support")}>Ver soporte tecnico</Link></article>
        </div>
      </section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">Quote</p><h2>Formulario de cotizacion</h2></div><QuoteForm /></section>
      <section className="band"><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>Solicitar cotizacion completa</Link></section>
    </>
  );
}

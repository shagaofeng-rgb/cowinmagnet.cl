import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HeroBanner } from "@/components/HeroBanner";
import { QuoteForm } from "@/components/QuoteForm";
import { getCategoryDisplay, getProductSummary, productCategories, productCopy, products } from "@/data/catalog";
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
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  const categoryDisplay = getCategoryDisplay(category, locale);
  const productSummary = getProductSummary(product, locale);
  const gallery = product.imageGallery?.length ? product.imageGallery : [product.image];
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
      <Breadcrumbs locale={locale} items={[{ label: copy.products, href: localizedPath(locale, "products") }, { label: categoryDisplay.title, href: localizedPath(locale, `products/${category.slug}`) }, { label: product.title }]} />
      <HeroBanner eyebrow={copy.productDetail} title={product.title} summary={productSummary} image={product.image} />
      <section className="band">
        <div className="geo-grid">
          <article><h3>{copy.overview}</h3><p>{productSummary}</p></article>
          <article><h3>{copy.features}</h3><ul>{product.features.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><h3>{copy.applications}</h3><ul>{product.applications.map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>
      <section className="band muted">
        <div className="section-heading">
          <p className="eyebrow">{copy.images}</p>
          <h2>{copy.imagesTitle}</h2>
          <p>{copy.imagesText}</p>
        </div>
        <div className="page-grid">
          <article className="content-card"><img src={gallery[0]} alt={`${product.title} main image`} /><div className="content-card-body"><h3>{copy.mainView}</h3><p>{copy.mainViewText}</p></div></article>
          <article className="content-card"><img src={gallery[1] ?? gallery[0]} alt={`${product.title} gallery image`} /><div className="content-card-body"><h3>{copy.galleryView}</h3><p>{copy.galleryViewText}</p></div></article>
          <article className="content-card"><img src={gallery[2] ?? gallery[0]} alt={`${product.title} installation reference`} /><div className="content-card-body"><h3>{copy.installationView}</h3><p>{copy.installationViewText}</p></div></article>
        </div>
      </section>
      <section className="band">
        <div className="geo-grid">
          <article><h3>{copy.principle}</h3><p>{copy.principleText}</p></article>
          <article><h3>{copy.installation}</h3><p>{copy.installationText}</p></article>
          <article><h3>{copy.options}</h3><p>{copy.optionsText}</p></article>
        </div>
      </section>
      <section className="band muted">
        <div className="section-heading"><p className="eyebrow">{copy.technicalParameters}</p><h2>{copy.technicalParametersTitle}</h2><p>{copy.technicalParametersText}</p></div>
        <table className="spec-table"><tbody>{(product.parameters?.length ? product.parameters : technicalRows).map((item) => <tr key={item}><th>{item}</th><td>{copy.confirm}</td></tr>)}</tbody></table>
      </section>
      <section className="band">
        <div className="geo-grid">
          <article><h3>{copy.selectionGuide}</h3><p>{copy.selectionGuideText}</p></article>
          <article><h3>{copy.operatingConditions}</h3><p>{copy.operatingConditionsText}</p></article>
          <article><h3>{copy.maintenance}</h3><p>{copy.maintenanceText}</p></article>
        </div>
      </section>
      <section className="band muted">
        <div className="geo-grid">
          <article><h3>{copy.spares}</h3><p>{copy.sparesText}</p></article>
          <article><h3>{copy.packaging}</h3><p>{copy.packagingText}</p></article>
          <article><h3>{copy.downloads}</h3><p>{copy.downloadsText}</p><Link className="button light" href="/downloads/selection-questionnaire.txt">{copy.downloadQuestionnaire}</Link></article>
        </div>
      </section>
      <section className="band">
        <FAQAccordion items={copy.faq} />
      </section>
      <section className="band muted">
        <div className="section-heading"><p className="eyebrow">{copy.related}</p><h2>{copy.relatedTitle}</h2></div>
        <div className="page-grid">{relatedProducts.map((item) => <article className="content-card" key={item.slug}><img src={item.image} alt={item.title} /><div className="content-card-body"><h3>{item.title}</h3><p>{getProductSummary(item, locale)}</p><Link href={localizedPath(locale, `products/${item.category}/${item.slug}`)}>{copy.viewProduct}</Link></div></article>)}</div>
      </section>
      <section className="band">
        <div className="geo-grid">
          <article><h3>{copy.relatedIndustries}</h3><p>{copy.relatedIndustriesText}</p><Link href={localizedPath(locale, "industries")}>{copy.viewIndustries}</Link></article>
          <article><h3>{copy.relatedSolutions}</h3><p>{copy.relatedSolutionsText}</p><Link href={localizedPath(locale, "solutions")}>{copy.viewSolutions}</Link></article>
          <article><h3>{copy.technicalSupport}</h3><p>{copy.technicalSupportText}</p><Link href={localizedPath(locale, "technical-support")}>{copy.viewSupport}</Link></article>
        </div>
      </section>
      <section className="band muted"><div className="section-heading"><p className="eyebrow">{copy.quote}</p><h2>{copy.quoteTitle}</h2></div><QuoteForm locale={locale} /></section>
      <section className="band"><Link className="button primary" href={localizedPath(locale, "request-a-quote")}>{copy.fullQuote}</Link></section>
    </>
  );
}

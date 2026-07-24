import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HeroBanner } from "@/components/HeroBanner";
import { briefProductGroups } from "@/data/brief";
import { productCopy } from "@/data/catalog";
import { Locale, localizedPath, t } from "@/data/site";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

const familyLinks: Record<string, string> = {
  suspended: "products/suspended-self-unloading-iron-removers",
  separation: "products/magnetic-separation-equipment",
  recycling: "products/metal-detection-recycling-sorting",
  components: "products/magnetic-components-filters"
};

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = productCopy[locale] ?? productCopy["es-cl"];
  return { title: copy.productCenterTitle, description: copy.productCenterSummary, alternates: localizedAlternates(locale, "products") };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = productCopy[locale] ?? productCopy["es-cl"];

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: copy.products }]} />
      <HeroBanner
        eyebrow={copy.products}
        title={t(locale, "Cuatro familias para seleccionar el equipo correcto", "Quatro familias para selecionar o equipamento certo", "Four families to select the right equipment")}
        summary={t(locale, "Parta por la aplicacion. Cada familia mantiene sus fichas tecnicas y detalles disponibles sin sobrecargar esta pagina.", "Comece pela aplicacao. Cada familia mantem fichas tecnicas e detalhes disponiveis sem sobrecarregar esta pagina.", "Start with the application. Each family keeps its technical pages available without overloading this page.")}
        image="/assets/brief/south-africa/products/rcyd-permanent-self-cleaning.jpg"
      />
      <section className="band brief-page compact-catalog">
        <div className="brief-intro">
          <p className="eyebrow">{t(locale, "Catalogo esencial", "Catalogo essencial", "Essential catalog")}</p>
          <h2>{t(locale, "Elija una familia y revise solo lo necesario", "Escolha uma familia e revise somente o necessario", "Choose a family and review only what is needed")}</h2>
          <p>{t(locale, "Los modelos, fichas y opciones de instalacion siguen disponibles dentro de cada familia. Para recomendar una configuracion, revisamos material, capacidad y condiciones de operacion.", "Os modelos, fichas e opcoes de instalacao continuam disponiveis dentro de cada familia. Para recomendar uma configuracao, analisamos material, capacidade e condicoes de operacao.", "Models, datasheets and installation options remain available inside each family. To recommend a configuration, we review material, capacity and operating conditions.")}</p>
        </div>
        <div className="family-grid">
          {briefProductGroups.map((group) => (
            <Link className="family-card" href={localizedPath(locale, familyLinks[group.id])} key={group.id}>
              <Image src={group.image} alt={group.title[locale]} width={720} height={520} />
              <div>
                <span>{group.products.length} {t(locale, "modelos clave", "modelos principais", "core models")}</span>
                <h2>{group.title[locale]}</h2>
                <p>{group.summary[locale]}</p>
                <strong>{t(locale, "Ver familia", "Ver familia", "View family")}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="band muted selection-cta">
        <div><p className="eyebrow">{t(locale, "Seleccion tecnica", "Selecao tecnica", "Technical selection")}</p><h2>{t(locale, "No necesita completar todos los datos para empezar", "Voce nao precisa preencher todos os dados para comecar", "You do not need every detail to start")}</h2><p>{t(locale, "Indique material, capacidad aproximada, pais y el equipo o problema que desea resolver. El resto se confirma con su equipo tecnico.", "Informe material, capacidade aproximada, pais e o equipamento ou problema que deseja resolver. O restante e confirmado com sua equipe tecnica.", "Share the material, approximate capacity, country and the equipment or problem to solve. The rest is confirmed with your technical team.")}</p></div>
        <Link className="button primary" href={localizedPath(locale, "request-a-quote")}>{copy.fullQuote}</Link>
      </section>
    </>
  );
}

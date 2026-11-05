"use client";

import { usePathname } from "next/navigation";
import { Interior, InteriorLink, InteriorSection } from "@/components/Interior";
import { InteriorIcon } from "@/components/InteriorIcon";
import { defaultLocale, locales, localizedPath, t, type Locale } from "@/data/site";

export default function NotFound() {
  const requested = usePathname()?.split("/")[1] as Locale | undefined;
  const locale = requested && locales.includes(requested) ? requested : defaultLocale;
  return <Interior locale={locale}>
    <InteriorSection><div className="cl-hero">
      <div><p className="kicker">Error 404</p>
        <h1>{t(locale, "No encontramos esta página", "Não encontramos esta página", "We couldn't find this page")}</h1>
        <p className="lead">{t(locale, "Use el buscador o explore nuestro catálogo de equipos.", "Use a busca ou explore nosso catálogo de equipamentos.", "Use search or browse our equipment catalog.")}</p>
        <div className="actions">
          <InteriorLink variant="primary" href={localizedPath(locale, "products")}>{t(locale, "Ir al catálogo", "Ir ao catálogo", "Browse catalog")}</InteriorLink>
          <InteriorLink variant="secondary" href={localizedPath(locale, "search")}>{t(locale, "Buscar", "Buscar", "Search")}</InteriorLink>
        </div>
      </div>
      <div className="map"><InteriorIcon name="route" /><h2>{t(locale, "¿Busca un modelo?", "Procura um modelo?", "Looking for a model?")}</h2>
        <p>{t(locale, "Busque por nombre, familia o código del equipo.", "Busque por nome, família ou código do equipamento.", "Search by equipment name, family or code.")}</p>
      </div>
    </div></InteriorSection>
  </Interior>;
}

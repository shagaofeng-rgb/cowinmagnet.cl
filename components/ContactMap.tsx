"use client";

import { useState } from "react";
import { InteriorIcon } from "@/components/InteriorIcon";
import { siteConfig, t, type Locale } from "@/data/site";

export function ContactMap({ locale }: { locale: Locale }) {
  const [showMap, setShowMap] = useState(false);
  const label = t(locale, "Ubicación de la empresa", "Localização da empresa", "Company location");
  return <section className="map">
    <InteriorIcon name="map-pin" />
    <h2>{label}</h2><p>{siteConfig.company}</p>
    <address>{siteConfig.companyAddress}</address>
    <div className="actions">
      {!showMap ? <button className="btn alt" type="button" onClick={() => setShowMap(true)}>{t(locale, "Cargar mapa", "Carregar mapa", "Load map")}</button> : null}
      <a className="quiet" href={siteConfig.companyMapUrl} target="_blank" rel="noopener noreferrer">{t(locale, "Abrir en Google Maps", "Abrir no Google Maps", "Open in Google Maps")} <InteriorIcon name="arrow-right" /></a>
    </div>
    {showMap ? <iframe title={label} src={"https://www.google.com/maps?q=" + siteConfig.companyMapCoordinates + "&z=17&output=embed"} referrerPolicy="no-referrer-when-downgrade" /> : null}
  </section>;
}

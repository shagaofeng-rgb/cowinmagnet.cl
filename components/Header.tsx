"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Locale, localeLabels, locales, localizedPath, siteConfig, uiText } from "@/data/site";
import { getCategoryDisplay, productCategories } from "@/data/catalog";

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const base = (path = "") => localizedPath(locale, path);
  const copy = uiText[locale] ?? uiText["es-cl"];
  const featuredProducts = [
    {
      href: "products/suspended-self-unloading-iron-removers/rcyd-type-permanent-magnet-self-dumping-iron-remover",
      title: "RCYD permanent iron remover",
      text: locale === "pt-br" ? "Remocao autolimpante de ferro tramp sobre correias." : locale === "en" ? "Self-unloading tramp iron removal above conveyor belts." : "Retiro autolimpiante de hierro trampa sobre cintas."
    },
    {
      href: "products/magnetic-separation-equipment/wet-drum-magnetic-separator",
      title: "Wet Drum Magnetic Separator",
      text: locale === "pt-br" ? "Separacao magnetica umida para minerais e polpas." : locale === "en" ? "Wet mineral and slurry magnetic separation." : "Separacion magnetica humeda para minerales y pulpas."
    },
    {
      href: "products/metal-detection-recycling-sorting/permanent-overband-magnetic-separator",
      title: "Permanent Overband Magnetic Separator",
      text: locale === "pt-br" ? "Captura continua de metais ferrosos para reciclagem e granels." : locale === "en" ? "Continuous ferrous metal capture for recycling and bulk handling." : "Captura continua de metales ferrosos para reciclaje y graneles."
    }
  ];
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMega(null);
        setMobileOpen(false);
      }
    }
    function onPointer(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMega(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, []);

  function switchLocale(target: Locale) {
    const parts = pathname.split("/").filter(Boolean);
    parts[0] = target;
    return `/${parts.join("/")}`;
  }

  return (
    <header className="site-header" ref={headerRef}>
      <Link className="brand" href={base()}>
        <span className="brand-logo-wrap">
          <Image src="/assets/logo.jpg" alt={siteConfig.brand} width={48} height={48} />
        </span>
        <span className="brand-copy">
          <strong>Cowinmagnet.cl</strong>
          <small>Chile & LATAM</small>
        </span>
      </Link>
      <button className="menu-button" type="button" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
        Menu
      </button>
      <nav id="site-nav" className={`site-nav ${mobileOpen ? "open" : ""}`} aria-label="Main navigation">
        <Link className={pathname === base() ? "active" : ""} href={base()}>{copy.nav.home}</Link>
        <div className={`nav-item has-mega ${mega === "products" ? "mega-open" : ""}`} onMouseEnter={() => setMega("products")} onMouseLeave={() => setMega(null)}>
          <button className="nav-trigger" type="button" aria-expanded={mega === "products"} onClick={() => setMega(mega === "products" ? null : "products")}>
            {copy.nav.products}
          </button>
          <div className="mega-menu" role="region" aria-label="Products">
            <div className="mega-feature">
              <span className="eyebrow">{copy.nav.productCenter}</span>
              <h3>{copy.nav.productTitle}</h3>
              <p>{copy.nav.productText}</p>
              <Link className="mega-cta" href={base("products")}>{copy.nav.viewProducts}</Link>
            </div>
            <div className="mega-columns">
              <div>
                <h4>{copy.nav.categories}</h4>
                {productCategories.map((category) => (
                  <Link key={category.slug} href={base(`products/${category.slug}`)}>{getCategoryDisplay(category, locale).title}</Link>
                ))}
              </div>
              <div>
                <h4>{copy.nav.buyerPaths}</h4>
                {featuredProducts.map((item) => (
                  <Link className="mega-rich-link" key={item.href} href={base(item.href)}>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </Link>
                ))}
              </div>
              <div>
                <h4>{copy.nav.beforeQuote}</h4>
                <p className="mega-note">{copy.nav.beforeQuoteText}</p>
                <Link href={base("request-a-quote")}>{copy.nav.sendRequirement}</Link>
              </div>
            </div>
          </div>
        </div>

        <Link className={pathname === base("news") ? "active" : ""} href={base("news")}>{copy.nav.news}</Link>
        <Link className={pathname === base("about") ? "active" : ""} href={base("about")}>{copy.nav.about}</Link>

        <div className="language-switcher">
          <button className="nav-trigger" type="button" aria-label="Language" onClick={() => setMega(mega === "lang" ? null : "lang")}>
            {localeLabels[locale]}
          </button>
          <div className={`language-menu ${mega === "lang" ? "open" : ""}`}>
            {locales.map((item) => (
              <Link key={item} href={switchLocale(item)}>{localeLabels[item]}</Link>
            ))}
          </div>
        </div>
        <Link className="quote-link" href={base("request-a-quote")}>{copy.nav.quote}</Link>
      </nav>
    </header>
  );
}

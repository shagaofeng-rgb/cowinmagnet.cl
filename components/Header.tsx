"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Locale, localeLabels, locales, localizedPath, siteConfig, t, uiText } from "@/data/site";
import { InteriorIcon } from "@/components/InteriorIcon";

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const base = (path = "") => localizedPath(locale, path);
  const copy = uiText[locale] ?? uiText["es-cl"];

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
        setLanguageOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setLanguageOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLanguageOpen(false);
  }, [pathname]);

  function switchLocale(target: Locale) {
    const parts = pathname.split("/").filter(Boolean);
    parts[0] = target;
    return `/${parts.join("/")}`;
  }

  function rememberLocale(target: Locale) {
    document.cookie = `cowinmagnet_locale=${target}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  const links = [
    { href: "", label: copy.nav.home },
    { href: "products", label: copy.nav.products },
    { href: "industries", label: copy.nav.industries },
    { href: "about", label: copy.nav.about },
    { href: "news", label: copy.nav.news },
    { href: "contact", label: locale === "en" ? "Contact" : locale === "pt-br" ? "Contato" : "Contacto" }
  ];

  if (pathname.startsWith(base() + "/")) {
    const search = t(locale, "Buscar", "Buscar", "Search");
    const language = t(locale, "Idioma", "Idioma", "Language");
    const navigation = [
      ["products", copy.nav.products], ["industries", copy.nav.industries],
      ["solutions", copy.nav.solutions], ["markets", copy.nav.markets],
      ["news", copy.nav.news], ["blog", "Blog"], ["contact", links.at(-1)!.label]
    ];
    return <header className="cl-site-header" ref={headerRef}><div className="cl-nav-shell">
      <Link className="cl-logo" href={base()} aria-label={siteConfig.brand + " · " + copy.nav.home}>
        <Image src="/assets/cowinmagnet-logo.png" alt="" width={39} height={34} priority />Cowinmagnet
      </Link>
      <nav id="cl-site-nav" className={"cl-menu" + (mobileOpen ? " is-open" : "")} aria-label={t(locale, "Menú principal", "Menu principal", "Main navigation")}>
        {navigation.map(([path, label]) => <Link key={path} href={base(path)} aria-current={pathname === base(path) ? "page" : pathname.startsWith(base(path) + "/") ? "location" : undefined}>{label}</Link>)}
        <Link href={base("search")} className="cl-mobile-search">{search}</Link>
      </nav>
      <div className="cl-header-actions">
        <Link className="cl-search" href={base("search")} aria-label={search}><InteriorIcon name="search" /></Link>
        <div className="cl-language">
          <button type="button" aria-label={language + ": " + localeLabels[locale]} aria-expanded={languageOpen} aria-controls="cl-language-menu" onClick={() => setLanguageOpen((open) => !open)}>{locale.toUpperCase()}</button>
          <div className="cl-languages" id="cl-language-menu" hidden={!languageOpen}>
            {locales.map((item) => <Link key={item} href={switchLocale(item)} onClick={() => { rememberLocale(item); setLanguageOpen(false); }}>{localeLabels[item]}</Link>)}
          </div>
        </div>
        <Link className="cl-quote" href={base("request-a-quote")}>{copy.nav.quote}</Link>
        <button className="cl-mobile-toggle" type="button" aria-controls="cl-site-nav" aria-expanded={mobileOpen} aria-label={t(locale, "Menú", "Menu", "Menu")} onClick={() => setMobileOpen((open) => !open)}><InteriorIcon name="menu-2" /></button>
      </div>
    </div></header>;
  }

  return (
    <header className={`site-header site-header-compact ${mobileOpen ? "mobile-open" : ""}`} ref={headerRef}>
      <Link className="brand" href={base()} aria-label={`${siteConfig.brand} home`}>
        <span className="brand-logo-wrap"><Image src="/assets/cowinmagnet-logo.png" alt="" width={48} height={48} priority /></span>
        <span className="brand-copy"><strong>Cowinmagnet.cl</strong><small>Chile & LATAM</small></span>
      </Link>
      <button className="menu-button" type="button" aria-controls="site-nav" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
        <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
        <span>Menu</span>
      </button>
      <nav id="site-nav" className={`site-nav site-nav-compact ${mobileOpen ? "open" : ""}`} aria-label="Main navigation">
        {links.map((item) => (
          <Link className={pathname === base(item.href) ? "active" : ""} href={base(item.href)} key={item.href}>{item.label}</Link>
        ))}
        <div className="language-switcher">
          <button className="nav-trigger" type="button" aria-label="Language" aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}>{localeLabels[locale]}</button>
          <div className={`language-menu ${languageOpen ? "open" : ""}`}>
            {locales.map((item) => <Link key={item} href={switchLocale(item)} onClick={() => rememberLocale(item)}>{localeLabels[item]}</Link>)}
          </div>
        </div>
        <Link className="quote-link" href={base("request-a-quote")}>{copy.nav.quote}</Link>
      </nav>
    </header>
  );
}

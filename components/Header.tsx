"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Locale, localeLabels, locales, localizedPath, siteConfig, uiText } from "@/data/site";

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

  const links = [
    { href: "", label: copy.nav.home },
    { href: "products", label: copy.nav.products },
    { href: "industries", label: copy.nav.industries },
    { href: "about", label: copy.nav.about },
    { href: "news", label: copy.nav.news },
    { href: "contact", label: locale === "en" ? "Contact" : locale === "pt-br" ? "Contato" : "Contacto" }
  ];

  return (
    <header className="site-header site-header-compact" ref={headerRef}>
      <Link className="brand" href={base()} aria-label={`${siteConfig.brand} home`}>
        <span className="brand-logo-wrap"><Image src="/assets/logo.jpg" alt="" width={48} height={48} priority /></span>
        <span className="brand-copy"><strong>Cowinmagnet.cl</strong><small>Chile & LATAM</small></span>
      </Link>
      <button className="menu-button" type="button" aria-controls="site-nav" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>Menu</button>
      <nav id="site-nav" className={`site-nav site-nav-compact ${mobileOpen ? "open" : ""}`} aria-label="Main navigation">
        {links.map((item) => (
          <Link className={pathname === base(item.href) ? "active" : ""} href={base(item.href)} key={item.href}>{item.label}</Link>
        ))}
        <div className="language-switcher">
          <button className="nav-trigger" type="button" aria-label="Language" aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}>{localeLabels[locale]}</button>
          <div className={`language-menu ${languageOpen ? "open" : ""}`}>
            {locales.map((item) => <Link key={item} href={switchLocale(item)}>{localeLabels[item]}</Link>)}
          </div>
        </div>
        <Link className="quote-link" href={base("request-a-quote")}>{copy.nav.quote}</Link>
      </nav>
    </header>
  );
}

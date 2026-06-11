"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Locale, localeLabels, locales, localizedPath, siteConfig } from "@/data/site";
import { industries, productCategories, solutions } from "@/data/catalog";

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const base = (path = "") => localizedPath(locale, path);

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
        <Link className={pathname === base() ? "active" : ""} href={base()}>Home</Link>
        <div className={`nav-item has-mega ${mega === "products" ? "mega-open" : ""}`} onMouseEnter={() => setMega("products")} onMouseLeave={() => setMega(null)}>
          <button className="nav-trigger" type="button" aria-expanded={mega === "products"} onClick={() => setMega(mega === "products" ? null : "products")}>
            Products
          </button>
          <div className="mega-menu" role="region" aria-label="Products">
            <div className="mega-feature">
              <span className="eyebrow">Product Center</span>
              <h3>Magnetic separation equipment for South America</h3>
              <p>Browse product categories, then open a real product page with selection and installation layers.</p>
              <Link className="mega-cta" href={base("products")}>View products</Link>
            </div>
            <div className="mega-columns">
              <div>
                <h4>Categories</h4>
                {productCategories.map((category) => (
                  <Link key={category.slug} href={base(`products/${category.slug}`)}>{category.title}</Link>
                ))}
              </div>
              <div>
                <h4>Popular pages</h4>
                <Link href={base("products/suspended-self-unloading-iron-removers/rcyd-type-permanent-magnet-self-dumping-iron-remover")}>RCYD permanent iron remover</Link>
                <Link href={base("products/magnetic-separation-equipment/wet-drum-magnetic-separator")}>Wet Drum Magnetic Separator</Link>
                <Link href={base("products/metal-detection-recycling-sorting/permanent-overband-magnetic-separator")}>Permanent Overband Magnetic Separator</Link>
              </div>
            </div>
          </div>
        </div>

        <div className={`nav-item has-mega ${mega === "applications" ? "mega-open" : ""}`} onMouseEnter={() => setMega("applications")} onMouseLeave={() => setMega(null)}>
          <button className="nav-trigger" type="button" aria-expanded={mega === "applications"} onClick={() => setMega(mega === "applications" ? null : "applications")}>
            Applications
          </button>
          <div className="mega-menu mega-compact" role="region" aria-label="Applications">
            <div className="mega-feature">
              <span className="eyebrow">Applications</span>
              <h3>Industries, solutions and technical support</h3>
              <p>One place for mining applications, conveyor protection, tramp iron removal and selection guidance.</p>
              <Link className="mega-cta" href={base("industries")}>View applications</Link>
            </div>
            <div className="mega-columns">
              <div>
                <h4>Industries</h4>
                {industries.slice(0, 5).map((item) => (
                  <Link key={item.slug} href={base(`industries/${item.slug}`)}>{item.title}</Link>
                ))}
              </div>
              <div>
                <h4>Solutions</h4>
                {solutions.slice(0, 5).map((item) => (
                  <Link key={item.slug} href={base(`solutions/${item.slug}`)}>{item.title}</Link>
                ))}
                <Link href={base("technical-support")}>Technical Support</Link>
              </div>
            </div>
          </div>
        </div>

        <Link className={pathname === base("markets") ? "active" : ""} href={base("markets")}>Markets</Link>
        <Link className={pathname === base("blog") ? "active" : ""} href={base("blog")}>News</Link>
        <div className={`nav-item has-mega ${mega === "company" ? "mega-open" : ""}`} onMouseEnter={() => setMega("company")} onMouseLeave={() => setMega(null)}>
          <button className="nav-trigger" type="button" aria-expanded={mega === "company"} onClick={() => setMega(mega === "company" ? null : "company")}>
            Company
          </button>
          <div className="mega-menu mega-company" role="region" aria-label="Company">
            <div className="mega-feature">
              <span className="eyebrow">Company</span>
              <h3>Cowinmagnet Chile and South America</h3>
              <p>Export partner and technical support for magnetic separation equipment projects.</p>
            </div>
            <div className="mega-columns">
              <div>
                <h4>About</h4>
                <Link href={base("about")}>About Us</Link>
                <Link href={base("downloads")}>Downloads</Link>
                <Link href={base("search")}>Search</Link>
              </div>
              <div>
                <h4>Contact</h4>
                <Link href={base("contact")}>Contact</Link>
                <Link href={base("request-a-quote")}>Request a Quote</Link>
              </div>
            </div>
          </div>
        </div>

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
        <Link className="quote-link" href={base("request-a-quote")}>Request a Quote</Link>
      </nav>
    </header>
  );
}

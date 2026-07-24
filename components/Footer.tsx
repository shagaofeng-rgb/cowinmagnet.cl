import Link from "next/link";
import Image from "next/image";
import { Locale, localizedPath, siteConfig, uiText } from "@/data/site";

export function Footer({ locale }: { locale: Locale }) {
  const base = (path = "") => localizedPath(locale, path);
  const copy = uiText[locale] ?? uiText["es-cl"];
  return (
    <>
      <footer className="footer" id="footer">
        <div className="footer-cta">
          <div>
            <span className="eyebrow">{copy.footer.quoteSupport}</span>
            <h2>{copy.footer.cta}</h2>
          </div>
          <div className="footer-cta-actions">
            <Link className="button primary" href={base("request-a-quote")}>{copy.footer.quote}</Link>
            <a className="button light" href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer nofollow">WhatsApp</a>
          </div>
        </div>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="footer-brand-mark" href={base()}>
              <Image src="/assets/logo.jpg" alt="Cowinmagnet" width={44} height={44} />
              <span>COWIN MAGNET LATAM</span>
            </Link>
            <p>{copy.footer.description}</p>
          </div>
          <div className="footer-column">
            <h3>{copy.footer.explore}</h3>
            <ul>
              <li><Link href={base("products")}>{copy.nav.products}</Link></li>
              <li><Link href={base("industries")}>{copy.nav.industries}</Link></li>
              <li><Link href={base("about")}>{copy.nav.about}</Link></li>
              <li><Link href={base("news")}>{copy.nav.news}</Link></li>
              <li><Link href={base("contact")}>{locale === "en" ? "Contact" : locale === "pt-br" ? "Contato" : "Contacto"}</Link></li>
            </ul>
          </div>
          <div className="footer-column footer-contact-card">
            <h3>{copy.footer.contacts}</h3>
            <p className="footer-contact-line">{siteConfig.company}</p>
            <a className="footer-contact-line" href={`tel:+${siteConfig.whatsapp}`}>+86 156 6513 5205</a>
            <a className="footer-contact-line" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>2026 {siteConfig.company}</span>
          <span>{siteConfig.siteId} | cowinmagnet.cl</span>
        </div>
      </footer>
      <a href={`https://wa.me/${siteConfig.whatsapp}`} className="whatsapp-float" target="_blank" rel="noopener noreferrer nofollow" aria-label="Contact Cowinmagnet on WhatsApp">WA</a>
    </>
  );
}

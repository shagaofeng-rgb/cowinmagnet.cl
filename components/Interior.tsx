import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { InteriorIcon, type InteriorIconName } from "@/components/InteriorIcon";
import { localizedPath, siteConfig, t, type Locale } from "@/data/site";

export type PageQuery = Record<string, string | string[] | undefined>;
export function queryValue(query: PageQuery, key: string) {
  const value = query[key];
  return typeof value === "string" ? value : value?.[0] || "";
}

export function Interior({ locale, children, showFooter = true }: { locale: Locale; children: ReactNode; showFooter?: boolean }) {
  return <div className="cl-interior">
    {children}
    {showFooter ? <footer className="cl-footer"><div className="wrap">
      <b>Cowinmagnet LATAM</b>
      <div className="actions">
        <InteriorLink href={localizedPath(locale, "about")}>{t(locale, "Empresa", "Empresa", "Company")}</InteriorLink>
        <InteriorLink href={localizedPath(locale, "technical-support")}>{t(locale, "Soporte", "Suporte", "Support")}</InteriorLink>
        <InteriorLink href={localizedPath(locale, "downloads")}>{t(locale, "Descargas", "Downloads", "Downloads")}</InteriorLink>
        <a href={"mailto:" + siteConfig.email}>{siteConfig.email}</a>
      </div>
    </div></footer> : null}
  </div>;
}

export function InteriorLink({ href, children, variant = "quiet" }: { href: string; children: ReactNode; variant?: "quiet" | "primary" | "secondary" }) {
  return <Link href={href} className={variant === "quiet" ? "quiet" : variant === "secondary" ? "btn alt" : "btn"}>
    {children}{variant === "quiet" ? <InteriorIcon name="arrow-right" /> : null}
  </Link>;
}

export function Intro({ title, summary }: { title: string; summary?: string }) {
  return <section className="intro"><div className="wrap"><h1>{title}</h1>{summary ? <p className="lead">{summary}</p> : null}</div></section>;
}

export function InteriorImage({ src, alt, className, priority = false, sizes = "(max-width: 760px) 100vw, 50vw" }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string }) {
  return <Image src={src} alt={alt} className={className} width={960} height={600} sizes={sizes} preload={priority} unoptimized={/^https?:\/\//i.test(src)} />;
}

export function InteriorHero({ title, summary, image, caption, action, fit = false }: { title: string; summary: string; image: string; caption?: string; action?: ReactNode; fit?: boolean }) {
  return <section className="wrap cl-hero">
    <div><h1>{title}</h1><p className="lead">{summary}</p>{action}</div>
    <figure>
      <InteriorImage src={image} alt={caption ? "" : title} className={fit ? "market-map" : undefined} priority />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  </section>;
}

export function InteriorSection({ children, tinted = false, className = "" }: { children: ReactNode; tinted?: boolean; className?: string }) {
  return <section className={"section " + (tinted ? "tinted " : "") + className}><div className="wrap">{children}</div></section>;
}

export function InteriorRow({ icon, title, summary, action }: { icon: InteriorIconName; title: ReactNode; summary?: ReactNode; action?: ReactNode }) {
  return <div className="row"><InteriorIcon name={icon} /><div><h3>{title}</h3>{summary ? <p>{summary}</p> : null}</div>{action}</div>;
}

export function InteriorCard({ image, title, summary, href, label, meta, equipment = false }: { image?: string; title: string; summary?: string; href: string; label: string; meta?: ReactNode; equipment?: boolean }) {
  return <article className="card">
    {image ? <div className={"card-img" + (equipment ? " equipment" : "")}><InteriorImage src={image} alt={title} sizes="(max-width: 760px) 50vw, 32vw" /></div> : null}
    <div className="card-body">{meta ? <div className="meta">{meta}</div> : null}<h3>{title}</h3>{summary ? <p>{summary}</p> : null}
      <Link href={href} className="quiet" aria-label={label + ": " + title}>{label}<InteriorIcon name="arrow-right" /></Link>
    </div>
  </article>;
}

export function solutionIcon(slug: string): InteriorIconName {
  if (/recuperacion/.test(slug)) return "recycle";
  if (/chancadores/.test(slug)) return "shield-check";
  if (/cintas/.test(slug)) return "route";
  if (/mineria|altitud/.test(slug)) return "pick";
  if (/polvoriento/.test(slug)) return "filter";
  if (/limpieza/.test(slug)) return "settings";
  return "magnet";
}

export const mineIllustration = "/assets/interior/mine-scene.jpg";

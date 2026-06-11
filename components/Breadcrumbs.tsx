import Link from "next/link";
import { Locale, localizedPath, uiText } from "@/data/site";

export function Breadcrumbs({ locale, items }: { locale: Locale; items: Array<{ label: string; href?: string }> }) {
  const copy = uiText[locale] ?? uiText["es-cl"];
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link href={localizedPath(locale)}>{copy.nav.home}</Link>
      {items.map((item) => (
        <span key={item.label}>
          / {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
        </span>
      ))}
    </nav>
  );
}

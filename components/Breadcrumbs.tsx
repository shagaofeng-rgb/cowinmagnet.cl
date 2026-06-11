import Link from "next/link";
import { Locale, localizedPath } from "@/data/site";

export function Breadcrumbs({ locale, items }: { locale: Locale; items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link href={localizedPath(locale)}>Home</Link>
      {items.map((item) => (
        <span key={item.label}>
          / {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
        </span>
      ))}
    </nav>
  );
}

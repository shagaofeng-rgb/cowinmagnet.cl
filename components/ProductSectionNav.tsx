"use client";

import { useEffect, useState } from "react";

type Item = { id: string; label: string };

export function ProductSectionNav({ items }: { items: Item[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter((item): item is HTMLElement => Boolean(item));
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveId(visible.target.id);
    }, { rootMargin: "-28% 0px -62% 0px", threshold: [0.1, 0.25, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return <nav className="pd-section-nav" aria-label="Secciones del producto"><div className="pd-shell">
    {items.map((item) => <a className={activeId === item.id ? "is-active" : ""} href={`#${item.id}`} key={item.id} aria-current={activeId === item.id ? "location" : undefined}>{item.label}</a>)}
  </div></nav>;
}

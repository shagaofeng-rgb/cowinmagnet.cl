"use client";

import { useSearchParams } from "next/navigation";
import { type KeyboardEvent, type ReactNode, useId } from "react";

type ProductTab = { id: string; label: string; content: ReactNode };

function selectTab(tab: string) {
  const url = new URL(window.location.href);
  if (tab === "overview") url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  if (url.href !== window.location.href) window.history.pushState(null, "", url);
}

export function ProductSpecButton({ children }: { children: ReactNode }) {
  return <button type="button" className="btn alt" onClick={() => selectTab("specifications")}>{children}</button>;
}

export function ProductContentTabs({ tabs, label }: { tabs: ProductTab[]; label: string }) {
  const requested = useSearchParams().get("tab");
  const active = tabs.find((tab) => tab.id === requested)?.id ?? tabs[0].id;
  const uid = useId();
  const tabId = (id: string) => uid + "-tab-" + id;
  const panelId = (id: string) => uid + "-panel-" + id;

  function onArrow(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    const id = tabs[next].id;
    selectTab(id);
    document.getElementById(tabId(id))?.focus({ preventScroll: true });
  }

  return <section className="wrap">
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => <button key={tab.id} id={tabId(tab.id)} type="button" role="tab"
        data-product-tab={tab.id} aria-selected={active === tab.id} aria-controls={panelId(tab.id)}
        tabIndex={active === tab.id ? 0 : -1} onClick={() => selectTab(tab.id)} onKeyDown={(event) => onArrow(event, index)}>{tab.label}</button>)}
    </div>
    {tabs.map((tab) => <div key={tab.id} id={panelId(tab.id)} className="product-panel"
      role="tabpanel" aria-labelledby={tabId(tab.id)} hidden={active !== tab.id} tabIndex={0}>{tab.content}</div>)}
  </section>;
}

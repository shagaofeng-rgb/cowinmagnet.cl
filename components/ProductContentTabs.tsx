"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useId, useState } from "react";

export type ProductContentTab = {
  id: string;
  label: string;
  content: ReactNode;
};

export function ProductContentTabs({ tabs }: { tabs: ProductContentTab[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const initial = tabs.some((tab) => tab.id === searchParams.get("tab")) ? String(searchParams.get("tab")) : tabs[0]?.id;
  const [active, setActive] = useState(initial);
  const labelId = useId();

  useEffect(() => {
    const requested = searchParams.get("tab");
    if (tabs.some((tab) => tab.id === requested)) setActive(String(requested));
  }, [searchParams, tabs]);

  function select(id: string) {
    setActive(id);
    const query = new URLSearchParams(searchParams.toString());
    if (id === tabs[0]?.id) query.delete("tab");
    else query.set("tab", id);
    const suffix = query.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }

  return <section className="pd-content-tabs" aria-labelledby={labelId}>
    <div className="pd-shell">
      <p id={labelId} className="pd-eyebrow">PRODUCT INFORMATION</p>
      <div className="pd-tab-list" role="tablist" aria-label="Product information sections">
        {tabs.map((tab) => <button key={tab.id} id={`tab-${tab.id}`} type="button" role="tab" aria-selected={active === tab.id} aria-controls={`panel-${tab.id}`} onClick={() => select(tab.id)}>{tab.label}</button>)}
      </div>
    </div>
    {tabs.map((tab) => <div key={tab.id} id={`panel-${tab.id}`} className="pd-tab-panel" role="tabpanel" aria-labelledby={`tab-${tab.id}`} hidden={active !== tab.id}>{tab.content}</div>)}
  </section>;
}

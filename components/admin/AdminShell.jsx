"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import AdminLiveStatus from "@/components/admin/AdminLiveStatus";

const text = {
  brand: "\u540e\u53f0",
  navLabel: "\u540e\u53f0\u4e3b\u5bfc\u822a",
  account: "\u5f53\u524d\u8d26\u53f7",
  logout: "\u9000\u51fa\u767b\u5f55"
};

const links = [
  { href: "/admin", label: "\u6570\u636e\u6982\u89c8" },
  { href: "/admin/products", label: "\u4ea7\u54c1\u7ba1\u7406" },
  { href: "/admin/product-categories", label: "\u4ea7\u54c1\u5206\u7c7b" },
  { href: "/admin/news", label: "\u65b0\u95fb\u7ba1\u7406" },
  { href: "/admin/news-categories", label: "\u65b0\u95fb\u5206\u7c7b" },
  { href: "/admin/enquiries", label: "\u5ba2\u6237\u8868\u5355" },
  { href: "/admin/analytics", label: "\u8bbf\u95ee\u5206\u6790" },
  { href: "/admin/search-console", label: "SEO \u6570\u636e" },
  { href: "/admin/media", label: "\u5a92\u4f53\u5e93" },
  { href: "/admin/users", label: "\u7528\u6237\u4e0e\u6743\u9650" },
  { href: "/admin/audit-logs", label: "\u64cd\u4f5c\u65e5\u5fd7" },
  { href: "/admin/sync", label: "\u6570\u636e\u540c\u6b65" },
  { href: "/admin/link-audit", label: "\u5185\u5916\u94fe\u5ba1\u8ba1" },
  { href: "/admin/visitors", label: "\u8bbf\u5ba2\u8bb0\u5f55" },
  { href: "/admin/pages", label: "\u9875\u9762\u8868\u73b0" },
  { href: "/admin/journeys", label: "\u8bbf\u95ee\u8def\u5f84" },
  { href: "/admin/settings", label: "\u7cfb\u7edf\u8bbe\u7f6e" }
];

function withCurrentQuery(href, searchParams) {
  const query = searchParams.toString();
  if (!query || href.includes("?")) return href;
  return `${href}?${query}`;
}

export default function AdminShell({ children, email }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/admin">
          <Image src="/assets/logo.jpg" alt="Cowinmagnet.cl" width={138} height={42} priority />
          <strong>{text.brand}</strong>
        </Link>
        <nav aria-label={text.navLabel}>
          {links.map((link) => {
            const active = pathname === link.href || (link.href === "/admin" && pathname === "/admin/dashboard");
            return (
              <Link className={active ? "is-active" : ""} href={withCurrentQuery(link.href, searchParams)} key={link.href}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <AdminLiveStatus />
          <small>{text.account}</small>
          <span>{email}</span>
          <form action="/api/admin/logout" method="post">
            <button type="submit">{text.logout}</button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

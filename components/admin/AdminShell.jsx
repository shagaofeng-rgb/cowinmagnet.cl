"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLiveStatus from "@/components/admin/AdminLiveStatus";

const text = {
  brand: "\u540e\u53f0",
  navLabel: "\u540e\u53f0\u4e3b\u5bfc\u822a",
  account: "\u5f53\u524d\u8d26\u53f7",
  logout: "\u9000\u51fa\u767b\u5f55"
};

const navigationGroups = [
  { label: "\u8fd0\u8425\u6570\u636e", links: [
    { href: "/admin", label: "\u6570\u636e\u6982\u89c8" }, { href: "/admin/analytics", label: "\u6d41\u91cf\u5206\u6790" },
    { href: "/admin/visitors", label: "\u8bbf\u5ba2\u4e2d\u5fc3" }, { href: "/admin/pages", label: "\u9875\u9762\u8868\u73b0" },
    { href: "/admin/journeys", label: "\u8bbf\u95ee\u8def\u5f84" }, { href: "/admin/enquiries", label: "\u5ba2\u6237\u8be2\u76d8" }
  ] },
  { label: "\u5185\u5bb9\u7ba1\u7406", links: [
    { href: "/admin/products", label: "\u4ea7\u54c1" }, { href: "/admin/product-categories", label: "\u4ea7\u54c1\u5206\u7c7b" },
    { href: "/admin/news", label: "\u65b0\u95fb" }, { href: "/admin/news-categories", label: "\u65b0\u95fb\u5206\u7c7b" },
    { href: "/admin/blog", label: "Blog \u6587\u7ae0" }, { href: "/admin/media", label: "\u5a92\u4f53\u5e93" }
  ] },
  { label: "SEO \u4e0e\u7cfb\u7edf", links: [
    { href: "/admin/search-console", label: "SEO \u6570\u636e" }, { href: "/admin/sitemap", label: "Sitemap" },
    { href: "/admin/sync", label: "\u6570\u636e\u72b6\u6001" }, { href: "/admin/users", label: "\u8d26\u6237\u5b89\u5168" },
    { href: "/admin/settings", label: "\u540e\u53f0\u8bbe\u7f6e" }
  ] }
];

export default function AdminShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/admin">
          <Image src="/assets/cowinmagnet-logo.png" alt="Cowinmagnet.cl" width={42} height={42} priority />
          <strong>{text.brand}</strong>
        </Link>
        <nav aria-label={text.navLabel}>
          {navigationGroups.map((group) => <section className="admin-nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.links.map((link) => {
              const active = pathname === link.href || (link.href === "/admin" && pathname === "/admin/dashboard");
              return <Link className={active ? "is-active" : ""} href={link.href} key={link.href}>{link.label}</Link>;
            })}
          </section>)}
        </nav>
        <div className="admin-sidebar-foot">
          <AdminLiveStatus />
          <small>{text.account}</small>
          <span>已登录</span>
          <form action="/api/admin/logout" method="post">
            <button type="submit">{text.logout}</button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

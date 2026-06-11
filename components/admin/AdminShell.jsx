"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "数据总览" },
  { href: "/admin/analytics", label: "流量分析" },
  { href: "/admin/search-console", label: "SEO 数据" },
  { href: "/admin/products", label: "产品管理" },
  { href: "/admin/news", label: "新闻管理" },
  { href: "/admin/link-audit", label: "内外链审计" },
  { href: "/admin/visitors", label: "访客记录" },
  { href: "/admin/pages", label: "页面表现" },
  { href: "/admin/journeys", label: "访问路径" },
  { href: "/admin/enquiries", label: "询盘管理" },
  { href: "/admin/settings", label: "系统设置" }
];

export default function AdminShell({ children, email }) {
  const pathname = usePathname();

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/admin/dashboard">
          <span>CY</span>
          <strong>网站数据后台</strong>
        </Link>
        <nav>
          {links.map((link) => (
            <Link className={pathname === link.href ? "is-active" : ""} href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <small>当前账号</small>
          <span>{email}</span>
          <form action="/api/admin/logout" method="post">
            <button type="submit">退出登录</button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

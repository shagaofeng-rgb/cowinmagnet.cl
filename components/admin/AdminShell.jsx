"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import AdminLiveStatus from "@/components/admin/AdminLiveStatus";

const links = [
  { href: "/admin", label: "数据总览" },
  { href: "/admin/analytics", label: "流量分析" },
  { href: "/admin/search-console", label: "SEO 数据" },
  { href: "/admin/content", label: "内容总览" },
  { href: "/admin/products", label: "产品管理" },
  { href: "/admin/news", label: "新闻管理" },
  { href: "/admin/link-audit", label: "内外链审计" },
  { href: "/admin/visitors", label: "访客记录" },
  { href: "/admin/pages", label: "页面表现" },
  { href: "/admin/journeys", label: "访问路径" },
  { href: "/admin/enquiries", label: "询盘管理" },
  { href: "/admin/settings", label: "系统设置" }
];

function withCurrentQuery(href, searchParams) {
  const query = searchParams.toString();
  if (!query || href.includes("?")) return href;
  if (href === "/admin/logout") return href;
  return `${href}?${query}`;
}

export default function AdminShell({ children, email }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/admin">
          <span>CY</span>
          <strong>Cowinmagnet.cl 后台</strong>
        </Link>
        <nav>
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

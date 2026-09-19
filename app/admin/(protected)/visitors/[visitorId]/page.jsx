import Link from "next/link";
import { requireAdminSession } from "@/lib/adminAuth";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { PaginationNav } from "@/components/PaginationNav";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getVisitorDetail } from "@/lib/analyticsStore";
import { parseListPagination } from "@/lib/listPagination";

export const dynamic = "force-dynamic";
export const metadata = { title: "访客详情 | Cowinmagnet.cl Admin" };

function dateTime(value) {
  return value ? new Intl.DateTimeFormat("zh-CN", { timeZone: "America/Santiago", dateStyle: "medium", timeStyle: "medium", hour12: false }).format(new Date(value)) : "-";
}

export default async function AdminVisitorDetailPage({ params, searchParams }) {
  await requireAdminSession();
  const { visitorId } = await params;
  const query = await searchParams;
  const range = getAdminDateRange(query);
  const paging = parseListPagination(query);
  const detail = await getVisitorDetail(visitorId, range, paging);
  return <>
    <section className="admin-page-head">
      <div>
        <p className="eyebrow">访客详情</p>
        <h1>{detail.customerId}</h1>
        <p>查看该客户在选定时间内的全部会话与浏览路径。</p>
        <Link className="admin-detail-link" href="/admin/visitors">← 返回访客中心</Link>
      </div>
      <AdminDateRangeFilter range={range} />
    </section>
    <section className="admin-kpi-grid">
      <article className="admin-stat-card"><span>首次访问</span><strong>{dateTime(detail.firstSeen)}</strong></article>
      <article className="admin-stat-card"><span>最近访问</span><strong>{dateTime(detail.lastSeen)}</strong></article>
      <article className="admin-stat-card"><span>会话</span><strong>{detail.sessionCount}</strong></article>
      <article className="admin-stat-card"><span>询盘</span><strong>{detail.lead ? "已提交" : "未提交"}</strong></article>
    </section>
    <section className="admin-panel">
      <p className="eyebrow">访问轨迹</p><h2>按会话查看完整路径</h2>
      <div className="admin-session-list">
        {detail.sessions.map((session) => <article key={session.sessionId} className="admin-session-card">
          <header><strong>{dateTime(session.startedAt)}</strong><span>{session.country} · {session.device} · {session.source}</span>{session.enquirySubmitted ? <b>询盘已提交</b> : null}</header>
          <ol>{session.pages.map((page, index) => <li key={`${page.timestamp}-${page.page}`}><span>{index + 1}</span><div><strong>{page.title || page.page}</strong><small>{page.page} · {dateTime(page.timestamp)}</small></div></li>)}</ol>
          {!session.pages.length ? <p>本会话只记录到表单或事件，未记录页面浏览。</p> : null}
        </article>)}
        {!detail.sessions.length ? <p className="admin-empty">当前时间范围内没有该客户的访问记录。</p> : null}
      </div>
      <PaginationNav meta={detail.meta} pathname={`/admin/visitors/${encodeURIComponent(visitorId)}`} params={query} />
    </section>
  </>;
}

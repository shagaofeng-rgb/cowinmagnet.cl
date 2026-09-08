import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminListControls, AdminListPagination } from "@/components/admin/AdminListControls";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { getCmsItemsPage } from "@/lib/cmsStore";

const t = {
  eyebrow: "新闻管理", title: "南美行业新闻", desc: "管理美洲行业资讯、引用来源和 SEO 摘要。", saved: "新闻已保存。", error: "请填写新闻标题。",
  titleLabel: "标题", category: "分类", sourceUrl: "来源 URL", summary: "摘要", body: "正文", save: "保存新闻", status: "状态", updated: "更新时间",
  empty: "暂无新闻。", candidateTitle: "待审 News 候选", generateCandidate: "生成候选", approve: "审核通过", sources: "来源", cluster: "主题"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminNewsPage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const [news, candidates] = await Promise.all([
    getCmsItemsPage("news", { includeInactive: true, range, page: params?.page, pageSize: params?.pageSize, query: params?.query, status: params?.status }),
    getCmsItemsPage("news-candidate", { includeInactive: true, range, page: params?.candidatePage, pageSize: 25 })
  ]);

  return <section className="admin-panel">
    <div className="admin-page-head compact"><div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.desc}</p></div><AdminDateRangeFilter range={range} /></div>
    {params?.saved ? <div className="admin-alert good">{t.saved}</div> : null}
    {params?.candidate ? <div className="admin-alert good">候选状态：{params.candidate}</div> : null}
    {params?.error ? <div className="admin-alert">{t.error}</div> : null}
    <details className="admin-editor-disclosure"><summary>人工新增新闻</summary><form className="admin-form admin-form-split" action="/api/admin/content/news" method="post">
      <label>{t.titleLabel}<input name="title" required /></label><label>Slug<input name="slug" placeholder="留空自动生成" /></label>
      <label>{t.category}<input name="categoryTitle" placeholder="Mining / Recycling / Company News" /></label><label>{t.sourceUrl}<input name="sourceUrl" type="url" /></label>
      <label className="admin-wide">{t.summary}<textarea name="summary" rows="3" /></label><label className="admin-wide">{t.body}<textarea name="body" rows="7" /></label><button type="submit">{t.save}</button>
    </form></details>
    <section className="admin-list-section">
      <div className="admin-panel-head"><div><p className="eyebrow">已发布内容</p><h2>News 文章记录</h2></div></div>
      <AdminListControls searchLabel="搜索新闻标题、分类或来源" statusOptions={[{ value: "published", label: "已发布" }, { value: "draft", label: "草稿" }, { value: "offline", label: "已下线" }]} />
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t.titleLabel}</th><th>{t.category}</th><th>{t.status}</th><th>{t.sourceUrl}</th><th>{t.updated}</th></tr></thead><tbody>
        {news.items.map((item) => <tr key={item.slug}><td>{item.title}</td><td>{item.categoryTitle || "-"}</td><td>{item.status}</td><td>{item.sourceUrl || "CMS"}</td><td>{item.updatedAt || item.createdAt}</td></tr>)}
        {!news.items.length ? <tr><td colSpan="5">{t.empty}</td></tr> : null}
      </tbody></table></div>
      <AdminListPagination meta={news.meta} itemLabel="篇 News" />
    </section>
    <section className="admin-list-section">
      <div className="admin-page-head compact"><div><p className="eyebrow">候选池</p><h2>{t.candidateTitle}</h2><p>候选来源与审核状态独立于已发布 News；此处只查看和管理既有流程。</p></div><form action="/api/admin/editorial-candidates/generate" method="post"><button type="submit">{t.generateCandidate}</button></form></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t.titleLabel}</th><th>{t.cluster}</th><th>{t.sources}</th><th>{t.status}</th><th>{t.updated}</th><th>操作</th></tr></thead><tbody>
        {candidates.items.map((item) => <tr key={item.slug}><td>{item.title}</td><td>{item.topicClusterId || "-"}</td><td>{item.sources?.length || 0}</td><td>{item.status}</td><td>{item.updatedAt || item.createdAt}</td><td>{item.status === "evidence_review" ? <form action={`/api/admin/editorial-candidates/${item.slug}/approve`} method="post"><button type="submit">{t.approve}</button></form> : "-"}</td></tr>)}
        {!candidates.items.length ? <tr><td colSpan="6">暂无候选。</td></tr> : null}
      </tbody></table></div>
      <AdminListPagination meta={candidates.meta} itemLabel="条候选" pageParam="candidatePage" />
    </section>
  </section>;
}

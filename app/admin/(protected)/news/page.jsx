import { getCmsItems } from "@/lib/cmsStore";

const t = {
  eyebrow: "\u65b0\u95fb\u7ba1\u7406",
  title: "\u5357\u7f8e\u884c\u4e1a\u65b0\u95fb",
  desc: "\u7ba1\u7406\u7f8e\u6d32\u884c\u4e1a\u8d44\u8baf\u3001\u5f15\u7528\u6765\u6e90\u548c SEO \u6458\u8981\u3002",
  saved: "\u65b0\u95fb\u5df2\u4fdd\u5b58\u3002",
  error: "\u8bf7\u586b\u5199\u65b0\u95fb\u6807\u9898\u3002",
  titleLabel: "\u6807\u9898",
  category: "\u5206\u7c7b",
  sourceUrl: "\u6765\u6e90 URL",
  summary: "\u6458\u8981",
  body: "\u6b63\u6587",
  save: "\u4fdd\u5b58\u65b0\u95fb",
  status: "\u72b6\u6001",
  updated: "\u66f4\u65b0\u65f6\u95f4",
  empty: "\u6682\u65e0\u65b0\u95fb\u3002",
  candidateTitle: "待审 News 候选",
  generateCandidate: "生成候选",
  approve: "审核通过",
  sources: "来源",
  cluster: "主题"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminNewsPage({ searchParams }) {
  const params = await searchParams;
  const [news, candidates] = await Promise.all([
    getCmsItems("news", { includeInactive: true }),
    getCmsItems("news-candidate", { includeInactive: true })
  ]);

  return (
    <section className="admin-panel">
      <div className="admin-page-head compact">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>
      </div>
      {params?.saved ? <div className="admin-alert good">{t.saved}</div> : null}
      {params?.candidate ? <div className="admin-alert good">候选状态：{params.candidate}</div> : null}
      {params?.error ? <div className="admin-alert">{t.error}</div> : null}
      <section>
        <form className="admin-form admin-form-split" action="/api/admin/content/news" method="post">
          <label>{t.titleLabel}<input name="title" required /></label>
          <label>Slug<input name="slug" placeholder="\u7559\u7a7a\u81ea\u52a8\u751f\u6210" /></label>
          <label>{t.category}<input name="categoryTitle" placeholder="Mining / Recycling / Company News" /></label>
          <label>{t.sourceUrl}<input name="sourceUrl" type="url" /></label>
          <label className="admin-wide">{t.summary}<textarea name="summary" rows="3" /></label>
          <label className="admin-wide">{t.body}<textarea name="body" rows="7" /></label>
          <button type="submit">{t.save}</button>
        </form>
      </section>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>{t.titleLabel}</th><th>{t.category}</th><th>{t.status}</th><th>{t.sourceUrl}</th><th>{t.updated}</th></tr></thead>
          <tbody>
            {news.map((item) => (
              <tr key={item.slug}>
                <td>{item.title}</td><td>{item.categoryTitle || "-"}</td><td>{item.status}</td><td>{item.sourceUrl || "CMS"}</td><td>{item.updatedAt || item.createdAt}</td>
              </tr>
            ))}
            {!news.length ? <tr><td colSpan="5">{t.empty}</td></tr> : null}
          </tbody>
        </table>
      </div>
      <section className="admin-table-wrap">
        <div className="admin-page-head compact">
          <div><h2>{t.candidateTitle}</h2></div>
          <form action="/api/admin/editorial-candidates/generate" method="post"><button type="submit">{t.generateCandidate}</button></form>
        </div>
        <table className="admin-table">
          <thead><tr><th>{t.titleLabel}</th><th>{t.cluster}</th><th>{t.sources}</th><th>{t.status}</th><th>{t.updated}</th><th>操作</th></tr></thead>
          <tbody>
            {candidates.map((item) => (
              <tr key={item.slug}>
                <td>{item.title}</td><td>{item.topicClusterId || "-"}</td><td>{item.sources?.length || 0}</td><td>{item.status}</td><td>{item.updatedAt || item.createdAt}</td>
                <td>{item.status === "evidence_review" ? <form action={`/api/admin/editorial-candidates/${item.slug}/approve`} method="post"><button type="submit">{t.approve}</button></form> : "-"}</td>
              </tr>
            ))}
            {!candidates.length ? <tr><td colSpan="6">暂无候选。</td></tr> : null}
          </tbody>
        </table>
      </section>
    </section>
  );
}

import { getCmsItems } from "@/lib/cmsStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "新闻管理 | Cowinmagnet.cl Admin" };

export default async function AdminNewsPage({ searchParams }) {
  const params = await searchParams;
  const news = await getCmsItems("news", { includeInactive: true });

  return (
    <section className="admin-panel">
      <div className="admin-page-head compact">
        <div>
          <p className="eyebrow">新闻管理</p>
          <h1>南美行业新闻</h1>
          <p>管理美洲行业资讯、引用来源、SEO 摘要和自动采编文章。每天 4 篇新闻由 Cron 自动发布，也可以在这里手动触发一次。</p>
        </div>
      </div>
      {params?.saved ? <div className="admin-alert good">新闻已保存。</div> : null}
      {params?.error ? <div className="admin-alert">请填写新闻标题。</div> : null}
      {params?.automation === "published" ? <div className="admin-alert good">自动采编已发布新文章。</div> : null}
      {params?.automation === "checked" ? <div className="admin-alert">自动采编已运行，但本次没有符合评分和去重规则的文章。</div> : null}
      <section className="admin-grid two">
        <form className="admin-form admin-form-split" action="/api/admin/content/news" method="post">
          <label>标题<input name="title" required /></label>
          <label>Slug<input name="slug" placeholder="留空自动生成" /></label>
          <label>分类<input name="categoryTitle" placeholder="Mining / Recycling / Company News" /></label>
          <label>来源 URL<input name="sourceUrl" type="url" /></label>
          <label className="admin-wide">摘要<textarea name="summary" rows="3" /></label>
          <label className="admin-wide">正文<textarea name="body" rows="7" /></label>
          <button type="submit">保存新闻</button>
        </form>
        <form className="admin-panel" action="/api/admin/news-automation/run" method="post">
          <p className="eyebrow">News Automation</p>
          <h2>手动运行采编</h2>
          <p className="admin-muted">系统会按来源多样性、语义去重、主题覆盖和信息增益评分挑选美洲相关新闻。</p>
          <button type="submit">立即抓取 1 篇</button>
        </form>
      </section>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>标题</th><th>分类</th><th>状态</th><th>来源</th><th>更新时间</th></tr></thead>
          <tbody>
            {news.map((item) => (
              <tr key={item.slug}>
                <td>{item.title}</td><td>{item.categoryTitle || "-"}</td><td>{item.status}</td><td>{item.sourceUrl || "CMS"}</td><td>{item.updatedAt || item.createdAt}</td>
              </tr>
            ))}
            {!news.length ? <tr><td colSpan="5">暂无新闻。可以先手动录入，自动采编上线后会每天发布 4 篇。</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

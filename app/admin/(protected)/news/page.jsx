import { getCmsItems } from "@/lib/cmsStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "新闻管理 | Cowinmagnet LATAM" };

export default async function AdminNewsPage({ searchParams }) {
  const params = await searchParams;
  const news = await getCmsItems("news", { includeInactive: true });

  return (
    <section className="admin-panel">
      <div className="admin-page-head compact">
        <div>
          <p className="eyebrow">新闻管理</p>
          <h1>南美行业新闻</h1>
          <p>管理行业资讯、项目动态和 SEO 文章，后续可接入三小时自动抓取与人工审核发布。</p>
        </div>
      </div>
      {params?.saved ? <div className="admin-alert good">新闻已保存。</div> : null}
      {params?.error ? <div className="admin-alert">请填写新闻标题。</div> : null}
      <form className="admin-form admin-form-split" action="/api/admin/content/news" method="post">
        <label>标题<input name="title" required /></label>
        <label>Slug<input name="slug" placeholder="可留空自动生成" /></label>
        <label>分类<input name="categoryTitle" placeholder="Mining / Recycling / Company News" /></label>
        <label>来源 URL<input name="sourceUrl" type="url" /></label>
        <label className="admin-wide">摘要<textarea name="summary" rows="3" /></label>
        <label className="admin-wide">正文<textarea name="body" rows="7" /></label>
        <button type="submit">保存新闻</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>标题</th><th>分类</th><th>状态</th><th>来源</th><th>更新时间</th></tr></thead>
          <tbody>
            {news.map((item) => (
              <tr key={item.slug}>
                <td>{item.title}</td><td>{item.categoryTitle || "-"}</td><td>{item.status}</td><td>{item.sourceUrl || "CMS"}</td><td>{item.updatedAt || item.createdAt}</td>
              </tr>
            ))}
            {!news.length ? <tr><td colSpan="5">暂无新闻。可以先手动录入，正式上线后再接自动采集。</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

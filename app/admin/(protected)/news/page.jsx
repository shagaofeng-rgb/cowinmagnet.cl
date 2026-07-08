import { getCmsItems } from "@/lib/cmsStore";

const t = {
  eyebrow: "\u65b0\u95fb\u7ba1\u7406",
  title: "\u5357\u7f8e\u884c\u4e1a\u65b0\u95fb",
  desc: "\u7ba1\u7406\u7f8e\u6d32\u884c\u4e1a\u8d44\u8baf\u3001\u5f15\u7528\u6765\u6e90\u3001SEO \u6458\u8981\u548c\u81ea\u52a8\u91c7\u7f16\u6587\u7ae0\u3002Cron \u6bcf\u5929\u6309\u8ba1\u5212\u53d1\u5e03\u65b0\u95fb\uff0c\u4e5f\u53ef\u4ee5\u5728\u8fd9\u91cc\u624b\u52a8\u89e6\u53d1\u3002",
  saved: "\u65b0\u95fb\u5df2\u4fdd\u5b58\u3002",
  error: "\u8bf7\u586b\u5199\u65b0\u95fb\u6807\u9898\u3002",
  published: "\u81ea\u52a8\u91c7\u7f16\u5df2\u53d1\u5e03\u65b0\u6587\u7ae0\u3002",
  checked: "\u81ea\u52a8\u91c7\u7f16\u5df2\u8fd0\u884c\uff0c\u672c\u6b21\u672a\u53d1\u5e03\u65b0\u6587\u7ae0\u3002",
  titleLabel: "\u6807\u9898",
  category: "\u5206\u7c7b",
  sourceUrl: "\u6765\u6e90 URL",
  summary: "\u6458\u8981",
  body: "\u6b63\u6587",
  save: "\u4fdd\u5b58\u65b0\u95fb",
  automation: "\u624b\u52a8\u8fd0\u884c\u91c7\u7f16",
  automationText: "\u7cfb\u7edf\u6309\u6765\u6e90\u591a\u6837\u6027\u3001\u8bed\u4e49\u53bb\u91cd\u3001\u4e3b\u9898\u8986\u76d6\u548c\u4fe1\u606f\u589e\u76ca\u8bc4\u5206\u6311\u9009\u7f8e\u6d32\u76f8\u5173\u65b0\u95fb\u3002",
  run: "\u7acb\u5373\u6293\u53d6 1 \u7bc7",
  status: "\u72b6\u6001",
  updated: "\u66f4\u65b0\u65f6\u95f4",
  empty: "\u6682\u65e0\u65b0\u95fb\u3002"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminNewsPage({ searchParams }) {
  const params = await searchParams;
  const news = await getCmsItems("news", { includeInactive: true });

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
      {params?.error ? <div className="admin-alert">{t.error}</div> : null}
      {params?.automation === "published" ? <div className="admin-alert good">{t.published}</div> : null}
      {params?.automation === "checked" ? <div className="admin-alert">{t.checked}</div> : null}
      <section className="admin-grid two">
        <form className="admin-form admin-form-split" action="/api/admin/content/news" method="post">
          <label>{t.titleLabel}<input name="title" required /></label>
          <label>Slug<input name="slug" placeholder="\u7559\u7a7a\u81ea\u52a8\u751f\u6210" /></label>
          <label>{t.category}<input name="categoryTitle" placeholder="Mining / Recycling / Company News" /></label>
          <label>{t.sourceUrl}<input name="sourceUrl" type="url" /></label>
          <label className="admin-wide">{t.summary}<textarea name="summary" rows="3" /></label>
          <label className="admin-wide">{t.body}<textarea name="body" rows="7" /></label>
          <button type="submit">{t.save}</button>
        </form>
        <form className="admin-panel" action="/api/admin/news-automation/run" method="post">
          <p className="eyebrow">News Automation</p>
          <h2>{t.automation}</h2>
          <p className="admin-muted">{t.automationText}</p>
          <button type="submit">{t.run}</button>
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
    </section>
  );
}

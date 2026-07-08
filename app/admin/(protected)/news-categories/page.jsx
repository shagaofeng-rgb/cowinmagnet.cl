import { getCmsItems } from "@/lib/cmsStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "新闻分类 | Cowinmagnet.cl 后台" };

export default async function AdminNewsCategoriesPage() {
  const news = await getCmsItems("news", { includeInactive: true });
  const categoryMap = new Map();
  news.forEach((item) => {
    const title = item.categoryTitle || "Industry News";
    categoryMap.set(title, (categoryMap.get(title) || 0) + 1);
  });
  const rows = [...categoryMap.entries()].map(([title, count], index) => ({ title, count, sort: index + 1 }));

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">新闻分类</p>
          <h1>新闻分类与采编主题</h1>
          <p>分类从已发布和草稿新闻中聚合。自动采编会按主题覆盖和来源多样性记录分类。</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>分类名称</th><th>文章数量</th><th>状态</th><th>排序</th></tr></thead>
          <tbody>
            {rows.map((row) => <tr key={row.title}><td>{row.title}</td><td>{row.count}</td><td>启用</td><td>{row.sort}</td></tr>)}
            {!rows.length ? <tr><td colSpan="4">暂无新闻分类。发布第一篇新闻后会自动出现。</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

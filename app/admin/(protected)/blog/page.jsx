import { getCmsItems } from "@/lib/cmsStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog 文章 | Cowinmagnet.cl" };

export default async function AdminBlogPage({ searchParams }) {
  const params = await searchParams;
  const posts = await getCmsItems("blog", { includeInactive: true });

  return (
    <section className="admin-panel">
      <div className="admin-page-head compact">
        <div>
          <p className="eyebrow">Blog 文章</p>
          <h1>Blog 发布管理</h1>
          <p>管理真实 CMS 数据库中的文章、分类、封面、状态和发布时间。</p>
        </div>
      </div>
      {params?.saved ? <div className="admin-alert good">文章已发布。</div> : null}
      {params?.error ? <div className="admin-alert">请填写标题和可用的 URL 标识。</div> : null}
      <form className="admin-form admin-form-split" action="/api/admin/content/blog" method="post">
        <label>标题<input name="title" required /></label>
        <label>URL 标识<input name="slug" placeholder="留空则自动生成" /></label>
        <label>分类 ID<input name="categoryId" defaultValue="blog" /></label>
        <label>分类名称<input name="categoryTitle" defaultValue="Blog" /></label>
        <label>作者<input name="author" defaultValue="Cowinmagnet LATAM" /></label>
        <label>封面图片 URL<input name="image" type="url" /></label>
        <label className="admin-wide">摘要<textarea name="summary" rows="3" /></label>
        <label className="admin-wide">正文<textarea name="body" rows="9" required /></label>
        <button type="submit">发布文章</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>标题</th><th>分类</th><th>状态</th><th>封面</th><th>更新时间</th></tr></thead>
          <tbody>
            {posts.map((post) => <tr key={post.slug}><td>{post.title}</td><td>{post.categoryTitle || "Blog"}</td><td>{post.status}</td><td>{post.image || post.coverImage ? "已设置" : "-"}</td><td>{post.updatedAt || post.createdAt}</td></tr>)}
            {!posts.length ? <tr><td colSpan="5">暂无文章。</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

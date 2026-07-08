import { productCategories, products } from "@/data/catalog";
import { getCmsItems } from "@/lib/cmsStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "产品管理 | Cowinmagnet.cl 后台" };

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const uploadedProducts = await getCmsItems("product", { includeInactive: true });

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">产品管理</p>
          <h1>产品上传、编辑与发布</h1>
          <p>当前同步主站产品 {products.length} 个，后台新增产品 {uploadedProducts.length} 个。产品保存后会进入 CMS 持久化存储。</p>
        </div>
      </div>
      {params?.saved ? <div className="admin-alert good">产品已保存。</div> : null}
      {params?.error ? <div className="admin-alert">请填写产品名称和有效 Slug。</div> : null}
      <form className="admin-form" action="/api/admin/content/products" method="post" encType="multipart/form-data">
        <h2>新增或更新产品</h2>
        <label>产品名称<input name="title" required /></label>
        <label>Slug<input name="slug" placeholder="留空则自动生成" /></label>
        <label>短标题<input name="shortTitle" /></label>
        <label>产品分类
          <select name="categoryBundle">
            {productCategories.map((category) => (
              <option value={`${category.slug}|||${category.title}`} key={category.slug}>{category.title}</option>
            ))}
          </select>
        </label>
        <label>新分类名称<input name="newCategoryTitle" placeholder="需要新增分类时填写" /></label>
        <label>摘要<textarea name="summary" rows="3" /></label>
        <label>完整描述<textarea name="overview" rows="5" /></label>
        <label>应用场景<textarea name="application" rows="3" /></label>
        <label>核心卖点<textarea name="features" rows="5" placeholder="每行一个卖点" /></label>
        <label>技术参数<textarea name="specifications" rows="5" placeholder="参数: 数值" /></label>
        <label>产品主图<input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
        <label>图片 ALT<input name="imageAlt" /></label>
        <button type="submit">保存产品</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>名称</th><th>分类</th><th>状态</th><th>来源</th></tr></thead>
          <tbody>
            {uploadedProducts.map((item) => <tr key={item.slug}><td>{item.title}</td><td>{item.categoryTitle}</td><td>{item.status}</td><td>后台 CMS</td></tr>)}
            {products.slice(0, 80).map((item) => <tr key={item.slug}><td>{item.title}</td><td>{item.category}</td><td>已发布</td><td>主站产品同步</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

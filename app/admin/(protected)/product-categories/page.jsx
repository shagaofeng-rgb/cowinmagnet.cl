import { productCategories, products } from "@/data/catalog";
import { getCmsItems } from "@/lib/cmsStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "产品分类 | Cowinmagnet.cl 后台" };

export default async function AdminProductCategoriesPage() {
  const cmsProducts = await getCmsItems("product", { includeInactive: true });
  const rows = productCategories.map((category) => ({
    ...category,
    productCount: products.filter((product) => product.category === category.slug).length + cmsProducts.filter((product) => product.categoryId === category.slug).length
  }));

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">产品分类</p>
          <h1>分类、排序与前台导航状态</h1>
          <p>当前分类来自主站产品目录和后台新增产品。新增产品时可填写新分类名称，系统会随产品保存。</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>分类名称</th><th>Slug</th><th>产品数量</th><th>状态</th><th>排序</th></tr></thead>
          <tbody>
            {rows.map((category, index) => (
              <tr key={category.slug}>
                <td>{category.title}</td>
                <td>{category.slug}</td>
                <td>{category.productCount}</td>
                <td>启用</td>
                <td>{index + 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

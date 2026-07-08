import { productCategories, products } from "@/data/catalog";
import { getCmsItems } from "@/lib/cmsStore";

const t = {
  eyebrow: "\u4ea7\u54c1\u7ba1\u7406",
  title: "\u4ea7\u54c1\u4e0a\u4f20\u3001\u7f16\u8f91\u4e0e\u53d1\u5e03",
  desc: "\u5f53\u524d\u540c\u6b65\u4e3b\u7ad9\u4ea7\u54c1",
  cmsProducts: "\u540e\u53f0\u65b0\u589e\u4ea7\u54c1",
  saved: "\u4ea7\u54c1\u5df2\u4fdd\u5b58\u3002",
  error: "\u8bf7\u586b\u5199\u4ea7\u54c1\u540d\u79f0\u548c\u6709\u6548 Slug\u3002",
  formTitle: "\u65b0\u589e\u6216\u66f4\u65b0\u4ea7\u54c1",
  name: "\u4ea7\u54c1\u540d\u79f0",
  slugPlaceholder: "\u7559\u7a7a\u5219\u81ea\u52a8\u751f\u6210",
  shortTitle: "\u77ed\u6807\u9898",
  category: "\u4ea7\u54c1\u5206\u7c7b",
  newCategory: "\u65b0\u5206\u7c7b\u540d\u79f0",
  newCategoryPlaceholder: "\u9700\u8981\u65b0\u589e\u5206\u7c7b\u65f6\u586b\u5199",
  summary: "\u6458\u8981",
  overview: "\u5b8c\u6574\u63cf\u8ff0",
  application: "\u5e94\u7528\u573a\u666f",
  features: "\u6838\u5fc3\u5356\u70b9",
  featurePlaceholder: "\u6bcf\u884c\u4e00\u4e2a\u5356\u70b9",
  specs: "\u6280\u672f\u53c2\u6570",
  specPlaceholder: "\u53c2\u6570: \u6570\u503c",
  mainImage: "\u4ea7\u54c1\u4e3b\u56fe",
  imageAlt: "\u56fe\u7247 ALT",
  save: "\u4fdd\u5b58\u4ea7\u54c1",
  status: "\u72b6\u6001",
  source: "\u6765\u6e90",
  published: "\u5df2\u53d1\u5e03",
  cms: "\u540e\u53f0 CMS",
  mainSync: "\u4e3b\u7ad9\u4ea7\u54c1\u540c\u6b65"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const uploadedProducts = await getCmsItems("product", { includeInactive: true });

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.desc} {products.length} \u4e2a\uff0c{t.cmsProducts} {uploadedProducts.length} \u4e2a\u3002</p>
        </div>
      </div>
      {params?.saved ? <div className="admin-alert good">{t.saved}</div> : null}
      {params?.error ? <div className="admin-alert">{t.error}</div> : null}
      <form className="admin-form" action="/api/admin/content/products" method="post" encType="multipart/form-data">
        <h2>{t.formTitle}</h2>
        <label>{t.name}<input name="title" required /></label>
        <label>Slug<input name="slug" placeholder={t.slugPlaceholder} /></label>
        <label>{t.shortTitle}<input name="shortTitle" /></label>
        <label>{t.category}
          <select name="categoryBundle">
            {productCategories.map((category) => (
              <option value={`${category.slug}|||${category.title}`} key={category.slug}>{category.title}</option>
            ))}
          </select>
        </label>
        <label>{t.newCategory}<input name="newCategoryTitle" placeholder={t.newCategoryPlaceholder} /></label>
        <label>{t.summary}<textarea name="summary" rows="3" /></label>
        <label>{t.overview}<textarea name="overview" rows="5" /></label>
        <label>{t.application}<textarea name="application" rows="3" /></label>
        <label>{t.features}<textarea name="features" rows="5" placeholder={t.featurePlaceholder} /></label>
        <label>{t.specs}<textarea name="specifications" rows="5" placeholder={t.specPlaceholder} /></label>
        <label>{t.mainImage}<input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
        <label>{t.imageAlt}<input name="imageAlt" /></label>
        <button type="submit">{t.save}</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>{t.name}</th><th>{t.category}</th><th>{t.status}</th><th>{t.source}</th></tr></thead>
          <tbody>
            {uploadedProducts.map((item) => <tr key={item.slug}><td>{item.title}</td><td>{item.categoryTitle}</td><td>{item.status}</td><td>{t.cms}</td></tr>)}
            {products.slice(0, 80).map((item) => <tr key={item.slug}><td>{item.title}</td><td>{item.category}</td><td>{t.published}</td><td>{t.mainSync}</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

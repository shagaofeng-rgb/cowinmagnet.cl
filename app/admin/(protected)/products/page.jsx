import { productCategories, products } from "@/data/catalog";
import { getCmsItems } from "@/lib/cmsStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products Admin | Cowinmagnet LATAM" };

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const uploadedProducts = await getCmsItems("product", { includeInactive: true });

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <p className="eyebrow">Content</p>
        <h1>Products</h1>
        <p>{products.length} synced products and {uploadedProducts.length} CMS uploaded products.</p>
      </div>
      {params?.saved ? <div className="admin-alert good">Product saved.</div> : null}
      {params?.error ? <div className="admin-alert">Please provide product name and slug.</div> : null}
      <form className="admin-form" action="/api/admin/content/products" method="post" encType="multipart/form-data">
        <h2>Add or update product</h2>
        <label>Product name<input name="title" required /></label>
        <label>Slug<input name="slug" /></label>
        <label>Short title<input name="shortTitle" /></label>
        <label>Category
          <select name="categoryBundle">
            {productCategories.map((category) => (
              <option value={`${category.slug}|||${category.title}`} key={category.slug}>{category.title}</option>
            ))}
          </select>
        </label>
        <label>New category title<input name="newCategoryTitle" /></label>
        <label>Summary<textarea name="summary" rows="3" /></label>
        <label>Full description<textarea name="overview" rows="5" /></label>
        <label>Applications<textarea name="application" rows="3" /></label>
        <label>Features<textarea name="features" rows="5" placeholder="One item per line" /></label>
        <label>Technical specifications<textarea name="specifications" rows="5" placeholder="Parameter: Value" /></label>
        <label>Main image<input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
        <label>Image alt<input name="imageAlt" /></label>
        <button type="submit">Save product</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Source</th></tr></thead>
        <tbody>
          {uploadedProducts.map((item) => <tr key={item.slug}><td>{item.title}</td><td>{item.categoryTitle}</td><td>{item.status}</td><td>CMS</td></tr>)}
          {products.slice(0, 80).map((item) => <tr key={item.slug}><td>{item.title}</td><td>{item.category}</td><td>published</td><td>Main catalog sync</td></tr>)}
        </tbody>
      </table>
    </section>
  );
}

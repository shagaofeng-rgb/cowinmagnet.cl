import { products } from "@/data/catalog";
import { getCmsItems } from "@/lib/cmsStore";

const t = {
  title: "\u5a92\u4f53\u5e93",
  heading: "\u56fe\u7247\u3001PDF \u4e0e\u9644\u4ef6\u4f7f\u7528\u60c5\u51b5",
  desc: "\u5c55\u793a\u4ea7\u54c1\u3001\u65b0\u95fb\u548c CMS \u5185\u5bb9\u4e2d\u6b63\u5728\u4f7f\u7528\u7684\u5a92\u4f53\u8d44\u6e90\u3002",
  productImage: "\u4ea7\u54c1\u56fe\u7247",
  cmsProductImage: "CMS \u4ea7\u54c1\u56fe\u7247",
  newsImage: "\u65b0\u95fb\u56fe\u7247",
  name: "\u8d44\u6e90\u540d\u79f0",
  type: "\u7c7b\u578b",
  url: "\u5730\u5740",
  usage: "\u4f7f\u7528\u4f4d\u7f6e",
  empty: "\u6682\u65e0\u5a92\u4f53\u8d44\u6e90\u3002"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.title} | Cowinmagnet.cl` };

export default async function AdminMediaPage() {
  const [cmsProducts, cmsNews] = await Promise.all([
    getCmsItems("product", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true })
  ]);
  const assets = [
    ...products.filter((item) => item.image).map((item) => ({ title: item.title, type: t.productImage, url: item.image, usage: `/products/${item.category}/${item.slug}` })),
    ...cmsProducts.filter((item) => item.image).map((item) => ({ title: item.title, type: t.cmsProductImage, url: item.image, usage: item.href || item.slug })),
    ...cmsNews.filter((item) => item.image || item.coverImage).map((item) => ({ title: item.title, type: t.newsImage, url: item.image || item.coverImage, usage: item.href || item.slug }))
  ];

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">{t.title}</p>
          <h1>{t.heading}</h1>
          <p>{t.desc}</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>{t.name}</th><th>{t.type}</th><th>{t.url}</th><th>{t.usage}</th></tr></thead>
          <tbody>
            {assets.slice(0, 120).map((asset, index) => (
              <tr key={`${asset.url}-${index}`}><td>{asset.title}</td><td>{asset.type}</td><td>{String(asset.url).slice(0, 90)}</td><td>{asset.usage}</td></tr>
            ))}
            {!assets.length ? <tr><td colSpan="4">{t.empty}</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

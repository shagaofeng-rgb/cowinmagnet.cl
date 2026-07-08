import { products } from "@/data/catalog";
import { getCmsItems } from "@/lib/cmsStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "媒体库 | Cowinmagnet.cl 后台" };

export default async function AdminMediaPage() {
  const [cmsProducts, cmsNews] = await Promise.all([
    getCmsItems("product", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true })
  ]);
  const assets = [
    ...products.filter((item) => item.image).map((item) => ({ title: item.title, type: "产品图片", url: item.image, usage: `/products/${item.category}/${item.slug}` })),
    ...cmsProducts.filter((item) => item.image).map((item) => ({ title: item.title, type: "CMS 产品图片", url: item.image, usage: item.href || item.slug })),
    ...cmsNews.filter((item) => item.image || item.coverImage).map((item) => ({ title: item.title, type: "新闻图片", url: item.image || item.coverImage, usage: item.href || item.slug }))
  ];

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">媒体库</p>
          <h1>图片、PDF 与附件使用情况</h1>
          <p>当前列出前台产品和 CMS 内容正在使用的媒体资源。上传入口在产品与新闻表单中，生产环境建议接入对象存储。</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>资源名称</th><th>类型</th><th>地址</th><th>使用位置</th></tr></thead>
          <tbody>
            {assets.slice(0, 120).map((asset, index) => (
              <tr key={`${asset.url}-${index}`}><td>{asset.title}</td><td>{asset.type}</td><td>{String(asset.url).slice(0, 90)}</td><td>{asset.usage}</td></tr>
            ))}
            {!assets.length ? <tr><td colSpan="4">暂无媒体资源。</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

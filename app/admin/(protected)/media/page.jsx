import { products } from "@/data/catalog";
import { requireAdminSession } from "@/lib/adminAuth";
import { AdminListControls, AdminListPagination } from "@/components/admin/AdminListControls";
import { getCmsItems } from "@/lib/cmsStore";

const t = {
  title: "媒体库", heading: "图片、PDF 与附件使用情况", desc: "展示产品、新闻和 CMS 内容中正在使用的媒体资源。",
  productImage: "产品图片", cmsProductImage: "CMS 产品图片", newsImage: "新闻图片", name: "资源名称", type: "类型", url: "地址", usage: "使用位置", empty: "暂无媒体资源。"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.title} | Cowinmagnet.cl` };

export default async function AdminMediaPage({ searchParams }) {
  await requireAdminSession();
  const params = await searchParams;
  const [cmsProducts, cmsNews] = await Promise.all([getCmsItems("product", { includeInactive: true }), getCmsItems("news", { includeInactive: true })]);
  const query = String(params?.query || "").trim().toLowerCase();
  const pageSize = [25, 50, 100].includes(Number(params?.pageSize)) ? Number(params.pageSize) : 25;
  const assets = [
    ...products.filter((item) => item.image).map((item) => ({ title: item.title, type: t.productImage, url: item.image, usage: `/products/${item.category}/${item.slug}` })),
    ...cmsProducts.filter((item) => item.image).map((item) => ({ title: item.title, type: t.cmsProductImage, url: item.image, usage: item.href || item.slug })),
    ...cmsNews.filter((item) => item.image || item.coverImage).map((item) => ({ title: item.title, type: t.newsImage, url: item.image || item.coverImage, usage: item.href || item.slug }))
  ].filter((item) => !query || [item.title, item.type, item.url, item.usage].join(" ").toLowerCase().includes(query));
  const totalPages = Math.max(1, Math.ceil(assets.length / pageSize));
  const page = Math.min(Math.max(1, Number(params?.page || 1) || 1), totalPages);
  const visibleAssets = assets.slice((page - 1) * pageSize, page * pageSize);

  return <section className="admin-panel">
    <div className="admin-page-head"><div><p className="eyebrow">{t.title}</p><h1>{t.heading}</h1><p>{t.desc} 已按页展示，避免长列表影响后台读取。</p></div></div>
    <AdminListControls searchLabel="搜索资源、页面或 URL" />
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t.name}</th><th>{t.type}</th><th>{t.url}</th><th>{t.usage}</th></tr></thead><tbody>
      {visibleAssets.map((asset, index) => <tr key={`${asset.url}-${index}`}><td>{asset.title}</td><td>{asset.type}</td><td>{String(asset.url).slice(0, 90)}</td><td>{asset.usage}</td></tr>)}
      {!assets.length ? <tr><td colSpan="4">{t.empty}</td></tr> : null}
    </tbody></table></div>
    <AdminListPagination meta={{ page, pageSize, total: assets.length, totalPages }} itemLabel="个媒体资源" />
  </section>;
}

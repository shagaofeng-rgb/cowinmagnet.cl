import { products } from "@/data/catalog";
import { technicalResources } from "@/data/technicalResources";
import { requireAdminSession } from "@/lib/adminAuth";
import { AdminListControls, AdminListPagination } from "@/components/admin/AdminListControls";
import { getCmsMediaItems } from "@/lib/cmsStore";
import { paginateList, parseListPagination } from "@/lib/listPagination";

const kinds = { product: "产品图片", news: "新闻封面", blog: "博客封面", document: "下载文件", archive: "存档图片" };
export const dynamic = "force-dynamic";
export const metadata = { title: "媒体库 | Cowinmagnet.cl" };

function assetLink(value) {
  if (typeof value !== "string" || /[\\\u0000-\u0020]/.test(value)) return "";
  if (/^\/(?!\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export default async function AdminMediaPage({ searchParams }) {
  await requireAdminSession();
  const params = await searchParams;
  const cms = await getCmsMediaItems();
  const query = typeof params?.query === "string" ? params.query.trim().toLowerCase().slice(0, 120) : "";
  const filter = typeof params?.status === "string" && Object.hasOwn(kinds, params.status) ? params.status : "";
  const assets = [
    ...products.flatMap((item) => item.imageGallery.filter(Boolean).map((url, index) => ({
      title: item.title + " · " + (index + 1), type: "product", url, usage: "/es-cl/products/" + item.category + "/" + item.slug
    }))),
    ...cms.map((item) => ({
      title: item.title, type: item.type === "product" ? "archive" : item.type, url: item.url,
      usage: item.status === "published" && item.type !== "product" ? "/es-cl/" + item.type + "/" + item.slug : "",
    })),
    ...technicalResources("es-cl").map((item) => ({ title: item.title, type: "document", url: item.href, usage: "/es-cl/downloads" }))
  ].filter((item) => (!filter || item.type === filter) &&
    (!query || [item.title, kinds[item.type], assetLink(item.url), item.usage].join(" ").toLowerCase().includes(query)));
  const { items, meta } = paginateList(assets, parseListPagination(params));
  return <section className="admin-panel">
    <div className="admin-page-head"><div><h1>媒体库</h1><p>查找产品图、文章封面和技术下载文件。</p></div></div>
    <AdminListControls searchLabel="搜索资源、页面或文件名" statusLabel="类型" allStatusLabel="全部类型"
      statusOptions={Object.entries(kinds).map(([value, label]) => ({ value, label }))} />
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>名称</th><th>类型</th><th>文件</th><th>使用位置</th></tr></thead><tbody>
      {items.map((asset, index) => {
        const link = assetLink(asset.url);
        return <tr key={asset.usage + asset.title + index}><td>{asset.title}</td><td>{kinds[asset.type]}</td>
          <td>{link ? <a className="admin-detail-link" href={link} target="_blank" rel="noopener noreferrer">打开文件</a> : "内嵌文件"}</td>
          <td>{asset.usage ? <a className="admin-detail-link" href={asset.usage} target="_blank" rel="noopener">查看页面</a> : "内部存档"}</td></tr>;
      })}
      {!items.length ? <tr><td colSpan="4">没有匹配的媒体资源。</td></tr> : null}
    </tbody></table></div>
    <AdminListPagination meta={meta} itemLabel="项资源" />
  </section>;
}

import Link from "next/link";
import { productCategories, products } from "@/data/catalog";
import { getProductDetailContent } from "@/data/productDetailContent";
import { productPresentation } from "@/data/productPresentation";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import { AdminListControls, AdminListPagination } from "@/components/admin/AdminListControls";
import { getAdminDateRange } from "@/lib/adminDateRange";
import { requireAdminSession } from "@/lib/adminAuth";
import { getCmsItem, getCmsItemsPage } from "@/lib/cmsStore";
import { paginateList, parseListPagination } from "@/lib/listPagination";
import { PRODUCT_LOCALIZATION_TYPE, productLocalizationKey, publicLocalization } from "@/lib/productLocalization";

const locales = { "es-cl": "智利西班牙语", en: "英语", "pt-br": "巴西葡萄牙语" };
const statusMessages = { draft: "草稿已保存。", publish: "文案已发布。", restore: "已恢复目录默认文案。" };

export const dynamic = "force-dynamic";
export const metadata = { title: "产品管理 | Cowinmagnet.cl" };

export default async function AdminProductsPage({ searchParams }) {
  await requireAdminSession();
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const locale = Object.hasOwn(locales, params?.locale) ? params.locale : "es-cl";
  const selected = products.find((item) => item.slug === params?.product);
  const [legacy, draft, current] = await Promise.all([
    getCmsItemsPage("product", { includeInactive: true, range, page: params?.page, pageSize: params?.pageSize, query: params?.query }),
    selected ? getCmsItem(PRODUCT_LOCALIZATION_TYPE, productLocalizationKey(locale, selected.slug, "draft")) : null,
    selected ? getCmsItem(PRODUCT_LOCALIZATION_TYPE, productLocalizationKey(locale, selected.slug)) : null
  ]);
  const live = selected ? publicLocalization(current, locale, selected.slug) : null;
  const input = draft && (!live || draft.updatedAt > live.updatedAt) ? draft : current;
  const base = selected ? getProductDetailContent(selected, locale) : null;
  const catalogQuery = typeof params?.catalogQuery === "string" ? params.catalogQuery.trim().slice(0, 120) : "";
  const items = products.filter((product) => (product.title + " " + product.slug).toLowerCase().includes(catalogQuery.toLowerCase()));
  const catalog = paginateList(items, parseListPagination({ page: params?.catalogPage }, { defaultPageSize: 25 }));
  const keep = { ...(catalogQuery ? { catalogQuery } : {}), ...(catalog.meta.page > 1 ? { catalogPage: String(catalog.meta.page) } : {}) };
  const href = (product, language = locale) => ({ pathname: "/admin/products", query: { ...keep, product, locale: language } });
  const category = (id) => productCategories.find((item) => item.slug === id)?.title || id;

  return <>
    <section className="admin-page-head"><div><h1>产品目录</h1><p>管理智利站各语言的产品名称、摘要和使用说明。</p></div></section>
    {params?.saved && statusMessages[params.saved] ? <p className="admin-alert good" role="status">{statusMessages[params.saved]}</p> : null}
    {params?.error ? <p className="admin-alert" role="alert">无法保存。请检查产品、语言及必填文案。</p> : null}
    {selected ? <section className="admin-panel admin-product-editor">
      <div className="admin-panel-head"><div><p className="eyebrow">{category(selected.category)}</p><h2>{selected.title}</h2></div>
        <a className="admin-detail-link" href={"/" + locale + "/products/" + selected.category + "/" + selected.slug} target="_blank" rel="noopener">查看前台</a></div>
      <nav className="admin-language-nav" aria-label="文案语言">{Object.entries(locales).map(([value, label]) =>
        <Link key={value} href={href(selected.slug, value)} aria-current={locale === value ? "page" : undefined}>{label}</Link>)}</nav>
      <p className="admin-copy-state">当前：{live ? "使用已发布文案" : "使用目录文案"}{draft && (!live || draft.updatedAt > live.updatedAt) ? " · 有待发布草稿" : ""}</p>
      <form className="admin-form admin-product-form" action="/api/admin/content/product-localizations" method="post" key={locale + selected.slug}>
        <input type="hidden" name="product" value={selected.slug} /><input type="hidden" name="locale" value={locale} />
        <label>产品名称<input name="title" required maxLength={140} defaultValue={input?.title || productPresentation(selected, locale).title} /></label>
        <label>采购摘要<textarea name="summary" required maxLength={280} rows={3} defaultValue={input?.summary || base.summary.slice(0, 280)} /></label>
        <label>工作原理或应用说明<textarea name="overview" maxLength={1600} rows={5} defaultValue={input?.overview ?? base.howItWorks} /></label>
        <div className="admin-product-actions">
          <button name="action" value="draft" type="submit">保存草稿</button>
          <button name="action" value="publish" type="submit">发布到前台</button>
          {live ? <button name="action" value="restore" type="submit" formNoValidate>恢复目录文案</button> : null}
        </div>
      </form>
      {draft && (!live || draft.updatedAt > live.updatedAt) ? <details className="admin-draft-preview">
        <summary>预览已保存草稿</summary><h3>{draft.title}</h3><p>{draft.summary}</p><p>{draft.overview}</p>
      </details> : null}
    </section> : null}
    <section className="admin-panel admin-list-section">
      <div className="admin-panel-head"><div><h2>在站目录</h2><p>型号、图片与技术参数随产品目录更新。</p></div></div>
      <form action="/admin/products" className="admin-list-controls">
        <input type="hidden" name="locale" value={locale} />
        <label className="admin-search-control">产品或型号<input name="catalogQuery" defaultValue={catalogQuery} maxLength={120} placeholder="如 RCYD" /></label>
        <button type="submit">查询</button>
      </form>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>产品名称</th><th>产品类别</th><th>操作</th></tr></thead>
        <tbody>{catalog.items.map((item) => <tr key={item.slug}><td>{item.title}</td><td>{category(item.category)}</td>
          <td><Link className="admin-detail-link" href={href(item.slug)} prefetch={false}>编辑文案</Link></td></tr>)}
          {!catalog.items.length ? <tr><td colSpan="3" className="admin-empty">未找到匹配产品。</td></tr> : null}
        </tbody></table></div>
      <AdminListPagination meta={catalog.meta} itemLabel="个产品" pageParam="catalogPage" />
    </section>
    <section className="admin-panel admin-list-section">
      <div className="admin-page-head compact"><div><h2>内部存档</h2><p>过去录入的产品记录，仅供查阅。</p></div><AdminDateRangeFilter range={range} /></div>
      <AdminListControls searchLabel="搜索存档产品名称或分类" />
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>产品名称</th><th>产品类别</th></tr></thead>
        <tbody>{legacy.items.map((item) => <tr key={item.slug}><td>{item.title}</td><td>{item.categoryTitle}</td></tr>)}
          {!legacy.items.length ? <tr><td colSpan="2" className="admin-empty">当前范围内没有存档。</td></tr> : null}
        </tbody></table></div>
      <AdminListPagination meta={legacy.meta} itemLabel="条存档" />
    </section>
  </>;
}

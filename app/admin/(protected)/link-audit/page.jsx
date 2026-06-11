import { productCategories, products, industries, markets, solutions } from "@/data/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "内外链审计 | Cowinmagnet LATAM" };

function internalLinks() {
  const base = [
    { title: "首页", url: "/es-cl", type: "核心页面" },
    { title: "产品总览", url: "/es-cl/products", type: "核心页面" },
    { title: "应用行业", url: "/es-cl/industries", type: "核心页面" },
    { title: "解决方案", url: "/es-cl/solutions", type: "核心页面" },
    { title: "报价页", url: "/es-cl/request-a-quote", type: "转化页面" }
  ];
  const categoryLinks = productCategories.map((item) => ({ title: item.title, url: `/es-cl/products/${item.slug}`, type: "产品分类" }));
  const productLinks = products.slice(0, 20).map((item) => ({ title: item.title, url: `/es-cl/products/${item.category}/${item.slug}`, type: "产品详情" }));
  const marketLinks = markets.map((item) => ({ title: item.title, url: `/es-cl/markets/${item.slug}`, type: "市场页面" }));
  const industryLinks = industries.map((item) => ({ title: item.title, url: `/es-cl/industries/${item.slug}`, type: "行业页面" }));
  const solutionLinks = solutions.map((item) => ({ title: item.title, url: `/es-cl/solutions/${item.slug}`, type: "方案页面" }));
  return [...base, ...categoryLinks, ...productLinks, ...marketLinks, ...industryLinks, ...solutionLinks];
}

export default function AdminLinkAuditPage() {
  const links = internalLinks();
  const externalLinks = [
    { title: "Cowinmagnet 主站产品源", url: "https://www.cowinmagnet.com/en/products", status: "已同步" },
    { title: "WhatsApp 联系入口", url: "https://wa.me/", status: "前台浮窗" },
    { title: "Google Search Console", url: "https://search.google.com/search-console", status: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ? "待拉取数据" : "未配置" }
  ];

  return (
    <section className="admin-panel">
      <div className="admin-page-head compact">
        <div>
          <p className="eyebrow">内外链审计</p>
          <h1>站内链接与外部来源检查</h1>
          <p>用于检查核心页面、产品页、市场页和外部数据源，避免上线后出现无意义跳转或断链。</p>
        </div>
      </div>
      <section className="admin-stats">
        <article><strong>{links.length}</strong><span>站内链接</span><small>当前索引</small></article>
        <article><strong>{productCategories.length}</strong><span>产品分类</span><small>主站同步</small></article>
        <article><strong>{products.length}</strong><span>产品详情</span><small>主站产品库</small></article>
        <article><strong>{externalLinks.length}</strong><span>外部入口</span><small>需上线复核</small></article>
      </section>
      <section className="admin-grid">
        <article>
          <h3>站内链接</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>页面</th><th>URL</th><th>类型</th></tr></thead>
              <tbody>{links.map((link) => <tr key={link.url}><td>{link.title}</td><td>{link.url}</td><td>{link.type}</td></tr>)}</tbody>
            </table>
          </div>
        </article>
        <article>
          <h3>外部链接</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>名称</th><th>URL</th><th>状态</th></tr></thead>
              <tbody>{externalLinks.map((link) => <tr key={link.url}><td>{link.title}</td><td>{link.url}</td><td>{link.status}</td></tr>)}</tbody>
            </table>
          </div>
        </article>
      </section>
    </section>
  );
}

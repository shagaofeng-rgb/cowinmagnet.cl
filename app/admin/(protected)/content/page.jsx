import Link from "next/link";
import { products, productCategories } from "@/data/catalog";
import { getPublishedPosts } from "@/data/blog";
import { cmsStorageMode, getCmsItems } from "@/lib/cmsStore";

const t = {
  eyebrow: "\u5185\u5bb9\u603b\u89c8",
  title: "\u4ea7\u54c1\u3001\u65b0\u95fb\u548c\u7ad9\u5185\u5185\u5bb9\u7ba1\u7406",
  desc: "\u6c47\u603b\u5357\u7f8e\u7ad9\u524d\u53f0\u5185\u5bb9\u548c\u540e\u53f0 CMS \u5185\u5bb9\uff0c\u7528\u4e8e\u68c0\u67e5\u53d1\u5e03\u72b6\u6001\u548c\u5185\u5bb9\u7ef4\u62a4\u3002",
  staticProducts: "\u4e3b\u7ad9\u4ea7\u54c1",
  categories: "\u4e2a\u5206\u7c7b",
  cmsProducts: "\u540e\u53f0\u4ea7\u54c1",
  productNote: "\u53ef\u53d1\u5e03\u3001\u4e0b\u67b6\u3001\u5220\u9664",
  cmsNews: "News \u65b0\u95fb",
  newsNote: "\u81ea\u52a8\u91c7\u7f16\u548c\u4eba\u5de5\u53d1\u5e03",
  blog: "Blog \u6587\u7ae0",
  blogNote: "\u9759\u6001\u5185\u5bb9\u5e93",
  storage: "CMS \u5b58\u50a8",
  storageNote: "\u4ea7\u54c1\u3001\u65b0\u95fb\u3001\u8be2\u76d8\u548c\u7edf\u8ba1\u6570\u636e\u6309\u751f\u4ea7\u73af\u5883\u914d\u7f6e\u5199\u5165\u6570\u636e\u5e93\u3002"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminContentPage() {
  const [cmsProducts, cmsNews, posts] = await Promise.all([
    getCmsItems("product", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true }),
    getPublishedPosts("es-cl")
  ]);

  const cards = [
    { label: t.staticProducts, value: products.length, note: `${productCategories.length} ${t.categories}`, href: "/admin/products" },
    { label: t.cmsProducts, value: cmsProducts.length, note: t.productNote, href: "/admin/products" },
    { label: t.cmsNews, value: cmsNews.length, note: t.newsNote, href: "/admin/news" },
    { label: t.blog, value: posts.length, note: t.blogNote, href: "/admin/news" }
  ];

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>
      </section>
      <section className="admin-grid four">
        {cards.map((card) => (
          <Link className="admin-card" href={card.href} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </Link>
        ))}
      </section>
      <section className="admin-panel">
        <p className="eyebrow">{t.storage}</p>
        <h2>{cmsStorageMode()}</h2>
        <p className="admin-muted">{t.storageNote}</p>
      </section>
    </>
  );
}

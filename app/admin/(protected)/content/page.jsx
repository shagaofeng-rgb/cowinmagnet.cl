import Link from "next/link";
import { products, productCategories } from "@/data/catalog";
import { getPublishedPosts } from "@/data/blog";
import { cmsStorageMode, getCmsItems } from "@/lib/cmsStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "内容总览 | Cowinmagnet.cl Admin" };

export default async function AdminContentPage() {
  const [cmsProducts, cmsNews, posts] = await Promise.all([
    getCmsItems("product", { includeInactive: true }),
    getCmsItems("news", { includeInactive: true }),
    getPublishedPosts("es-cl")
  ]);

  const cards = [
    { label: "静态产品", value: products.length, note: `${productCategories.length} 个分类`, href: "/admin/products" },
    { label: "后台产品", value: cmsProducts.length, note: "可发布、下架、删除", href: "/admin/products" },
    { label: "News 新闻", value: cmsNews.length, note: "自动采编和人工发布", href: "/admin/news" },
    { label: "Blog 文章", value: posts.length, note: "静态内容库", href: "/admin/news" }
  ];

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">内容总览</p>
          <h1>产品、新闻和站内内容管理</h1>
          <p>这里汇总南美站前台内容和后台 CMS 内容，方便检查发布状态和后续维护。</p>
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
        <p className="eyebrow">CMS 存储</p>
        <h2>{cmsStorageMode()}</h2>
        <p className="admin-muted">线上环境使用 DATABASE_URL 后，产品、新闻、询盘和统计数据都会写入数据库；本地预览则使用本地文件兜底。</p>
      </section>
    </>
  );
}

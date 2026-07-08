import { getAnalyticsSnapshot, getLatestSyncStatus } from "@/lib/analyticsStore";
import { cmsStorageMode } from "@/lib/cmsStore";
import { enquiryStorageMode } from "@/lib/enquiryStore";
import AdminSyncStatus from "@/components/admin/AdminSyncStatus";

export const dynamic = "force-dynamic";
export const metadata = { title: "数据同步 | Cowinmagnet.cl 后台" };

export default async function AdminSyncPage() {
  const [syncStatus, analytics] = await Promise.all([
    getLatestSyncStatus(),
    getAnalyticsSnapshot({ startDate: new Date(Date.now() - 86400000), endDate: new Date() })
  ]);

  const sources = [
    { name: "客户表单", configured: "已配置", storage: enquiryStorageMode(), schedule: "实时写入", status: "正常" },
    { name: "访问分析", configured: "已配置", storage: analytics.storageMode, schedule: "每 30 分钟", status: syncStatus.status || "waiting" },
    { name: "内容 CMS", configured: "已配置", storage: cmsStorageMode(), schedule: "保存后立即生效", status: "正常" },
    { name: "Google Search Console", configured: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ? "已配置" : "未配置", storage: "Google API", schedule: "按需读取 / 可扩展 Cron", status: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ? "已接入" : "待配置" },
    { name: "新闻自动采编", configured: "已配置", storage: cmsStorageMode(), schedule: "每天 4 次", status: "Cron 已配置" }
  ];

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">数据同步</p>
          <h1>数据源配置与同步状态</h1>
          <p>所有外部或内部同步都通过服务端 API、Cron 或数据库持久化执行，不依赖管理员保持浏览器打开。</p>
        </div>
      </section>
      <AdminSyncStatus initialStatus={{ ...syncStatus, intervalMinutes: 30, analytics: analytics.storageMode }} />
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>数据源</th><th>配置状态</th><th>存储</th><th>同步频率</th><th>状态</th></tr></thead>
            <tbody>{sources.map((source) => <tr key={source.name}><td>{source.name}</td><td>{source.configured}</td><td>{source.storage}</td><td>{source.schedule}</td><td>{source.status}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

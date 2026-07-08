import { getAnalyticsSnapshot, getLatestSyncStatus } from "@/lib/analyticsStore";
import { cmsStorageMode } from "@/lib/cmsStore";
import { enquiryStorageMode } from "@/lib/enquiryStore";
import AdminSyncStatus from "@/components/admin/AdminSyncStatus";

const t = {
  eyebrow: "\u6570\u636e\u540c\u6b65",
  title: "\u6570\u636e\u6e90\u914d\u7f6e\u4e0e\u540c\u6b65\u72b6\u6001",
  desc: "\u5916\u90e8\u548c\u5185\u90e8\u6570\u636e\u540c\u6b65\u901a\u8fc7\u670d\u52a1\u7aef API\u3001Cron \u548c\u6570\u636e\u5e93\u6301\u4e45\u5316\u6267\u884c\u3002",
  source: "\u6570\u636e\u6e90",
  configured: "\u914d\u7f6e\u72b6\u6001",
  storage: "\u5b58\u50a8",
  schedule: "\u540c\u6b65\u9891\u7387",
  status: "\u72b6\u6001",
  yes: "\u5df2\u914d\u7f6e",
  no: "\u672a\u914d\u7f6e",
  normal: "\u6b63\u5e38",
  connected: "\u5df2\u63a5\u5165",
  pending: "\u5f85\u914d\u7f6e",
  forms: "\u5ba2\u6237\u8868\u5355",
  analytics: "\u8bbf\u95ee\u5206\u6790",
  cms: "\u5185\u5bb9 CMS",
  news: "\u65b0\u95fb\u81ea\u52a8\u91c7\u7f16",
  realtime: "\u5b9e\u65f6\u5199\u5165",
  halfHour: "\u6bcf 30 \u5206\u949f",
  saveNow: "\u4fdd\u5b58\u540e\u7acb\u5373\u751f\u6548",
  daily: "\u6bcf\u5929 4 \u6b21"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminSyncPage() {
  const [syncStatus, analytics] = await Promise.all([
    getLatestSyncStatus(),
    getAnalyticsSnapshot({ startDate: new Date(Date.now() - 86400000), endDate: new Date() })
  ]);

  const gscConfigured = Boolean(process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL);
  const sources = [
    { name: t.forms, configured: t.yes, storage: enquiryStorageMode(), schedule: t.realtime, status: t.normal },
    { name: t.analytics, configured: t.yes, storage: analytics.storageMode, schedule: t.halfHour, status: syncStatus.status || "waiting" },
    { name: t.cms, configured: t.yes, storage: cmsStorageMode(), schedule: t.saveNow, status: t.normal },
    { name: "Google Search Console", configured: gscConfigured ? t.yes : t.no, storage: "Google API", schedule: t.halfHour, status: gscConfigured ? t.connected : t.pending },
    { name: t.news, configured: t.yes, storage: cmsStorageMode(), schedule: t.daily, status: "Cron" }
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
      <AdminSyncStatus initialStatus={{ ...syncStatus, intervalMinutes: 30, analytics: analytics.storageMode }} />
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>{t.source}</th><th>{t.configured}</th><th>{t.storage}</th><th>{t.schedule}</th><th>{t.status}</th></tr></thead>
            <tbody>{sources.map((source) => <tr key={source.name}><td>{source.name}</td><td>{source.configured}</td><td>{source.storage}</td><td>{source.schedule}</td><td>{source.status}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

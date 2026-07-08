import { getLatestSyncStatus } from "@/lib/analyticsStore";
import { cmsStorageMode } from "@/lib/cmsStore";
import { enquiryStorageMode } from "@/lib/enquiryStore";

const t = {
  title: "\u64cd\u4f5c\u65e5\u5fd7",
  heading: "\u5ba1\u8ba1\u4e0e\u5173\u952e\u64cd\u4f5c\u8bb0\u5f55",
  desc: "\u8bb0\u5f55\u540e\u53f0\u5173\u952e\u6570\u636e\u6e90\u3001\u540c\u6b65\u8fd0\u884c\u548c\u5b58\u50a8\u72b6\u6001\u3002",
  module: "\u6a21\u5757",
  action: "\u64cd\u4f5c",
  object: "\u5bf9\u8c61",
  result: "\u7ed3\u679c",
  time: "\u65f6\u95f4",
  dataSync: "\u6570\u636e\u540c\u6b65",
  latestSync: "\u6700\u8fd1\u540c\u6b65",
  storageStatus: "\u5b58\u50a8\u72b6\u6001",
  enquiries: "\u8be2\u76d8"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.title} | Cowinmagnet.cl` };

export default async function AdminAuditLogsPage() {
  const sync = await getLatestSyncStatus();
  const rows = [
    { module: t.dataSync, action: t.latestSync, object: "analytics-sync", result: sync.status || "waiting", time: sync.finishedAt || "-" },
    { module: "CMS", action: t.storageStatus, object: "cms_items", result: cmsStorageMode(), time: "-" },
    { module: t.enquiries, action: t.storageStatus, object: "enquiries", result: enquiryStorageMode(), time: "-" }
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
          <thead><tr><th>{t.module}</th><th>{t.action}</th><th>{t.object}</th><th>{t.result}</th><th>{t.time}</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={`${row.module}-${row.action}`}><td>{row.module}</td><td>{row.action}</td><td>{row.object}</td><td>{row.result}</td><td>{row.time}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

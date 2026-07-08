import { getLatestSyncStatus } from "@/lib/analyticsStore";
import { cmsStorageMode } from "@/lib/cmsStore";
import { enquiryStorageMode } from "@/lib/enquiryStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "操作日志 | Cowinmagnet.cl 后台" };

export default async function AdminAuditLogsPage() {
  const sync = await getLatestSyncStatus();
  const rows = [
    { module: "数据同步", action: "最近同步", object: "analytics-sync", result: sync.status || "waiting", time: sync.finishedAt || "-" },
    { module: "CMS", action: "存储状态", object: "cms_items", result: cmsStorageMode(), time: "-" },
    { module: "询盘", action: "存储状态", object: "enquiries", result: enquiryStorageMode(), time: "-" }
  ];

  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">操作日志</p>
          <h1>审计与关键操作记录</h1>
          <p>当前页面展示系统关键状态日志。下一阶段可将登录、导出、发布、删除等操作持久化为独立 AuditLog 表。</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>模块</th><th>操作</th><th>对象</th><th>结果</th><th>时间</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={`${row.module}-${row.action}`}><td>{row.module}</td><td>{row.action}</td><td>{row.object}</td><td>{row.result}</td><td>{row.time}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

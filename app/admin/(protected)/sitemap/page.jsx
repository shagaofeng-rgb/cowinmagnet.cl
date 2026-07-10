import AdminSitemapActions from "@/components/admin/AdminSitemapActions";
import { getSitemapStatus } from "@/lib/sitemapManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sitemap 管理 | Cowinmagnet.cl" };

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Shanghai" }).format(new Date(value)) : "-";
}

export default async function SitemapAdminPage() {
  const status = await getSitemapStatus();
  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">SEO 基础设施</p>
          <h1>Sitemap 管理</h1>
          <p>查看公开 Sitemap、URL 变更、每日一致性检查和 Google Search Console 提交结果。</p>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head"><div><p className="eyebrow">手动任务</p><h2>生成与提交</h2></div></div>
        <AdminSitemapActions />
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head"><div><p className="eyebrow">当前文件</p><h2>公开 Sitemap</h2></div><span>存储：{status.storage}</span></div>
        <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>文件</th><th>URL 数量</th><th>大小</th><th>更新时间</th></tr></thead>
            <tbody>{status.snapshots.map((item) => <tr key={item.file_name}><td><a href={item.file_name === "sitemap.xml" ? "/sitemap.xml" : `/sitemaps/${item.file_name}`} target="_blank" rel="noreferrer">{item.file_name}</a></td><td>{item.url_count}</td><td>{Math.ceil(Number(item.byte_size || 0) / 1024)} KB</td><td>{formatDate(item.generated_at)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head"><div><p className="eyebrow">执行日志</p><h2>最近 20 次任务</h2></div></div>
        <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>开始时间</th><th>触发方式</th><th>状态</th><th>URL</th><th>变更</th><th>Google 提交</th><th>耗时</th></tr></thead>
            <tbody>{status.runs.map((run) => <tr key={run.id}><td>{formatDate(run.started_at || run.startedAt)}</td><td>{run.trigger_type || run.trigger}</td><td>{run.status}</td><td>{run.processed_count ?? run.processedCount}</td><td>+{(run.added_urls || run.added || []).length} / ~{(run.modified_urls || run.modified || []).length} / -{(run.deleted_urls || run.deleted || []).length}</td><td>{run.submitted ? "成功" : run.submission_result?.error || run.submissionResult?.error || "未提交"}</td><td>{run.duration_ms ?? run.durationMs} ms</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

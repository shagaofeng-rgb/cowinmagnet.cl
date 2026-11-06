import { getLatestSyncStatus, getLatestSearchConsoleSyncStatus } from "@/lib/analyticsStore";
import { getCmsItemsPage } from "@/lib/cmsStore";
import { getEnquiryNotificationSummary } from "@/lib/enquiryStore";
import { isInquiryEmailConfigured } from "@/lib/inquiryEmail";
import { getLatestWeeklySitemapRun } from "@/lib/sitemapManager";

export async function getOperationsStatus() {
  const checks = [
    ["traffic", async () => {
      const run = await getLatestSyncStatus();
      return { state: run.status, at: run.finishedAt, count: run.id ? run.processedCount : null };
    }],
    ["search", async () => {
      const run = await getLatestSearchConsoleSyncStatus();
      return { state: run.status, at: run.finishedAt, dataThrough: run.rangeEnd?.slice(0, 10), sitemapLastRead: run.sitemapLastRead, sitemapReadStatus: run.sitemapReadStatus };
    }],
    ["sitemap", async () => {
      const run = await getLatestWeeklySitemapRun();
      if (!run) return { state: "waiting" };
      const skipped = run.submission_result?.skipped && ["already-submitted-this-week", "outside-weekly-window"].includes(run.submission_result?.reason);
      return { state: run.submitted ? "success" : skipped ? "waiting" : "error", at: run.finished_at, count: run.processed_count };
    }],
    ["content", async () => {
      const result = await getCmsItemsPage("blog", { pageSize: 25 });
      const item = result.items[0];
      return { state: item ? "success" : "waiting", at: item?.updatedAt || item?.publishedAt, count: result.meta.total };
    }],
    ["mail", async () => {
      const result = await getEnquiryNotificationSummary();
      const state = !isInquiryEmailConfigured() ? "unavailable" : result.failed ? "error" : result.pending ? "waiting" : "success";
      return { state, at: result.latest, pending: result.pending, failed: result.failed, delivered: result.delivered };
    }]
  ];
  const settled = await Promise.allSettled(checks.map(([, check]) => check()));
  return Object.fromEntries(checks.map(([key], index) => {
    const result = settled[index];
    if (result.status === "fulfilled") return [key, result.value];
    console.error("[admin/operations-status] " + key, result.reason?.message);
    return [key, { state: "error" }];
  }));
}

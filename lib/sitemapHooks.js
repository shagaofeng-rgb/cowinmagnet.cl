import { after } from "next/server";
import { runSitemapJob } from "@/lib/sitemapManager";

export function queueSitemapRefresh(trigger = "content-change") {
  after(async () => {
    // A publication refresh makes a new canonical URL available immediately.
    // The sitemap job records the API result and enforces the 72-hour limit.
    const result = await runSitemapJob({ trigger, submit: true });
    if (!result.success && !result.locked) console.error("[sitemap-hook] refresh failed", result.error);
  });
}

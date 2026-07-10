import { after } from "next/server";
import { runSitemapJob } from "@/lib/sitemapManager";

export function queueSitemapRefresh(trigger = "content-change") {
  after(async () => {
    const result = await runSitemapJob({ trigger, submit: true });
    if (!result.success && !result.locked) console.error("[sitemap-hook] refresh failed", result.error);
  });
}

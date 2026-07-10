const args = new Set(process.argv.slice(2));
const baseUrl = (process.env.SITE_URL || "https://cowinmagnet.cl").replace(/\/$/, "");
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("CRON_SECRET is required. Load the production environment before running this command.");
  process.exit(1);
}

const url = new URL("/api/cron/sitemap", baseUrl);
url.searchParams.set("trigger", "cli-manual");
if (args.has("--force")) url.searchParams.set("force", "true");
if (args.has("--dry-run")) url.searchParams.set("dryRun", "true");
if (args.has("--submit")) url.searchParams.set("submit", "true");
else url.searchParams.set("submit", "false");

const response = await fetch(url, { headers: { authorization: `Bearer ${secret}` } });
const result = await response.json().catch(() => ({}));
if (!response.ok || !result.success) {
  console.error(result.error || `Sitemap command failed with HTTP ${response.status}`);
  process.exit(1);
}

if (args.has("--verbose")) console.log(JSON.stringify(result, null, 2));
else {
  const run = result.run;
  console.log(`Sitemap completed: ${run.processedCount} URLs, +${run.added.length}, ~${run.modified.length}, -${run.deleted.length}, submitted=${run.submitted}.`);
}

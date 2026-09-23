// Run intentionally with a DATABASE_URL available, before a production release:
//   ALLOW_RUNTIME_SCHEMA_MIGRATIONS=true node scripts/migrate-database.mjs
// The application never performs this DDL on a customer request.
process.env.ALLOW_RUNTIME_SCHEMA_MIGRATIONS = "true";

const [{ getCmsContentSummary }, { getEnquiriesPage }, { getAnalyticsHealthSummary }, { getDatabasePool }] = await Promise.all([
  import("../lib/cmsStore.js"),
  import("../lib/enquiryStore.js"),
  import("../lib/analyticsStore.js"),
  import("../lib/database.js")
]);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run database migrations.");
}

const prefix = String(process.env.CMS_TABLE_PREFIX || "cowinmagnet_cl").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
const cmsTable = `${prefix}_cms_items`;
const enquiriesTable = `${prefix}_enquiries`;
const analyticsTable = `${prefix}_analytics_events`;

// Create the existing schema first, then add only idempotent read-path indexes.
await getCmsContentSummary();
await getEnquiriesPage({ page: 1, pageSize: 25 });
await getAnalyticsHealthSummary({ startDate: new Date(0), endDate: new Date() });

const db = getDatabasePool();
await db.query(`CREATE INDEX IF NOT EXISTS ${cmsTable}_site_type_updated_idx ON ${cmsTable} (site_id, type, updated_at DESC)`);
await db.query(`CREATE INDEX IF NOT EXISTS ${analyticsTable}_active_type_date_idx ON ${analyticsTable} (is_excluded, type, created_at DESC)`);
await db.query(`CREATE INDEX IF NOT EXISTS ${enquiriesTable}_notification_queue_idx ON ${enquiriesTable} ((COALESCE(payload->'notification'->>'status', 'pending')), ((COALESCE(payload->'notification'->>'attempts', '0'))::int), created_at ASC) WHERE COALESCE(payload->'notification'->>'status', 'pending') IN ('pending', 'failed', 'processing')`);

console.log("Database migration completed successfully.");

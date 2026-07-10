import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { productCategories, products, industries, markets, chileRegions, solutions } from "@/data/catalog";
import { staticPosts } from "@/data/blog";
import { locales } from "@/data/site";
import { getCmsItems } from "@/lib/cmsStore";
import { databaseSsl, databaseUrl } from "@/lib/database";
import { submitSitemapToSearchConsole } from "@/lib/googleSearchConsole";
import {
  atomicWriteFile,
  buildSitemapIndex,
  buildUrlset,
  normalizePublicEntry,
  reconcileEntries,
  splitSitemapEntries,
  validateSitemapXml,
  withFileLock
} from "@/lib/sitemapCore.mjs";

const { Pool } = pg;
const BASE_URL = (process.env.SITE_URL || "https://cowinmagnet.cl").replace(/\/$/, "");
const DEFAULT_CONTENT_DATE = process.env.SITE_CONTENT_UPDATED_AT || "2026-07-10T00:00:00.000Z";
const TABLE_PREFIX = String(process.env.CMS_TABLE_PREFIX || "cowinmagnet_cl").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
const URL_TABLE = `${TABLE_PREFIX}_sitemap_urls`;
const SNAPSHOT_TABLE = `${TABLE_PREFIX}_sitemap_snapshots`;
const RUN_TABLE = `${TABLE_PREFIX}_sitemap_runs`;
const LOCK_TABLE = `${TABLE_PREFIX}_sitemap_locks`;
const SCHEMA_LOCK_ID = 52402004;
const LOCAL_DIR = process.env.VERCEL ? path.join("/tmp", "cowinmagnet-sitemap") : path.join(process.cwd(), ".data", "sitemap");
const LOCAL_STATE = path.join(LOCAL_DIR, "state.json");
const LOCAL_LOCK = path.join(LOCAL_DIR, "generate.lock");

let pool;
let schemaReady = false;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl(),
      ssl: databaseSsl(),
      max: 3,
      connectionTimeoutMillis: 15_000,
      idleTimeoutMillis: 30_000,
      statement_timeout: 45_000,
      query_timeout: 45_000
    });
  }
  return pool;
}

async function ensureSchema(client) {
  if (schemaReady) return;
  await client.query("SELECT pg_advisory_lock($1)", [SCHEMA_LOCK_ID]);
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${URL_TABLE} (
        url TEXT PRIMARY KEY,
        group_name TEXT NOT NULL,
        fingerprint TEXT NOT NULL,
        lastmod TIMESTAMPTZ NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS ${URL_TABLE}_group_idx ON ${URL_TABLE} (group_name, active)`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SNAPSHOT_TABLE} (
        file_name TEXT PRIMARY KEY,
        xml TEXT NOT NULL,
        checksum TEXT NOT NULL,
        url_count INTEGER NOT NULL DEFAULT 0,
        byte_size INTEGER NOT NULL DEFAULT 0,
        generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${RUN_TABLE} (
        id TEXT PRIMARY KEY,
        trigger_type TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at TIMESTAMPTZ NOT NULL,
        finished_at TIMESTAMPTZ NOT NULL,
        duration_ms INTEGER NOT NULL,
        processed_count INTEGER NOT NULL DEFAULT 0,
        success_count INTEGER NOT NULL DEFAULT 0,
        skipped_count INTEGER NOT NULL DEFAULT 0,
        error_count INTEGER NOT NULL DEFAULT 0,
        added_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
        modified_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
        deleted_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
        files JSONB NOT NULL DEFAULT '[]'::jsonb,
        split BOOLEAN NOT NULL DEFAULT FALSE,
        submitted BOOLEAN NOT NULL DEFAULT FALSE,
        submission_result JSONB,
        error_message TEXT
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS ${RUN_TABLE}_started_idx ON ${RUN_TABLE} (started_at DESC)`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${LOCK_TABLE} (
        lock_name TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        locked_until TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    schemaReady = true;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [SCHEMA_LOCK_ID]).catch(() => {});
  }
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function checksum(value) {
  return crypto.createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(stable(value))).digest("hex");
}

function candidate(group, pathname, content, lastmod = DEFAULT_CONTENT_DATE, extra = {}) {
  return {
    group,
    url: `${BASE_URL}${pathname}`,
    fingerprint: checksum({ pathname, content }),
    lastmod,
    status: "published",
    canonical: true,
    ...extra
  };
}

async function collectCandidates() {
  const cmsProducts = await getCmsItems("product", { includeInactive: true });
  const cmsNews = await getCmsItems("news", { includeInactive: true });
  const pagePaths = ["", "products", "industries", "solutions", "markets", "technical-support", "downloads", "about", "news", "contact", "request-a-quote"];
  const groups = { pages: [], categories: [], products: [], posts: [] };

  for (const locale of locales) {
    for (const pagePath of pagePaths) {
      const pathname = `/${locale}${pagePath ? `/${pagePath}` : ""}`;
      groups.pages.push(candidate("pages", pathname, { locale, pagePath }));
    }
    for (const industry of industries) groups.pages.push(candidate("pages", `/${locale}/industries/${industry.slug}`, { locale, industry }));
    for (const solution of solutions) groups.pages.push(candidate("pages", `/${locale}/solutions/${solution.slug}`, { locale, solution }));
    for (const market of markets) groups.pages.push(candidate("pages", `/${locale}/markets/${market.slug}`, { locale, market }));
    for (const region of chileRegions) groups.pages.push(candidate("pages", `/${locale}/markets/chile/${region.slug}`, { locale, region }));

    for (const category of productCategories) {
      groups.categories.push(candidate("categories", `/${locale}/products/${category.slug}`, { locale, category }));
    }
    for (const product of products) {
      groups.products.push(candidate("products", `/${locale}/products/${product.category}/${product.slug}`, { locale, product }));
    }
    for (const item of cmsProducts) {
      if (item.status !== "published") continue;
      const category = item.categoryId || "uploaded-products";
      groups.products.push(candidate("products", `/${locale}/products/${category}/${item.slug}`, { locale, item }, item.updatedAt || item.publishedAt || item.createdAt));
    }

    for (const post of staticPosts) {
      groups.posts.push(candidate("posts", `/${locale}/news/${post.slug}`, { locale, post }, post.publishedAt || post.date));
    }
    for (const item of cmsNews) {
      if (item.status !== "published") continue;
      groups.posts.push(candidate("posts", `/${locale}/news/${item.slug}`, { locale, item }, item.updatedAt || item.publishedAt || item.createdAt));
    }
  }

  const seen = new Set();
  for (const key of Object.keys(groups)) {
    groups[key] = groups[key].filter((item) => {
      const normalized = normalizePublicEntry(item, BASE_URL);
      if (!normalized || seen.has(normalized.url)) return false;
      seen.add(normalized.url);
      Object.assign(item, normalized);
      return true;
    });
  }
  return groups;
}

function makeDocuments(resolvedGroups, previousSnapshots, now) {
  const previous = new Map(previousSnapshots.map((item) => [item.file_name, item]));
  const children = [];
  let split = false;

  for (const [group, entries] of Object.entries(resolvedGroups)) {
    const chunks = splitSitemapEntries(entries);
    if (chunks.length > 1) split = true;
    chunks.forEach((chunk, index) => {
      const fileName = chunks.length === 1 ? `sitemap-${group}.xml` : `sitemap-${group}-${index + 1}.xml`;
      const xml = buildUrlset(chunk);
      if (!validateSitemapXml(xml, "urlset")) throw new Error(`Generated XML failed validation: ${fileName}`);
      const hash = checksum(xml);
      const old = previous.get(fileName);
      children.push({
        fileName,
        xml,
        checksum: hash,
        urlCount: chunk.length,
        byteSize: Buffer.byteLength(xml, "utf8"),
        generatedAt: old?.checksum === hash ? new Date(old.generated_at).toISOString() : now
      });
    });
  }

  const indexXml = buildSitemapIndex(children.map((item) => ({ url: `${BASE_URL}/sitemaps/${item.fileName}`, lastmod: item.generatedAt })));
  if (!validateSitemapXml(indexXml, "sitemapindex")) throw new Error("Generated sitemap index failed validation.");
  const indexHash = checksum(indexXml);
  const oldIndex = previous.get("sitemap.xml");
  const index = {
    fileName: "sitemap.xml",
    xml: indexXml,
    checksum: indexHash,
    urlCount: children.length,
    byteSize: Buffer.byteLength(indexXml, "utf8"),
    generatedAt: oldIndex?.checksum === indexHash ? new Date(oldIndex.generated_at).toISOString() : now
  };
  return { documents: [index, ...children], split };
}

function summarizeRun({ id, trigger, startedAt, finishedAt, resolved, documents, split, submission, dryRun, changed }) {
  const processed = Object.values(resolved.groups).reduce((sum, entries) => sum + entries.length, 0);
  return {
    id,
    trigger,
    status: "success",
    startedAt,
    finishedAt,
    durationMs: new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
    processedCount: processed,
    successCount: processed,
    skippedCount: 0,
    errorCount: 0,
    added: resolved.added,
    modified: resolved.modified,
    deleted: resolved.deleted,
    files: documents.map((item) => ({ name: item.fileName, urlCount: item.urlCount, byteSize: item.byteSize, lastmod: item.generatedAt })),
    split,
    changed,
    dryRun,
    submitted: Boolean(submission?.success),
    submissionResult: submission || null
  };
}

async function submitIfRequested(submit) {
  if (!submit) return null;
  return submitSitemapToSearchConsole(`${BASE_URL}/sitemap.xml`);
}

async function runDatabaseJob(options) {
  const db = getPool();
  const client = await db.connect();
  const startedAt = new Date().toISOString();
  const id = `sitemap-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  let locked = false;
  try {
    await ensureSchema(client);
    const lockResult = await client.query(`
      INSERT INTO ${LOCK_TABLE} (lock_name, owner_id, locked_until, updated_at)
      VALUES ('generate', $1, NOW() + INTERVAL '2 minutes', NOW())
      ON CONFLICT (lock_name) DO UPDATE SET
        owner_id = EXCLUDED.owner_id,
        locked_until = EXCLUDED.locked_until,
        updated_at = NOW()
      WHERE ${LOCK_TABLE}.locked_until < NOW()
      RETURNING owner_id
    `, [id]);
    locked = lockResult.rows[0]?.owner_id === id;
    if (!locked) return { success: false, locked: true, error: "Sitemap generation is already running." };

    const [stateResult, snapshotResult, groups] = await Promise.all([
      client.query(`SELECT url, group_name, fingerprint, lastmod, active FROM ${URL_TABLE}`),
      client.query(`SELECT file_name, checksum, generated_at FROM ${SNAPSHOT_TABLE}`),
      collectCandidates()
    ]);
    const now = new Date().toISOString();
    const resolved = reconcileEntries(groups, stateResult.rows, now);
    const { documents, split } = makeDocuments(resolved.groups, snapshotResult.rows, now);
    const changed = Boolean(resolved.added.length || resolved.modified.length || resolved.deleted.length || options.force);

    if (!options.dryRun) {
      await client.query("BEGIN");
      try {
        const allEntries = Object.values(resolved.groups).flat();
        if (allEntries.length) await client.query(`
          INSERT INTO ${URL_TABLE} (url, group_name, fingerprint, lastmod, active, updated_at)
          SELECT item.url, item.group_name, item.fingerprint, item.lastmod::timestamptz, TRUE, NOW()
          FROM jsonb_to_recordset($1::jsonb) AS item(url text, group_name text, fingerprint text, lastmod text)
          ON CONFLICT (url) DO UPDATE SET
            group_name = EXCLUDED.group_name,
            fingerprint = EXCLUDED.fingerprint,
            lastmod = EXCLUDED.lastmod,
            active = TRUE,
            updated_at = NOW()
        `, [JSON.stringify(allEntries.map((item) => ({ url: item.url, group_name: item.group, fingerprint: item.fingerprint, lastmod: item.lastmod })))]);
        if (resolved.deleted.length) {
          await client.query(`UPDATE ${URL_TABLE} SET active = FALSE, updated_at = NOW() WHERE url = ANY($1::text[])`, [resolved.deleted]);
        }
        await client.query(`
          INSERT INTO ${SNAPSHOT_TABLE} (file_name, xml, checksum, url_count, byte_size, generated_at)
          SELECT item.file_name, item.xml, item.checksum, item.url_count, item.byte_size, item.generated_at::timestamptz
          FROM jsonb_to_recordset($1::jsonb) AS item(file_name text, xml text, checksum text, url_count integer, byte_size integer, generated_at text)
          ON CONFLICT (file_name) DO UPDATE SET
            xml = EXCLUDED.xml,
            checksum = EXCLUDED.checksum,
            url_count = EXCLUDED.url_count,
            byte_size = EXCLUDED.byte_size,
            generated_at = CASE WHEN ${SNAPSHOT_TABLE}.checksum = EXCLUDED.checksum THEN ${SNAPSHOT_TABLE}.generated_at ELSE EXCLUDED.generated_at END
        `, [JSON.stringify(documents.map((doc) => ({ file_name: doc.fileName, xml: doc.xml, checksum: doc.checksum, url_count: doc.urlCount, byte_size: doc.byteSize, generated_at: doc.generatedAt })))]);
        const fileNames = documents.map((item) => item.fileName);
        await client.query(`DELETE FROM ${SNAPSHOT_TABLE} WHERE NOT (file_name = ANY($1::text[]))`, [fileNames]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    const submission = options.dryRun ? null : await submitIfRequested(options.submit && (changed || options.force));
    const finishedAt = new Date().toISOString();
    const run = summarizeRun({ id, trigger: options.trigger, startedAt, finishedAt, resolved, documents, split, submission, dryRun: options.dryRun, changed });
    if (!options.dryRun) {
      await client.query(`
        INSERT INTO ${RUN_TABLE} (id, trigger_type, status, started_at, finished_at, duration_ms, processed_count, success_count, skipped_count, error_count, added_urls, modified_urls, deleted_urls, files, split, submitted, submission_result)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      `, [run.id, run.trigger, run.status, run.startedAt, run.finishedAt, run.durationMs, run.processedCount, run.successCount, run.skippedCount, run.errorCount, JSON.stringify(run.added), JSON.stringify(run.modified), JSON.stringify(run.deleted), JSON.stringify(run.files), run.split, run.submitted, run.submissionResult ? JSON.stringify(run.submissionResult) : null]);
    }
    console.log("[sitemap]", JSON.stringify({ ...run, added: run.added.length, modified: run.modified.length, deleted: run.deleted.length }));
    return { success: true, run };
  } catch (error) {
    const finishedAt = new Date().toISOString();
    console.error("[sitemap] failed", { id, trigger: options.trigger, error: error?.message || String(error) });
    if (schemaReady) {
      await client.query(`
        INSERT INTO ${RUN_TABLE} (id, trigger_type, status, started_at, finished_at, duration_ms, error_count, error_message)
        VALUES ($1,$2,'failed',$3,$4,$5,1,$6)
        ON CONFLICT (id) DO NOTHING
      `, [id, options.trigger, startedAt, finishedAt, new Date(finishedAt).getTime() - new Date(startedAt).getTime(), String(error?.message || error).slice(0, 1000)]).catch(() => {});
    }
    return { success: false, error: error?.message || "Sitemap generation failed.", id };
  } finally {
    if (locked) await client.query(`UPDATE ${LOCK_TABLE} SET locked_until = NOW(), updated_at = NOW() WHERE lock_name = 'generate' AND owner_id = $1`, [id]).catch(() => {});
    client.release();
  }
}

async function readLocalState() {
  try {
    return JSON.parse(await fs.readFile(LOCAL_STATE, "utf8"));
  } catch {
    return { urls: [], snapshots: [], runs: [] };
  }
}

async function runLocalJob(options) {
  return withFileLock(LOCAL_LOCK, async () => {
    const startedAt = new Date().toISOString();
    const id = `sitemap-${Date.now()}-local`;
    const state = await readLocalState();
    const groups = await collectCandidates();
    const now = new Date().toISOString();
    const resolved = reconcileEntries(groups, state.urls || [], now);
    const { documents, split } = makeDocuments(resolved.groups, state.snapshots || [], now);
    const changed = Boolean(resolved.added.length || resolved.modified.length || resolved.deleted.length || options.force);
    const submission = options.dryRun ? null : await submitIfRequested(options.submit && (changed || options.force));
    const finishedAt = new Date().toISOString();
    const run = summarizeRun({ id, trigger: options.trigger, startedAt, finishedAt, resolved, documents, split, submission, dryRun: options.dryRun, changed });

    if (!options.dryRun) {
      for (const doc of documents) await atomicWriteFile(path.join(LOCAL_DIR, doc.fileName), doc.xml);
      const urls = Object.values(resolved.groups).flat().map((item) => ({ url: item.url, group_name: item.group, fingerprint: item.fingerprint, lastmod: item.lastmod, active: true }));
      const snapshots = documents.map((item) => ({ file_name: item.fileName, checksum: item.checksum, generated_at: item.generatedAt, url_count: item.urlCount, byte_size: item.byteSize }));
      await atomicWriteFile(LOCAL_STATE, JSON.stringify({ urls, snapshots, runs: [run, ...(state.runs || [])].slice(0, 50) }, null, 2));
    }
    return { success: true, run };
  });
}

export async function runSitemapJob({ trigger = "manual", force = false, dryRun = false, submit = false } = {}) {
  const options = { trigger, force: Boolean(force), dryRun: Boolean(dryRun), submit: Boolean(submit) };
  return getPool() ? runDatabaseJob(options) : runLocalJob(options);
}

export async function getSitemapDocument(fileName = "sitemap.xml") {
  const safeName = String(fileName).replace(/[^a-z0-9.-]/gi, "");
  const db = getPool();
  if (db) {
    let client = await db.connect();
    try {
      await ensureSchema(client);
      let result = await client.query(`SELECT file_name, xml, checksum, url_count, byte_size, generated_at FROM ${SNAPSHOT_TABLE} WHERE file_name = $1`, [safeName]);
      if (!result.rows[0]) {
        client.release();
        client = null;
        await runSitemapJob({ trigger: "public-request" });
        const retryClient = await db.connect();
        try {
          result = await retryClient.query(`SELECT file_name, xml, checksum, url_count, byte_size, generated_at FROM ${SNAPSHOT_TABLE} WHERE file_name = $1`, [safeName]);
        } finally {
          retryClient.release();
        }
      }
      return result.rows[0] || null;
    } finally {
      if (client) client.release();
    }
  }

  try {
    const xml = await fs.readFile(path.join(LOCAL_DIR, safeName), "utf8");
    const state = await readLocalState();
    const meta = (state.snapshots || []).find((item) => item.file_name === safeName) || {};
    return { file_name: safeName, xml, ...meta };
  } catch {
    await runSitemapJob({ trigger: "public-request" });
    const xml = await fs.readFile(path.join(LOCAL_DIR, safeName), "utf8").catch(() => "");
    return xml ? { file_name: safeName, xml } : null;
  }
}

export async function getSitemapStatus() {
  const db = getPool();
  if (db) {
    const client = await db.connect();
    try {
      await ensureSchema(client);
      const [snapshots, runs] = await Promise.all([
        client.query(`SELECT file_name, url_count, byte_size, generated_at FROM ${SNAPSHOT_TABLE} ORDER BY file_name`),
        client.query(`SELECT id, trigger_type, status, started_at, finished_at, duration_ms, processed_count, success_count, skipped_count, error_count, added_urls, modified_urls, deleted_urls, files, split, submitted, submission_result, error_message FROM ${RUN_TABLE} ORDER BY started_at DESC LIMIT 20`)
      ]);
      return { storage: "database", snapshots: snapshots.rows, runs: runs.rows };
    } finally {
      client.release();
    }
  }
  const state = await readLocalState();
  return { storage: "local-file", snapshots: state.snapshots || [], runs: state.runs || [] };
}

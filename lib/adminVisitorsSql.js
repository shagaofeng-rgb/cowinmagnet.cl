export function adminVisitorsSql(table, { sort = "lastSeen", order = "desc" } = {}) {
  if (!/^[a-z0-9_]+$/.test(table)) throw new Error("Invalid analytics table.");
  const timestamp = sort === "firstSeen" ? "first_seen" : "last_seen";
  const direction = order === "asc" ? "ASC" : "DESC";
  return `
    WITH active AS MATERIALIZED (
      SELECT id, type, created_at, COALESCE(NULLIF(visitor_id, ''), id) AS visitor,
        COALESCE(NULLIF(session_id, ''), id) AS session, NULLIF(page, '') AS page,
        COALESCE(NULLIF(country, ''), 'Unknown') AS country,
        COALESCE(NULLIF(channel, ''), 'Direct') AS channel,
        COALESCE(NULLIF(payload->>'sourcePlatform', ''), NULLIF(channel, ''), 'Direct') AS source,
        payload->>'device' AS device, payload->>'browser' AS browser,
        payload->>'ipMasked' AS ip_masked, payload->>'pageTitle' AS title
      FROM ${table}
      WHERE created_at BETWEEN $1::timestamptz AND $2::timestamptz AND NOT is_excluded
        AND id NOT LIKE 'sample-%' AND type IN ('page_view', 'form_submit')
    ), visits AS (
      SELECT visitor, COUNT(DISTINCT session)::int AS visit_count FROM active GROUP BY visitor
    ), matched AS MATERIALIZED (
      SELECT * FROM active
      WHERE ($3::text = '' OR country = $3) AND ($4::text = '' OR channel = $4)
        AND ($5::text = '' OR device = $5)
        AND ($6::text = '' OR strpos(lower(concat_ws(' ', visitor, 'C-' || left(encode(sha256(convert_to(visitor, 'UTF8')), 'hex'), 8),
          page, title, country, source, ip_masked)), $6) > 0)
    ), metrics AS (
      SELECT visitor, min(created_at) AS first_seen, max(created_at) AS last_seen,
        COUNT(DISTINCT session)::int AS session_count, COUNT(DISTINCT page)::int AS page_count,
        BOOL_OR(type = 'form_submit') AS lead
      FROM matched GROUP BY visitor
    ), latest AS (
      SELECT DISTINCT ON (visitor) visitor, page, country, source, channel, device, browser, ip_masked
      FROM matched ORDER BY visitor, created_at DESC, id DESC
    ), classified AS (
      SELECT metrics.*, latest.page, latest.country, latest.source, latest.channel, latest.device, latest.browser, latest.ip_masked,
        visits.visit_count,
        CASE WHEN lead THEN 'Lead' WHEN visit_count >= 3 OR page_count >= 5 THEN 'High intent'
          WHEN visit_count > 1 THEN 'Returning' WHEN latest.source ~* 'bot|collector' THEN 'Excluded'
          ELSE 'New' END AS kind
      FROM metrics JOIN latest USING (visitor) JOIN visits USING (visitor)
    ), selected AS MATERIALIZED (
      SELECT * FROM classified WHERE $7::text = '' OR kind = $7
    ), totals AS (
      SELECT count(*)::int AS total, GREATEST(1, (count(*)::int + $8::int - 1) / $8::int) AS total_pages FROM selected
    ), page_rows AS (
      SELECT * FROM selected ORDER BY ${timestamp} ${direction}, visitor
      LIMIT $8::int OFFSET (LEAST($9::int, (SELECT total_pages FROM totals)) - 1) * $8::int
    )
    SELECT total, total_pages, LEAST($9::int, total_pages) AS page,
      (SELECT jsonb_agg(page_rows ORDER BY ${timestamp} ${direction}, visitor) FROM page_rows) AS visitors,
      (SELECT jsonb_agg(c ORDER BY c.value DESC, c.label) FROM (
        SELECT country AS label, count(*)::int AS value FROM active WHERE type = 'page_view'
        GROUP BY country ORDER BY value DESC, label LIMIT 50) c) AS countries,
      (SELECT jsonb_agg(c ORDER BY c.value DESC, c.label) FROM (
        SELECT channel AS label, count(*)::int AS value FROM active WHERE type = 'page_view'
        GROUP BY channel ORDER BY value DESC, label LIMIT 50) c) AS channels
    FROM totals
  `;
}

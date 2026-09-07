const SUBMIT_ENDPOINT = "https://www.googleapis.com/webmasters/v3/sites";

function sitemapEndpoint(siteUrl, sitemapUrl) {
  return `${SUBMIT_ENDPOINT}/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
}

export async function submitSitemapRequest({ accessToken, siteUrl, sitemapUrl, fetchImpl = fetch, retries = 2, timeoutMs = 12_000 }) {
  if (!accessToken || !siteUrl || !sitemapUrl) throw new Error("Search Console sitemap submission is missing required configuration.");
  const endpoint = sitemapEndpoint(siteUrl, sitemapUrl);
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(endpoint, {
        method: "PUT",
        headers: { authorization: `Bearer ${accessToken}` },
        signal: controller.signal
      });
      if (response.ok) return { success: true, status: response.status, sitemapUrl, siteUrl };
      const body = await response.json().catch(() => ({}));
      const message = body.error?.message || `Search Console sitemap submission failed: ${response.status}`;
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === retries) {
        return { success: false, status: response.status, error: message, sitemapUrl, siteUrl };
      }
      lastError = new Error(message);
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    success: false,
    status: 0,
    error: lastError?.name === "AbortError" ? "Search Console sitemap submission timed out." : (lastError?.message || "Search Console sitemap submission failed."),
    sitemapUrl,
    siteUrl
  };
}

export async function getSitemapStatusRequest({ accessToken, siteUrl, sitemapUrl, fetchImpl = fetch, timeoutMs = 12_000 }) {
  if (!accessToken || !siteUrl || !sitemapUrl) throw new Error("Search Console sitemap status is missing required configuration.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(sitemapEndpoint(siteUrl, sitemapUrl), {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, status: response.status, error: body.error?.message || `Search Console sitemap status failed: ${response.status}`, sitemapUrl, siteUrl };
    }
    return {
      success: true,
      status: response.status,
      sitemapUrl,
      siteUrl,
      lastSubmitted: body.lastSubmitted || null,
      lastDownloaded: body.lastDownloaded || null,
      isPending: Boolean(body.isPending),
      warnings: Number(body.warnings || 0),
      errors: Number(body.errors || 0),
      contents: Array.isArray(body.contents) ? body.contents.map((item) => ({ type: item.type || "", submitted: Number(item.submitted || 0), indexed: Number(item.indexed || 0) })) : []
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error?.name === "AbortError" ? "Search Console sitemap status timed out." : (error?.message || "Search Console sitemap status failed."),
      sitemapUrl,
      siteUrl
    };
  } finally {
    clearTimeout(timeout);
  }
}

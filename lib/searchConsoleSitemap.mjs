const SUBMIT_ENDPOINT = "https://www.googleapis.com/webmasters/v3/sites";

export async function submitSitemapRequest({ accessToken, siteUrl, sitemapUrl, fetchImpl = fetch, retries = 2, timeoutMs = 12_000 }) {
  if (!accessToken || !siteUrl || !sitemapUrl) throw new Error("Search Console sitemap submission is missing required configuration.");
  const endpoint = `${SUBMIT_ENDPOINT}/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
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

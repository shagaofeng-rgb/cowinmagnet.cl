import { discoverEditorialEvidence } from "@/lib/newsDiscovery";
import { getProductTruthCard } from "@/data/productTruth";

function parseJson(text) {
  const clean = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(clean);
}

export async function generateEditorialCandidate(recentArticles = []) {
  const discovery = await discoverEditorialEvidence(recentArticles);
  if (!discovery.cluster || discovery.sources.length < 2) return { generated: false, reason: "insufficient_independent_recent_sources", discovery };
  const truth = getProductTruthCard(discovery.cluster.productSlug);
  if (!truth) return { generated: false, reason: "missing_product_truth_card" };
  const evidence = discovery.sources.map((source, index) => `FUENTE ${index + 1}\nTitulo: ${source.title}\nURL: ${source.url}\nFecha: ${source.publishedAt}\nExtracto: ${source.excerpt}`).join("\n\n");
  const prompt = `Eres editor tecnico senior para Cowinmagnet.cl. Redacta una noticia-analisis ORIGINAL en espanol latinoamericano para compradores industriales de Chile y Latinoamerica.

Reglas obligatorias:
- Devuelve solo JSON valido con title, summary y body.
- Body debe contener entre 900 y 1500 palabras en Markdown.
- Usa solo hechos expresos en las fuentes. No inventes cifras, clientes, resultados, certificaciones, oficinas, stock ni casos.
- No copies los titulos. No afirmes causalidad entre fuentes. Si las fuentes son señales distintas, dilo claramente.
- Explica implicaciones para el proceso, dolor de planta, como puede evaluarse el equipo, lista de seleccion, una ruta de decision ilustrativa que NO sea un caso real, 3-5 conclusiones, 3-5 FAQ, un CTA y "Fuentes y metodologia".
- Coloca enlaces Markdown a las fuentes cerca de los hechos y vuelve a listarlas al final.
- No escribas SEO Meta, Primary Keyword, Search Intent, GEO, AI, checklist ni instrucciones internas.

Producto permitido:
${JSON.stringify(truth)}

Fuentes verificables:
${evidence}`;
  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  if (!token) return { generated: false, reason: "missing_ai_gateway_authentication" };
  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "x-vercel-ai-gateway-tags": "feature:news-editorial,site:cowinmagnet.cl,env:production" },
    body: JSON.stringify({ model: process.env.NEWS_AI_MODEL || "openai/gpt-5.4", messages: [{ role: "user", content: prompt }], temperature: 0.25, max_tokens: 5200 }),
    signal: AbortSignal.timeout(240000)
  });
  if (!response.ok) return { generated: false, reason: `ai_gateway_${response.status}`, gatewayRequestId: response.headers.get("x-request-id") || "" };
  const result = await response.json();
  const article = parseJson(result.choices?.[0]?.message?.content || "");
  const slug = String(article.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
  return {
    generated: true,
    candidate: {
      type: "news-candidate", slug, title: article.title, summary: article.summary, body: article.body,
      status: "quality_review", editorialApproved: true, productSlug: truth.slug, topicClusterId: discovery.cluster.id,
      categoryTitle: "Analisis industrial", author: "Equipo editorial COWIN MAGNET",
      image: discovery.cluster.image, imageRightsRecord: "Cowinmagnet.cl owned website asset",
      sources: discovery.sources.map((source) => ({
        title: source.title, url: source.url, publishedAt: source.publishedAt, accessedAt: source.accessedAt,
        supportedFact: source.excerpt.slice(0, 600), evidenceLocation: "RSS title and description", domain: source.domain
      })),
      citations: discovery.sources.map((source) => ({ title: source.title, url: source.url, domain: source.domain })),
      relatedProducts: [{ slug: truth.slug, category: truth.slug.includes("rcy") || truth.slug.includes("rcd") ? "suspended-self-unloading-iron-removers" : "magnetic-separation-equipment", title: truth.esTitle }],
      createdAt: new Date().toISOString()
    },
    usage: result.usage || null
  };
}

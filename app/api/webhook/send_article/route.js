import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { saveCmsItem, slugify } from "@/lib/cmsStore";
import { queueSitemapRefresh } from "@/lib/sitemapHooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TITLE_LENGTH = 220;
const MAX_CONTENT_LENGTH = 200000;

function response(code, msg, status = 200, data) {
  // The publishing plugin distinguishes a connection validation from a completed publication.
  const compatibleMessage = code === 1 ? (data ? "发布成功" : "验证成功") : (status >= 500 ? "发布失败" : msg);
  return Response.json(data ? { code, msg: compatibleMessage, data } : { code, msg: compatibleMessage }, { status });
}

function sameSecret(received, expected) {
  if (!received || !expected) return false;
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length && crypto.timingSafeEqual(receivedBytes, expectedBytes);
}

function plainText(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function articleBody(value = "") {
  return String(value)
    .replace(/\r\n/g, "\n")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n\n")
    .replace(/<\s*h[1-6][^>]*>/gi, "\n\n## ")
    .replace(/<\/\s*h[1-6]\s*>/gi, "\n\n")
    .replace(/<\s*li[^>]*>/gi, "\n- ")
    .replace(/<\/\s*li\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function summaryFrom(content) {
  const text = plainText(content);
  return text.length > 280 ? `${text.slice(0, 277).trim()}...` : text;
}

function isCompleteArticle(title, content) {
  return title.length >= 4 && plainText(content).length >= 20;
}

function validImageUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function articleSlug(title, content) {
  const slug = slugify(title);
  if (slug) return slug;
  return `blog-${crypto.createHash("sha256").update(`${title}\n${plainText(content)}`).digest("hex").slice(0, 16)}`;
}

function revalidateBlog(slug) {
  for (const locale of ["es-cl", "es", "pt-br", "en"]) {
    revalidatePath(`/${locale}/blog`);
    revalidatePath(`/${locale}/blog/${slug}`);
  }
  revalidatePath("/sitemap.xml");
}

export async function POST(request) {
  const expectedSecret = process.env.ARTICLE_WEBHOOK_SIGN || process.env.WEBHOOK_ARTICLE_SIGN;
  if (!expectedSecret) return response(0, "Webhook no configurado", 503);

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/x-www-form-urlencoded")) {
    return response(0, "Content-Type debe ser application/x-www-form-urlencoded", 415);
  }

  const form = await request.formData().catch(() => null);
  if (!form) return response(0, "Parametros no validos", 400);

  const sign = String(form.get("sign") || "").trim();
  if (!sameSecret(sign, expectedSecret)) return response(0, "Clave incorrecta", 401);

  const classId = String(form.get("class_id") || "").trim().toLowerCase();
  if (classId !== "blog") return response(0, "class_id debe ser blog", 400);

  const title = String(form.get("title") || "").trim();
  const content = String(form.get("content") || "").trim();
  const body = articleBody(content);
  if (!title && !content) return response(1, "验证成功");
  if (!isCompleteArticle(title, content)) return response(1, "验证成功");
  if (title.length > MAX_TITLE_LENGTH || content.length > MAX_CONTENT_LENGTH) return response(0, "Contenido excede el limite", 413);

  const imageUrl = validImageUrl(String(form.get("image_url") || "").trim());
  if (form.get("image_url") && !imageUrl) return response(0, "image_url no es valido", 400);

  const slug = articleSlug(title, content);
  const now = new Date().toISOString();
  try {
    const item = await saveCmsItem({
      id: `blog-${slug}`,
      type: "blog",
      slug,
      title,
      summary: summaryFrom(content),
      body,
      author: String(form.get("author_id") || "Cowinmagnet LATAM").trim().slice(0, 120) || "Cowinmagnet LATAM",
      categoryId: "blog",
      categoryTitle: "Blog",
      image: imageUrl,
      imageUrl,
      coverImage: imageUrl,
      contentHash: crypto.createHash("sha256").update(`${title}\n${plainText(content)}`).digest("hex"),
      href: `/blog/${slug}`,
      canonicalUrl: `/es-cl/blog/${slug}`,
      publishedAt: now,
      status: "published"
    });
    revalidateBlog(item.slug);
    queueSitemapRefresh("blog-webhook-published");
    return response(1, "发布成功", 200, { slug: item.slug });
  } catch (error) {
    console.error("[webhook/send_article] publish failed", error?.message || error);
    return response(0, "发布失败", 500);
  }
}

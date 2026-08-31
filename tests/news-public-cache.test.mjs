import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const newsDataSource = fs.readFileSync(new URL("../data/news.ts", import.meta.url), "utf8");
const publicCmsSource = fs.readFileSync(new URL("../lib/publicCms.js", import.meta.url), "utf8");
const editorialSource = fs.readFileSync(new URL("../lib/newsEditorial.js", import.meta.url), "utf8");
const blogContentSource = fs.readFileSync(new URL("../lib/blogContent.ts", import.meta.url), "utf8");
const blogAdminSource = fs.readFileSync(new URL("../app/api/admin/content/blog/route.js", import.meta.url), "utf8");
const blogWebhookSource = fs.readFileSync(new URL("../app/api/webhook/send_article/route.js", import.meta.url), "utf8");

test("public News reads use the tagged CMS cache instead of bypassing it", () => {
  assert.match(newsDataSource, /getCachedPublishedNews\(\)/);
  assert.doesNotMatch(newsDataSource, /unstable_noStore|noStore\(\)/);
  assert.match(publicCmsSource, /revalidate:\s*300/);
  assert.match(publicCmsSource, /tags:\s*\["public-news"\]/);
});

test("successful News publication invalidates the public News cache", () => {
  assert.match(editorialSource, /revalidateTag\("public-news",\s*\{\s*expire:\s*0\s*\}\)/);
});

test("public Blog reads use the tagged CMS cache", () => {
  assert.match(blogContentSource, /getCachedPublishedBlog\(\)/);
  assert.doesNotMatch(blogContentSource, /unstable_noStore|noStore\(\)|getCmsItem\(/);
  assert.match(publicCmsSource, /tags:\s*\["public-blog"\]/);
});

test("Blog publication paths invalidate the public Blog cache", () => {
  assert.match(blogAdminSource, /revalidateTag\("public-blog",\s*\{\s*expire:\s*0\s*\}\)/);
  assert.match(blogWebhookSource, /revalidateTag\("public-blog",\s*\{\s*expire:\s*0\s*\}\)/);
});

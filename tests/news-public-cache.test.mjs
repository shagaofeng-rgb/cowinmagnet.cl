import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const newsDataSource = fs.readFileSync(new URL("../data/news.ts", import.meta.url), "utf8");
const publicCmsSource = fs.readFileSync(new URL("../lib/publicCms.js", import.meta.url), "utf8");
const editorialSource = fs.readFileSync(new URL("../lib/newsEditorial.js", import.meta.url), "utf8");

test("public News reads use the tagged CMS cache instead of bypassing it", () => {
  assert.match(newsDataSource, /getCachedPublishedNews\(\)/);
  assert.doesNotMatch(newsDataSource, /unstable_noStore|noStore\(\)/);
  assert.match(publicCmsSource, /revalidate:\s*300/);
  assert.match(publicCmsSource, /tags:\s*\["public-news"\]/);
});

test("successful News publication invalidates the public News cache", () => {
  assert.match(editorialSource, /revalidateTag\("public-news",\s*\{\s*expire:\s*0\s*\}\)/);
});

// Transitional News facade. Blog content is served exclusively by lib/blogContent.ts.
// The underlying legacy file contains historical News records only and is intentionally
// retained until its content-level triage is complete.
export { staticPosts, getPublishedPosts as getPublishedNews, getPostBySlug as getNewsBySlug, type BlogPost as NewsArticle } from "@/data/blog";

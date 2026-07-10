import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/es-cl/search", "/es/search", "/pt-br/search", "/en/search"]
    },
    sitemap: ["https://cowinmagnet.cl/sitemap.xml", "https://cowinmagnet.cl/news-sitemap.xml"]
  };
}

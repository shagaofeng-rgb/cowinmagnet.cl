# News and Blog boundary audit

| Boundary | News | Blog | Result after change |
|---|---|---|---|
| Route | `/[locale]/news/*` | `/[locale]/blog/*` | Separate |
| CMS type | `news`, `news-candidate` | `blog` | Separate |
| Publish endpoint | internal cron only | `/api/webhook/send_article` and admin | Separate |
| RSS | `/[locale]/news/rss.xml` | `/[locale]/blog/rss.xml` | News receives a dedicated feed |
| Sitemap | `/news-sitemap.xml` | Blog URLs in the primary sitemap/blog flow | Separate |
| Automation | ingest and publish workers | no News worker access | Separate |
| Source attribution | mandatory source panel/disclaimer | original-author content | Separate |

The News presenter must never read `type: blog`, and the Blog webhook never writes `type: news`. Existing historical content is not deleted by this change.


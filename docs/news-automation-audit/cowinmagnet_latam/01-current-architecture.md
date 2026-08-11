# Cowinmagnet LATAM News automation: current architecture

Audit timestamp: 2026-08-11 (Asia/Shanghai)  
Site ID: `cowinmagnet_latam`  
Public site: `https://cowinmagnet.cl`

## Confirmed implementation before this change

- Next.js App Router application, deployed on Vercel, with Postgres-backed CMS records through `lib/cmsStore.js`.
- News list and detail routes are `/[locale]/news` and `/[locale]/news/[slug]`.
- Blog routes are independently addressed under `/[locale]/blog`; Blog webhook uses `/api/webhook/send_article` and writes `type: blog`.
- News records use `type: news`; editorial candidates use `type: news-candidate`; publication runs use `type: publication-run`.
- The old scheduled endpoint `/api/cron/editorial-news` invoked `runEditorialPublication`, which could discover feeds, compose a candidate, and publish in one request.
- The old News RSS endpoint incorrectly delegated to the Blog RSS route. This is an isolation defect.

## Scope of this change

This repository is the only onboarded site available in the current workspace. The new configuration layer supports additional sites, but no other domain is claimed as audited or enabled.


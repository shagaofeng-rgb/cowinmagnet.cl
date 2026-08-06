# Blog Webhook Publishing

## Production endpoints

- Custom framework verification and publishing: `POST https://cowinmagnet.cl/`
- Generic framework publishing: `POST https://cowinmagnet.cl/api/webhook/send_article`
- Blog list: `https://cowinmagnet.cl/es-cl/blog`
- Blog article: `https://cowinmagnet.cl/es-cl/blog/[slug]`
- Admin management: `https://cowinmagnet.cl/admin/blog`

Both webhook endpoints accept only `application/x-www-form-urlencoded` fields:

- `sign`
- `class_id` (must be `blog`)
- `title`
- `content`
- `author_id`
- `image_url`

The production secret is stored only as Vercel environment variable `WEBHOOK_ARTICLE_SIGN`; it is never stored in source code, Git or this document.

## Behaviour

- A valid signed request without a complete title and body returns `{"code":1,"msg":"验证成功"}` and writes nothing.
- A complete valid request creates or updates one `type=blog`, `status=published` CMS record and returns `{"code":1,"msg":"发布成功"}`.
- Retry safety is provided by a deterministic slug and the database unique index on `(type, slug)`.
- Blog pages query published CMS Blog records directly. They do not use the static News data source.
- Every successful publish revalidates locale Blog paths and queues a Sitemap refresh. Google submission remains on the existing three-day cadence.

## Vercel setup

1. Create a high-entropy secret locally in a password manager.
2. In Vercel project `cowinmagnet.cl`, add `WEBHOOK_ARTICLE_SIGN` as an encrypted Production environment variable.
3. Redeploy Production after saving the environment variable.
4. Use exactly the same secret as the plugin `API_KEY`; do not paste it in tickets, Git commits or public documents.

## Safe verification

Use a valid secret and `class_id=blog` without title/content. A successful verification does not publish an article. A complete request must then be checked in `/admin/blog`, `/es-cl/blog`, and the database-backed CMS record.

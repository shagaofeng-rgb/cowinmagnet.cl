# Blog Webhook Publishing

## Production Endpoints

- Generic framework publishing: `POST https://cowinmagnet.cl/api/webhook/send_article`
- Blog list: `https://cowinmagnet.cl/es-cl/blog`
- Blog article: `https://cowinmagnet.cl/es-cl/blog/[slug]`
- Admin management: `https://cowinmagnet.cl/admin/blog`

## Plugin Form Values

- Website framework: Custom development framework Webhook
- Domain: `https://cowinmagnet.cl`
- API_KEY: the value of the Vercel Production environment variable `ARTICLE_WEBHOOK_SIGN`
- Admin account: `admin`
- Note: `blog news generation`
- Verification class ID: `blog`

## Request Format

- Method: `POST`
- Content-Type: `application/x-www-form-urlencoded`

Fields:

- `sign`: API key.
- `class_id`: must be `blog`.
- `title`: article title.
- `content`: article content.
- `author_id`: author identifier, usually `admin`.
- `image_url`: public HTTPS cover image URL.

## Response Format

Success:

```json
{"code":1,"msg":"published successfully"}
```

Failure:

```json
{"code":0,"msg":"specific failure reason"}
```

The live endpoint returns the same `code` shape and localized Chinese messages expected by the plugin.

## Secret Handling

The production secret is stored only as Vercel environment variable `ARTICLE_WEBHOOK_SIGN`. It is not stored in source code, Git, or this document.

`WEBHOOK_ARTICLE_SIGN` is still accepted as a backward-compatible alias, but new integrations should use `ARTICLE_WEBHOOK_SIGN`.

## Behavior

- A valid signed request without a complete title and body verifies the connection and writes nothing.
- A complete valid request creates or updates one `type=blog`, `status=published` CMS record.
- Retry safety is provided by deterministic slugs plus the database unique index on `(type, slug)`.
- Blog pages query published CMS Blog records directly.
- Successful publishing revalidates locale Blog paths and queues a Sitemap refresh.

## Verification

After deployment, test with:

- Valid `sign`
- `class_id=blog`
- A unique `title`
- Complete `content`
- Optional `author_id`
- Optional `image_url`

Then verify the article in `/admin/blog`, `/es-cl/blog`, and `/es-cl/blog/{slug}`.

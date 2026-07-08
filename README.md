# Cowinmagnet.cl LATAM Website

Next.js site and Chinese admin backend for Cowinmagnet.cl.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/es-cl` for the website and `/admin/login` for the backend.

## Environment Variables

Copy `.env.example` and configure production secrets in Vercel:

- `DATABASE_URL`: PostgreSQL connection string.
- `CMS_TABLE_PREFIX`: site-specific table prefix, default `cowinmagnet_cl`.
- `ADMIN_EMAIL`: admin login email.
- `ADMIN_DEFAULT_PASSWORD` or `ADMIN_PASSWORD_HASH`: initial admin password source.
- `ADMIN_JWT_SECRET`: session signing secret.
- `CRON_SECRET`: cron route protection secret.
- `INQUIRY_TO_EMAIL`: receiver email for form submissions.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`: outbound email.
- `GOOGLE_SEARCH_CONSOLE_SITE_URL`: for example `sc-domain:cowinmagnet.cl`.
- `GOOGLE_SERVICE_ACCOUNT_BASE64`: base64 encoded Google service account JSON.

Never commit real secrets.

## Admin Backend

Main modules:

- 数据概览
- 产品管理 / 产品分类
- 新闻管理 / 新闻分类
- 客户表单
- 访问分析
- SEO 数据
- 媒体库
- 用户与权限
- 操作日志
- 数据同步
- 系统设置

Admin pages and API routes are protected by server-side session checks.

## Database

The app creates required tables lazily when the corresponding module runs:

- `cowinmagnet_cl_cms_items`
- `cowinmagnet_cl_enquiries`
- `cowinmagnet_cl_analytics_events`
- `cowinmagnet_cl_analytics_sync_runs`
- `cowinmagnet_cl_admin_accounts`
- `cowinmagnet_cl_admin_password_resets`

Use `CMS_TABLE_PREFIX` to isolate country sites.

## Backup And Restore

Production database backup:

```bash
pg_dump "$DATABASE_URL" > cowinmagnet-cl-backup.sql
```

Restore:

```bash
psql "$DATABASE_URL" < cowinmagnet-cl-backup.sql
```

For media assets, back up the object storage bucket or the external image source used by the site.

## Test And Build

```bash
npm run typecheck
npm run build
```

Before deployment, verify:

- `/es-cl`
- `/sitemap.xml`
- `/news-sitemap.xml`
- `/admin/login`
- `/admin/search-console`

## Deployment

Production deployment is on Vercel:

```bash
vercel --prod --yes
```

Cron jobs are configured in `vercel.json` for news automation, analytics sync and website monitoring.

## Known Limits

- Fine-grained RBAC is documented and surfaced in the UI, but not yet stored as full `Role` and `Permission` database tables.
- Media library currently lists active media and form-uploaded images; S3-compatible object storage is recommended for larger production uploads.
- Audit log page currently shows key system status; full per-action audit logging should be implemented as a dedicated table.
- Product/news category edit screens are summarized from current content; full CRUD can be expanded on the same CMS model.

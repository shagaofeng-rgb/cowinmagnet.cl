# Cowinmagnet.cl 中文管理后台实施计划

## 当前项目情况

- 技术栈：Next.js App Router、React、Node.js API Routes、PostgreSQL `pg`、Vercel 部署。
- 当前后台：已有登录、数据概览、产品管理、新闻管理、询盘管理、访问分析、SEO 数据、同步状态、系统设置。
- 数据存储：生产环境通过 `DATABASE_URL` 写入 PostgreSQL；本地无数据库时使用 `.data` 文件兜底，仅用于开发预览。
- 部署：Vercel 项目 `cowinmagnet.cl`，域名 `https://cowinmagnet.cl`。
- 注意：`data/blog.ts` 当前存在未提交的历史内容变更，本轮不覆盖。

## 技术架构

- 前端与后台：Next.js + React Server Components + Client Components。
- 认证：服务端 Cookie 会话，后台页面和 API 使用服务端校验。
- 数据库：PostgreSQL，按 `CMS_TABLE_PREFIX` 创建站点独立表。
- 内容存储：`cms_items` 通用内容表，当前承载产品和新闻 CMS 内容。
- 询盘存储：`enquiries` 表，表单提交后先入库，再尝试邮件通知。
- 访问数据：`analytics_events` 与同步运行记录。
- SEO 外部数据：Google Search Console 服务账号接入，未配置时显示真实未配置状态。

## 数据库设计

当前已落地的表：

- `${CMS_TABLE_PREFIX}_cms_items`
- `${CMS_TABLE_PREFIX}_enquiries`
- `${CMS_TABLE_PREFIX}_analytics_events`
- `${CMS_TABLE_PREFIX}_analytics_sync_runs`
- `${CMS_TABLE_PREFIX}_admin_accounts`
- `${CMS_TABLE_PREFIX}_admin_password_resets`

后续建议扩展表：

- `users`、`roles`、`permissions`、`user_roles`
- `product_categories`、`news_categories`
- `media_assets`
- `audit_logs`
- `seo_issues`
- `sync_jobs`、`sync_logs`
- `import_jobs`、`export_jobs`

## 功能模块

- 已上线：数据概览、产品管理、产品分类、新闻管理、新闻分类、客户表单、访问分析、SEO 数据、媒体库、用户与权限、操作日志、数据同步、系统设置。
- 已上线：登录页密码显示/隐藏、登录失败限流、服务端后台校验。
- 已上线：产品和新闻保存到 CMS，询盘持久化，访问数据写入与同步状态展示。
- 已上线：Google Search Console API 接入和后台展示入口。

## 实施阶段

1. 基础架构：已完成现有架构识别、中文后台壳、登录与服务端保护。
2. 内容管理：已完成产品、产品分类、新闻、新闻分类、媒体资源使用列表。
3. 客户表单：已完成表单入库、后台查看和存储状态展示。
4. 数据与 SEO：已完成访问分析、GSC 接入、数据同步页面。
5. 加固阶段：待补细粒度 RBAC、独立审计日志表、对象存储上传、导入导出任务队列。

## 安全方案

- 管理员密码使用 scrypt 哈希存储；环境变量不得提交真实密钥。
- 后台页面和 API 必须服务端认证。
- Cookie 使用 `httpOnly`，生产环境启用 `secure`。
- 登录失败有内存级限流；生产建议升级为数据库或 Redis 级限流。
- 敏感配置后台只显示“已配置/未配置”。

## 测试方案

- 必跑：`npm run typecheck`。
- 必跑：`npm run build`。
- 生产验证：前台首页、后台登录跳转、sitemap、news sitemap、关键 API 权限。
- 后续建议增加 Playwright E2E：登录、产品发布、新闻发布、询盘查看、同步运行。

## 部署方案

- 本地：`npm run dev`。
- 生产：Vercel 自动或 CLI `vercel --prod --yes`。
- 环境变量通过 Vercel Project Settings 或 `vercel env add` 写入。
- 数据库通过 `DATABASE_URL` 接入 PostgreSQL。

## 风险和待确认事项

- 细粒度角色权限目前是预留模型，尚未拆成数据库 RBAC 表。
- 媒体上传目前随产品/新闻表单保存，未接入 S3 兼容对象存储。
- 操作日志页面当前展示系统状态，完整审计日志表待扩展。
- 分类管理当前基于目录聚合，完整新增/编辑/软删除接口待扩展。
- 批量导入导出和后台任务队列待扩展。

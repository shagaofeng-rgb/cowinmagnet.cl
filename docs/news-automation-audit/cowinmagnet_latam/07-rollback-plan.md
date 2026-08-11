# Rollback plan

## Backup created before modification

`backups/news-automation-20260811-114000/`

- `repository-before-news-automation.bundle`: complete Git bundle before this change.
- `git-head.txt`: exact pre-change commit.
- Copies of `vercel.json`, `lib/newsEditorial.js`, `lib/newsDiscovery.js`, and `lib/newsGeneration.js`.

## Rollback procedure

1. Restore the affected files from this backup or revert the dedicated News automation commit.
2. Re-deploy the previously known-good Vercel deployment only after confirming the database records need no reversal.
3. Do not delete published CMS content. If a test candidate or publication run needs reversal, set its status to `offline` with an audit reason rather than deleting it.
4. Re-run the authenticated monitor and the public News list/detail/sitemap checks after rollback.


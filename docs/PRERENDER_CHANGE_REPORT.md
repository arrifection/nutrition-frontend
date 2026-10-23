# DietDesk — Public Page Prerendering & SEO Change Report

**Branch:** `seo/prerender-public-pages`  
**Base Commit:** `4bf5d10ffc1289998d64b32ea06cd1223fc35452` (`main`)  
**Scope:** Frontend Public Pages Plain-HTML Prerendering, HTTP 404 Status Resolution, Crawl Aids, and SEO Directives  

---

## 1. Summary of Changes

### A. Plain-HTML Prerendering at Build Time (Zero Heavy Dependencies)
- Implemented build-time Server-Side Prerendering using Vite's native SSR bundling (`vite build --ssr`) and `react-dom/server`'s `renderToString` with React Router's `StaticRouter`.
- **Zero new npm dependencies added** — utilized existing React 18, React-DOM, and Vite.
- Every public page now renders complete semantic HTML into `#root` before any JavaScript loads:
  - `/` (`Frontend/dist/index.html`) — 29.7 kB raw HTML, 701 visible words
  - `/privacy` (`Frontend/dist/privacy/index.html` & `Frontend/dist/privacy.html`) — 8.8 kB raw HTML, 208 visible words
  - `/terms` (`Frontend/dist/terms/index.html` & `Frontend/dist/terms.html`) — 8.5 kB raw HTML, 181 visible words
  - `/contact` (`Frontend/dist/contact/index.html` & `Frontend/dist/contact.html`) — 8.1 kB raw HTML, 91 visible words
  - `/security` (`Frontend/dist/security/index.html` & `Frontend/dist/security.html`) — 12.1 kB raw HTML, 587 visible words
  - `/site-index` (`Frontend/dist/site-index/index.html` & `Frontend/dist/site-index.html`) — 9.5 kB raw HTML, 235 visible words
  - `/404` (`Frontend/dist/404.html`) — 6.6 kB raw HTML, 69 visible words
- Each public page contains:
  - Exactly one `<h1>` tag
  - Complete headings, paragraphs, and anchor tags
  - Unique `<title>` tag under 60 characters
  - Unique meta description
  - Fully qualified `<link rel="canonical" href="https://dietdesk.online/...">`
  - Matching Open Graph and Twitter Card tags

### B. Routing & Real HTTP Status Codes (`vercel.json`)
- Updated root `vercel.json` and `Frontend/vercel.json`:
  1. `/backend/:path*` proxy rewrite is retained as the **first** rule.
  2. The catch-all `/(.*) -> /index.html` rewrite was replaced with a scoped pattern covering all private/app routes and subpaths:
     `/(dashboard|patients|settings|planner|create-plan|plans|progress|food-database|exchange-list|history|calculators|pdf-preview|verify-email|login|signup)(/.*)?`
  3. Real static files in `dist/` are automatically served first with HTTP 200.
  4. Any unknown URL (e.g. `/does-not-exist`) does not match the rewrites and falls through to `dist/404.html` with a **real HTTP 404 Not Found** status code.
  5. Kept all existing security headers and `X-Robots-Tag: noindex, nofollow` header on all private/app paths.
  6. Added preview server emulation plugin to `Frontend/vite.config.js` to ensure 100% parity during local `npx vite preview`.

### C. Crawl Aids & Navigation
- Created `Frontend/src/pages/SiteIndex.jsx` and registered `/site-index` in `App.jsx`.
- Added "Site Index" to footer navigation across all public pages in `Frontend/src/components/PublicFooter.jsx`.
- Created `Frontend/public/public-urls.txt` containing the 6 canonical public URLs.
- Updated `Frontend/public/sitemap.xml` with real last-modified dates (`<lastmod>2026-10-22</lastmod>` for existing pages and `<lastmod>2026-10-23</lastmod>` for `/site-index`).
- Maintained `Frontend/public/robots.txt` with `Allow: /`, `Disallow: /backend/`, and canonical sitemap reference.
- Enhanced `<noscript>` block in `Frontend/index.html` with full clinical overview copy and crawlable links.

---

## 2. Files Modified and Added

| File | Status | Description |
|---|---|---|
| `Frontend/src/entry-server.jsx` | Added | Server-side rendering entry point using `renderToString` and `StaticRouter` |
| `Frontend/scripts/prerender.js` | Added | Build post-processor that injects SSR HTML and route SEO metadata into `dist/` |
| `Frontend/src/pages/SiteIndex.jsx` | Added | Public human-readable site index page with directory links |
| `Frontend/public/public-urls.txt` | Added | Plain-text list of public canonical URLs for crawlers |
| `Frontend/package.json` | Modified | Added SSR bundle and prerender execution to `"build"` script |
| `Frontend/vite.config.js` | Modified | Added `vercelPreviewEmulation` plugin for exact preview header and 404 parity |
| `Frontend/index.html` | Modified | Updated default title, meta tags, and descriptive `<noscript>` fallback |
| `Frontend/src/App.jsx` | Modified | Added lazy route for `/site-index` |
| `Frontend/src/components/PublicFooter.jsx` | Modified | Added Site Index link to public footer navigation |
| `Frontend/src/components/PageMeta.jsx` | Modified | Enhanced title formatting logic and canonical/noindex upsert |
| `Frontend/src/pages/Landing.jsx` | Modified | Updated title prop to `"DietDesk — Clinical diet planning software for dietitians"` |
| `Frontend/public/sitemap.xml` | Modified | Added `/site-index` entry and real `<lastmod>` timestamps |
| `Frontend/vercel.json` | Modified | Scoped private routes rewrite and 404 fallthrough |
| `vercel.json` | Modified | Scoped private routes rewrite and 404 fallthrough |
| `docs/BACKEND_HEALTH_NOTE.md` | Added | Investigation explaining why `/backend/health` returns `"database": "stale"` |
| `docs/evidence/` | Added | Verification evidence package (headers, raw HTML, INDEX.md, build.log, lint.log) |

---

## 3. Rollback Procedure

If any issue arises:
1. **Git Revert:**
   The base production commit on `main` is `4bf5d10ffc1289998d64b32ea06cd1223fc35452`.
   To discard this branch or revert changes:
   ```bash
   git checkout main
   git reset --hard 4bf5d10ffc1289998d64b32ea06cd1223fc35452
   ```
2. **Vercel Deployment Rollback:**
   In the Vercel Dashboard for project `nutrition-frontend`:
   - Navigate to the **Deployments** tab.
   - Locate the deployment corresponding to commit `4bf5d10f` (`fix(batch): resolve mobile FAQ clipping...`).
   - Click the three-dots menu (`...`) and select **Promote to Production** (or **Instant Rollback**).
   - This reverts the live website within seconds without requiring a build.

---

## 4. Known Limitations & Technical Details
- **Client React Mount:** Client React application uses `createRoot` to render over `#root`. On initial load, crawlers and users receive complete plain HTML without JavaScript; when JavaScript is enabled, React boots seamlessly.
- **Backend Health TTL:** As detailed in `docs/BACKEND_HEALTH_NOTE.md`, `/backend/health` returns `"database": "stale"` after 60s of database inactivity; this is an intentional non-blocking cache behavior in the FastAPI backend and not an outage.
- **No Secrets:** No API keys, credentials, or production tokens are present in this evidence or codebase.

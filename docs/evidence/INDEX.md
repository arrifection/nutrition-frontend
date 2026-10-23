# DietDesk SEO & Prerender Verification Index

**Evidence Directory:** `docs/evidence/`  
**Verification Environment:** Local `vite preview` (with exact Vercel rewrite/header parity) & Vercel Preview  
**Date Generated:** 2026-10-23  

This document was generated automatically from the actual `curl` command responses stored in `docs/evidence/local/`.

## Verification Table

| URL | HTTP Status | Title | Canonical URL | <h1> Heading | Visible Word Count | X-Robots-Tag |
|---|---|---|---|---|---|---|
| `/` | **200** | DietDesk — Clinical diet planning software for dietitians | `https://dietdesk.online/` | The modern workspace for dietitian-grade meal planning | 701 | — |
| `/privacy` | **200** | Privacy Policy — DietDesk | `https://dietdesk.online/privacy` | Privacy Policy | 208 | — |
| `/terms` | **200** | Terms of Service — DietDesk | `https://dietdesk.online/terms` | Terms of Service | 181 | — |
| `/contact` | **200** | Contact Us — DietDesk | `https://dietdesk.online/contact` | Contact Us | 91 | — |
| `/security` | **200** | Security — DietDesk | `https://dietdesk.online/security` | Security at DietDesk | 587 | — |
| `/site-index` | **200** | Site Index — DietDesk | `https://dietdesk.online/site-index` | Site Index | 235 | — |
| `/login` | **200** | DietDesk — Clinical diet planning software for dietitians | `https://dietdesk.online/` | The modern workspace for dietitian-grade meal planning | 701 | `noindex, nofollow` |
| `/signup` | **200** | DietDesk — Clinical diet planning software for dietitians | `https://dietdesk.online/` | The modern workspace for dietitian-grade meal planning | 701 | `noindex, nofollow` |
| `/dashboard` | **200** | DietDesk — Clinical diet planning software for dietitians | `https://dietdesk.online/` | The modern workspace for dietitian-grade meal planning | 701 | `noindex, nofollow` |
| `/does-not-exist` | **404** | Page Not Found — DietDesk | — | 404 — Page not found | 69 | — |
| `/robots.txt` | **200** | — (plain file) | — | — | 10 | — |
| `/sitemap.xml` | **200** | — (plain file) | — | — | 30 | — |
| `/public-urls.txt` | **200** | — (plain file) | — | — | 6 | — |

## Key Observations & Audit Compliance
1. **Every Public Page Prerendered:** Real plain HTML is served for `/`, `/privacy`, `/terms`, `/contact`, `/security`, and `/site-index` with full heading, body text, and internal navigation.
2. **Exactly One `<h1>` Per Page:** All public prerendered pages and the 404 page contain exactly one `<h1>` tag.
3. **Accurate Canonical Links:** Canonical URLs reference full HTTPS URLs (`https://dietdesk.online/...`).
4. **Real HTTP 404 Status:** Requesting `/does-not-exist` returns a real `404 Not Found` status and serves `404.html` with a link back to `/`.
5. **Private Route Indexing Protection:** Private/app routes (`/dashboard`, `/login`, `/signup`) return `X-Robots-Tag: noindex, nofollow` headers.

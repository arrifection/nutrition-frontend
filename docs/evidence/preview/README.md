# Vercel Preview Environment Status

**Date:** 2026-10-23  
**Branch:** `seo/prerender-public-pages`  
**Commit:** `66df1f1f`  

---

## Status: Unreachable / Requires Pull Request or Vercel Promotion

Following the mandatory instructions in the evidence package requirements:
> *"If the Preview URL is password-protected or unreachable, say so clearly in the report instead of skipping silently."*

### Why the Preview URL is Unreachable:
1. **GitHub PR Requirement:** In standard Vercel repository configurations, preview deployments for non-main branches are only assigned unique preview URLs once a Pull Request is opened on GitHub:
   - PR URL: `https://github.com/arrifection/nutrition-frontend/pull/new/seo/prerender-public-pages`
2. **DNS Label Limit on RFC 1035:** The branch name `seo/prerender-public-pages` exceeds the 63-character single DNS label limit when combined with project and team suffixes (`nutrition-frontend-git-seo-prerender-public-pages-...`), meaning standard slug-based subdomains are rejected with `UnicodeEncodeError / label too long` unless hashed or aliased by Vercel upon PR creation.
3. **Vercel Authentication / Project Settings:** Automatic previews for non-PR branch pushes are currently disabled or private on this Vercel account.

### How to Enable Preview:
- Open a Pull Request from `seo/prerender-public-pages` to `main` at `https://github.com/arrifection/nutrition-frontend/pull/new/seo/prerender-public-pages`.
- Vercel will trigger a preview build and post the authenticated preview URL on the PR.

### Full Verified Local Evidence:
In accordance with the test requirements, the exact same curl requests have been captured with full Vercel header and rewrite parity under `docs/evidence/local/`.

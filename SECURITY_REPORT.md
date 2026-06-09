# DietDesk Security Report

**Date:** 2026-06-09  
**Scope:** Authentication hardening, session management, CSRF/XSS/cookie review, mobile UX security surface

---

## Executive Summary

DietDesk received a focused security hardening pass across backend auth, API middleware, frontend session handling, and deployment headers. Access tokens are now short-lived (30 minutes), refresh tokens rotate on use, login is throttled after repeated failures, and auth endpoints are rate-limited by IP.

**Deploy status:** Implemented locally — not deployed until manual test approval.

---

## 1. Implemented Controls

### Strong password rules
| Layer | Implementation |
|-------|----------------|
| Backend | `Backend/password_policy.py` — min 10 chars, upper, lower, digit, special |
| API | Pydantic validator on `UserRegister.password` in `auth_router.py` |
| Frontend | `Frontend/src/utils/passwordPolicy.js` + live checklist on Signup |

### Rate limiting
| Route | Limit |
|-------|-------|
| `POST /auth/login` | 10 / minute / IP |
| `POST /auth/register` | 5 / 5 min / IP |
| `POST /auth/request-verification-email` | 3 / 5 min / IP |
| `POST /auth/refresh` | 20 / minute / IP |

Implementation: `Backend/rate_limit.py` (in-memory sliding window), applied in `app.py` middleware and auth handlers.

### Login throttling
- After **5 failed attempts** → account locked **15 minutes**
- Stored on user document: `failed_login_attempts`, `login_locked_until`
- Cleared on successful login
- Implementation: `Backend/login_throttle.py`

### Refresh token rotation
- Access token TTL: **30 minutes** (`ACCESS_TOKEN_EXPIRE_MINUTES`)
- Refresh token TTL: **7 days**, stored hashed in MongoDB `refresh_sessions`
- On refresh: old token revoked, new pair issued (rotation)
- Reuse of revoked token revokes entire token family (theft detection)
- Endpoints: `POST /auth/refresh`, `POST /auth/logout`
- Implementation: `Backend/refresh_token_service.py`

### Session expiration
- Short-lived JWT access tokens
- Frontend proactive refresh 2 minutes before expiry (`AuthContext.jsx`)
- Axios interceptor retries once on 401 with refresh (`api.js`)
- `dietdesk:auth-expired` event clears session and redirects to login

### Security headers (backend)
Applied via `Backend/security_middleware.py`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Content-Security-Policy` (API responses)

### Security headers (frontend / Vercel)
`Frontend/vercel.json` adds frame/options/referrer/permissions headers on all routes.

### Dev endpoint hardening
- `POST /auth/send-verification-to-existing-user`
- `GET /auth/dev-delete-user`

Now only registered when `ENABLE_DEV_AUTH=true`. **Disabled by default in production.**

### Production secret validation
`validate_secret_key()` fails startup when `ENVIRONMENT=production` and `SECRET_KEY` is missing or default placeholder.

---

## 2. CSRF Review

| Finding | Risk | Mitigation |
|---------|------|------------|
| Auth uses **Bearer tokens** in `Authorization` header, not cookie-based session auth for API calls | **Low** — classic CSRF does not apply to custom headers | Browsers do not auto-send Bearer tokens cross-site |
| Refresh token in **HttpOnly cookie** (`dietdesk_refresh`, path `/auth/refresh`) | **Low–Medium** | `SameSite=Lax`, `Secure` in production, narrow path, rotation on use |
| No CSRF token on forms | Acceptable for SPA + Bearer pattern | Documented; cookie limited to refresh endpoint only |
| `withCredentials: true` on axios | Required for refresh cookie | CORS allowlist restricts origins |

**Recommendation:** Keep access tokens out of cookies. Refresh cookie path remains `/auth/refresh` only.

---

## 3. XSS Review

| Area | Status |
|------|--------|
| React rendering | Default escaping — **safe** |
| `dangerouslySetInnerHTML` | **Not used** in app components |
| `main.jsx` boot error | Static template only — **low risk** |
| User-generated content (patient notes, allergies) | Rendered as text in React — **safe** |
| CSP | Added on API; Vercel static headers partial; full strict CSP blocked by Vite inline scripts |

**Recommendation:** Consider nonce-based CSP when moving off `unsafe-inline` for production hardening v2.

---

## 4. Secure Cookie Review

| Cookie | HttpOnly | Secure | SameSite | Path | Purpose |
|--------|----------|--------|----------|------|---------|
| `dietdesk_refresh` | Yes | Prod only | Lax | `/auth/refresh` | Refresh token rotation |

| Storage | Content | Notes |
|---------|---------|-------|
| `localStorage` | Access JWT, user profile, expiry | XSS exposure if script injection occurs — industry-standard SPA tradeoff |
| `sessionStorage` | Refresh token fallback (local dev cross-origin) | Cleared on tab close |

**Logout** revokes refresh server-side and clears client storage.

---

## 5. Remaining Risks & Recommendations

| Priority | Item |
|----------|------|
| High | Set strong `SECRET_KEY` and `ENVIRONMENT=production` on HF |
| High | Keep `ENABLE_DEV_AUTH` unset/false in production |
| Medium | Move rate limiting to Redis for multi-instance HF |
| Medium | Add `client-log` rate limit / auth |
| Medium | Consider httpOnly access token via BFF proxy (future) |
| Low | Email verification tokens in URL — ensure short TTL (already hashed at rest) |
| Low | Public calculator endpoints — evaluate auth requirement |

---

## 6. Mobile UX Pass (375 / 768 / 1024)

Pages reviewed with responsive fixes in `mobile-responsive.css`:

| Page | Fixes |
|------|-------|
| Home (Landing) | Hero CTA stack, grid single column, overflow hidden |
| Dashboard | Action buttons full-width, stats grid |
| Patients | Filter bar stack, card grid |
| Plans | Placeholder typography |
| Assessments | Calculator grids, 16px inputs (no iOS zoom) |
| Profile (PatientDetail) | Tab scroll, overview grid |
| Settings | Single-column cards, full-width inputs |
| Create Plan (Steps 1–5) | Existing mobile step components + sticky actions |
| Auth (Login/Signup) | Padding, password checklist, 44px touch targets |

Breakpoints: `≤375px`, `≤768px`, `769–1024px` tablet grid adjustments.

---

## 7. Local Test Checklist (before deploy)

- [ ] Signup rejects weak passwords (UI + API)
- [ ] Login lockout after 5 bad passwords
- [ ] Rate limit returns 429 on rapid login attempts
- [ ] Session refreshes automatically before 30 min expiry
- [ ] Logout clears cookies and storage
- [ ] `ENABLE_DEV_AUTH=false` — dev routes return 404
- [ ] Mobile: Dashboard, Patients, Calculators at 375px width
- [ ] `npm run build` passes
- [ ] Backend starts without schema errors

---

## 8. Files Changed

**Backend:** `password_policy.py`, `rate_limit.py`, `login_throttle.py`, `refresh_token_service.py`, `security_middleware.py`, `auth_router.py`, `auth_utils.py`, `database.py`, `app.py`

**Frontend:** `api.js`, `AuthContext.jsx`, `passwordPolicy.js`, `Signup.jsx`, `apiErrors.js`, `pdfExport.js`, `mobile-responsive.css`, `vercel.json`

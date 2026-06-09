# Production Monitoring Environment Setup

## Hugging Face Space (`arrifection/nutrition-backend`)

**Settings → Repository secrets:**

| Key | Value |
|-----|-------|
| `ENVIRONMENT` | `production` |
| `SECRET_KEY` | Strong JWT signing key (required before `ENVIRONMENT=production`) |
| `SENTRY_DSN` | Backend DSN from Sentry project settings |
| `SENTRY_RELEASE` | `2db79807` (or latest commit SHA) |
| `ENABLE_SENTRY_TEST` | `false` |

**Optional variables (readable):**

| Key | Value |
|-----|-------|
| `ENVIRONMENT` | `production` |
| `SENTRY_RELEASE` | `2db79807` |

After saving → **Restart Space** (Settings → Restart).

## Vercel (frontend)

**Project → Settings → Environment Variables → Production:**

| Key | Value |
|-----|-------|
| `VITE_SENTRY_DSN` | Frontend DSN from Sentry |
| `VITE_SENTRY_RELEASE` | `2db79807` |
| `VITE_SENTRY_ENVIRONMENT` | `production` |

Redeploy production after saving.

## Automated script (optional)

```powershell
$env:HF_TOKEN = "<hf-token-with-write-access>"
$env:SENTRY_DSN_BACKEND = "<backend-dsn>"
pip install huggingface_hub
cd Backend
python scripts/configure_production_monitoring.py
```

## Verify

```bash
curl https://dietdesk.online/backend/health
# expect: environment=production, sentry=enabled, database=connected

curl https://dietdesk.online/backend/internal/sentry-test
# expect: 404
```

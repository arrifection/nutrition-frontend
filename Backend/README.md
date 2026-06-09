---
title: Nutrition Backend
emoji: 🥗
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# Backend API


This is a FastAPI backend application.

## Setup

1. Install Python 3.10+
2. Create a virtual environment:
   ```bash
   python -m venv v.env
   ```
3. Activate the environment:
   - Windows: `.\v.env\Scripts\Activate.ps1`
   - Linux/Mac: `source v.env/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Run Local Server

```bash
uvicorn main:app --reload
```

## Deployment

This app is deployed to Hugging Face Spaces.
Last updated: 2026-04-30

## Required Environment Variables

Set these in **Hugging Face Space → Settings → Variables and secrets**:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URL` | Yes | Atlas connection string |
| `SECRET_KEY` | Yes | JWT signing key (must be consistent across deploys) |
| `RESEND_API_KEY` | Yes | Resend API key (`re_...`) |
| `RESEND_FROM_EMAIL` | Yes | Verified sender address (e.g. `noreply@dietdesk.online`) |
| `FRONTEND_URL` | Yes | Production frontend base URL (e.g. `https://dietdesk.online`) |
| `DATABASE_NAME` | No | Database name (default: `nutripro_db`) |
| `CORS_ORIGINS` | No | Comma-separated extra frontend origins |
| `CORS_ORIGIN_REGEX` | No | Regex for dynamic preview domains |
| `DEBUG_EMAIL_ENABLED` | No | Set `true` to enable `POST /debug/test-email` |
| `MONGODB_TLS_INSECURE` | No | Set `true` only as last-resort debugging |

### Email verification troubleshooting

1. Check startup logs for `[EMAIL CONFIG]` — masked API key and sender must be set.
2. Enable debug endpoint: set `DEBUG_EMAIL_ENABLED=true`, then:
   ```bash
   curl -X POST https://arrifection-nutrition-backend.hf.space/debug/test-email \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com"}'
   ```
3. In Resend dashboard, verify your sending domain and that `RESEND_FROM_EMAIL` uses that domain.


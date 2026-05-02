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

- `MONGODB_URL`: Atlas connection string
- `DATABASE_NAME`: Database name (default: `nutripro_db`)
- `SECRET_KEY`: JWT signing key (must be consistent across deploys)
- `CORS_ORIGINS` (optional): comma-separated extra frontend origins
- `CORS_ORIGIN_REGEX` (optional): regex for dynamic preview domains
- `MONGODB_TLS_INSECURE` (optional): set `true` only as last-resort debugging


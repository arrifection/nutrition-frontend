# DietDesk — Backup & Recovery

**Last updated:** 2026-06-10  
**Database:** MongoDB Atlas (`nutripro_db` by default)  
**Hosting:** Hugging Face Spaces (backend), Vercel (frontend)

---

## 1. Backup strategy verification

### What the application provides

| Layer | Backup mechanism | Status |
|-------|------------------|--------|
| **MongoDB Atlas** | Automated cluster snapshots (provider-managed) | **Must be verified in Atlas UI** — not configured in repo |
| **Application code** | GitHub `main` branch | **Active** |
| **HF Space config** | HF secrets + GitHub sync workflow | **Active** |
| **Vercel frontend** | Git deploy + immutable builds | **Active** |
| **In-app export** | Per-patient PDF export | **Partial** — client copies only, not DB backup |

### MongoDB collections (production data)

| Collection | Contents |
|------------|----------|
| `users` | Accounts, auth metadata, verification |
| `patients` | Patient profiles, allergies, assessments |
| `diet_plans` | Saved meal plans |
| `history` | Activity log |
| `refresh_sessions` | Auth refresh tokens |
| Exchange list food DB | Seeded reference data (re-seedable from `exchange_list_data.py`) |

### Atlas snapshot checklist (operator)

In [MongoDB Atlas](https://cloud.mongodb.com) → Cluster → **Backup**:

1. Confirm **Cloud Backup** is enabled (M10+ or Atlas shared tier snapshot policy).
2. Note snapshot **frequency** (e.g. daily) and **retention** (e.g. 7–30 days).
3. Confirm **Point-in-Time Recovery (PITR)** if on a tier that supports it.
4. Record cluster name and project ID in your ops notes.
5. Run a **test restore to a temporary cluster** quarterly.

> **Repo finding:** No backup automation, cron jobs, or `mongodump` scripts exist in this codebase. Recovery depends entirely on **Atlas backups** + manual restore procedures.

---

## 2. Recovery objectives (recommended targets)

| Metric | Target | Current |
|--------|--------|---------|
| **RPO** (max data loss) | ≤ 24 hours | Depends on Atlas snapshot interval — **unverified** |
| **RTO** (time to restore service) | ≤ 4 hours | **No runbook-tested** |
| **Geographic redundancy** | Atlas multi-region optional | **Unverified** |

---

## 3. Restore process (high level)

### Option A — Atlas snapshot restore (full cluster)

1. Atlas → Backup → select snapshot → **Restore**.
2. Restore to **new cluster** (recommended) or overwrite (destructive).
3. Update `MONGODB_URL` in HF Space secrets to new connection string.
4. Restart HF Space; verify `GET /health` returns `"database": "connected"`.
5. Smoke-test login, patient list, plan load, PDF export.

### Option B — Collection-level export/import

1. `mongodump --uri="$MONGODB_URL" --db=nutripro_db --collection=patients`
2. Restore: `mongorestore --uri="$NEW_URL" --db=nutripro_db dump/nutripro_db/`
3. Repeat per collection (`users`, `diet_plans`, `history`).

### Option C — Re-seed reference data only

Exchange list can be re-seeded on backend startup via `seed_food_data()` when DB is empty or schema outdated. **Does not restore patient/user data.**

---

## 4. Post-restore validation

- [ ] `GET https://dietdesk.online/backend/health` → `status: healthy`
- [ ] Login with known test account
- [ ] Patient count matches expected
- [ ] Open saved plan for test patient
- [ ] Export PDF from Step 5
- [ ] Check Sentry for new errors (should be quiet)

---

## 5. Disaster recovery readiness score

| Area | Score (1–5) | Notes |
|------|-------------|-------|
| Atlas automated backups | **?/5** | Not verifiable from repo — operator must confirm |
| Documented restore steps | **4/5** | This doc + admin runbook |
| Tested restore drill | **1/5** | No evidence of quarterly drill |
| App health monitoring | **4/5** | `/health` endpoint + Sentry |
| Code/config recovery | **5/5** | GitHub + HF/Vercel redeploy |
| **Overall readiness** | **3/5** | Adequate docs; Atlas backup unverified; no tested drill |

---

## 6. Remaining risks

1. **Atlas backup tier unknown** — free/shared tiers have limited snapshot windows.
2. **No off-site DB export** — if Atlas project is deleted, data may be unrecoverable.
3. **Secrets not backed up** — `SECRET_KEY` change invalidates existing JWTs; document secret rotation.
4. **HF Space ephemeral disk** — `startup_check.txt` / logs are not durable; not critical for data.
5. **No cross-region failover** — single HF Space + single Atlas cluster = single region dependency.
6. **Patient PDFs are not stored server-side** — PDF export is generated on demand; only DB holds plan JSON.

---

## 7. Recommended next steps

1. Enable and verify Atlas **Cloud Backup** with ≥ 7-day retention.
2. Schedule quarterly **restore drill** to a staging cluster.
3. Store `MONGODB_URL`, `SECRET_KEY`, `SENTRY_DSN` in a secure password manager backup.
4. Add Atlas **alert** on backup failure (Atlas → Alerts).

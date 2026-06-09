# DietDesk — Admin Runbook

**Audience:** Operator / founder  
**Production:** https://dietdesk.online · Backend HF Space · MongoDB Atlas

---

## Quick reference

| Task | Where |
|------|-------|
| Backend logs | HF Space → Logs tab |
| Frontend deploy | Vercel dashboard (auto on `main` push) |
| Backend deploy | GitHub push `Backend/**` → HF sync workflow |
| DB console | MongoDB Atlas → Browse Collections |
| Error monitoring | Sentry project dashboard |
| Health check | `GET /backend/health` |

---

## Health check

```bash
curl https://dietdesk.online/backend/health
```

Expected:

```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production",
  "release": "<git-sha-or-version>"
}
```

`degraded` = API up but MongoDB unreachable.

---

## Restore users

### When to use

- Accidental user deletion
- Corrupted `users` collection
- Partial restore after incident

### Steps

1. **Stop writes** (optional): scale HF Space to paused or display maintenance banner on frontend.
2. Atlas → Backup → select snapshot **before incident**.
3. Restore `users` collection only to a **staging cluster** first.
4. Export needed documents:

   ```bash
   mongodump --uri="<STAGING_URI>" --db=nutripro_db --collection=users
   ```

5. Import to production (target specific emails only to avoid overwriting good data):

   ```bash
   mongorestore --uri="<PROD_URI>" --db=nutripro_db --collection=users dump/nutripro_db/users.bson
   ```

6. Verify: affected user can log in; `refresh_sessions` may need re-login (clear stale sessions).

### Notes

- Passwords are bcrypt-hashed — restore preserves credentials.
- `SECRET_KEY` must match the key used when tokens were issued, or users re-login.

---

## Restore patients

### When to use

- Deleted or corrupted patient profiles
- Bad migration / bad script

### Steps

1. Identify affected `owner_id` (user) and patient `_id` values from Atlas or logs.
2. Restore from snapshot to staging; query:

   ```javascript
   db.patients.find({ owner_id: "<user_id>" })
   ```

3. Export/import single documents with `mongoexport` / `mongoimport`, or restore full `patients` collection to staging and copy documents.

4. Verify in app: Patients list, Step 1 fields (allergies, restrictions, notes), assessment data.

### Related collections

- `diet_plans` references `patient_id` — restore patients before plans if both affected.

---

## Restore plans

### When to use

- Missing weekly meal plans
- Corrupted `diet_plans` documents

### Steps

1. Atlas backup → restore `diet_plans` collection to staging.
2. Find plan by patient:

   ```javascript
   db.diet_plans.find({ patient_id: "<patient_oid>" })
   ```

3. Import selected documents to production `diet_plans`.

4. Verify: open patient → plan history → Step 5 weekly view → PDF export.

### Re-seed exchange list (not patient plans)

If food database is empty/corrupt, restart backend — `seed_food_data()` re-populates from `exchange_list_data.py` when count is low or schema outdated.

---

## Sentry test (production)

### Backend

1. Set HF secrets: `SENTRY_DSN`, `ENVIRONMENT=production`, `SENTRY_RELEASE=<commit>`.
2. Temporarily set `ENABLE_SENTRY_TEST=true`.
3. `curl https://dietdesk.online/backend/internal/sentry-test`
4. Confirm event in Sentry → Issues.
5. Set `ENABLE_SENTRY_TEST=false`.

### Frontend

1. Set Vercel env: `VITE_SENTRY_DSN`, `VITE_SENTRY_RELEASE`, `VITE_ENABLE_SENTRY_TEST=true`.
2. Redeploy; open browser console on https://dietdesk.online:

   ```javascript
   window.__dietdeskSentryTest?.()
   ```

3. Confirm event in Sentry.
4. Remove `VITE_ENABLE_SENTRY_TEST`.

---

## Incident checklist

1. Check `/health` and HF logs.
2. Check Sentry for spike.
3. Check Atlas cluster status (Alerts).
4. If data loss suspected — **do not write** until snapshot identified.
5. Restore to staging first; validate; then promote to prod.
6. Post-incident: update this runbook with lessons learned.

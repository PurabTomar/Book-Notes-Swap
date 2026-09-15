# SATI Swap — Bug Diagnosis Framework

> **Status:** v1.0 | **Date:** Sep 15, 2026
> Use for "something is broken / slow / failing" reports.

---

## 1. Diagnosis Loop

```
1. REPRODUCE
   - Exact steps? Browser/device? Network present?
   - Works when logged out? Different account?
2. ISOLATE THE LAYER
   - Frontend (React/render)  |  Data (repo call)  |  Network (Supabase)  |  SQL/RLS  |  Realtime channel
3. FORM HYPOTHESIS (top 3, ranked)
4. VERIFY FASTEST, CHEAPEST HYPOTHESIS FIRST
5. FIX → confirm no regression → write regression test
```

---

## 2. Common Failure Signatures

| Symptom | First thing to check |
|---|---|
| Feed empty but data exists | Query filter mismatch, status filter, RLS hiding rows, `isSupabaseConfigured` false |
| Listing disappears unexpectedly | Status transition (reserved/removed) or RLS owner check |
| Chat messages not live | Realtime publication missing for `messages`, channel name mismatch, subscription unmounted |
| User "stuck" at onboarding | Profile row trigger not created on signup / RLS prevents insert |
| Can't upload photo | Bucket missing / not public / path wrong / file too large |
| "Supabase not connected" | `.env` keys empty or malformed; server env not passed |
| Works locally, fails on Vercel | Missing VITE_* env vars in Vercel project settings |
| Slow feed | Missing index, no pagination, image sizes huge |
| "not found" on listing detail | Deleted/removed row, or RLS blocks anonymous read |

---

## 3. First-Move Playbook

### For UI bugs
```
1. Browser console → filter errors
2. React DevTools → which component re-renders?
3. Network tab → is the REST call correct? Status code? Body?
```

### For data bugs
```
1. Run the same query in SQL Editor as the client would (with current_user role)
2. Does RLS policy allow it? Check `security_definer` / using vs with check
3. Check Realtime: `select * from pg_publication_tables` — messages table present?
```

### For RLS-is-suspect bugs
```sql
-- quick read of what's blocking
select policyname, cmd, qual, with_check
from pg_policies where tablename = 'messages';
```
Then reproduce as anon:
```sql
set role anon;
select * from messages;   -- expect: empty or error that matches the app symptom
reset role;
```

### For auth bugs
```bash
# check env in local build
Get-Content .env | Where-Object { $_ -match '^VITE_' }
# confirm long-lived access token header (not the publishable key being misread)
```

---

## 4. Performance Triage

| Symptom | Measure | Tool |
|---|---|---|
| Render jank | Long tasks / re-renders | React Profiler |
| Network latency | API response times | DevTools Network |
| DB slow query | EXPLAIN ANALYZE | SQL Editor |
| Bundle bloat | Build size | `npm run build` + vite analyze |

Quick dict: if every keystroke triggers a DB call → missing debounce. If chat re-renders whole list → callback identity / missed memo. If feed fetches thousands of rows → add pagination (T9).

---

## 5. Regression Policy

Every fixed bug gets a regression test in the file that owns the layer:
- Logic bug → `lib/*.test.js`
- Data bug → repo test or RLS assertion
- Flow bug → Playwright spec (WEBAPP_TESTING.md)

## 6. Escalation Order

1. Query construction (repositories) → compare to SQL you'd hand-write
2. RLS policy (SPEC §7 matrix)
3. Realtime publication / channel names
4. Deployment/tooling (Vercel env, stale build)
5. Supabase project settings (bucket public, email auth enabled)

## 7. Bug Report Template

```
## Symptom
## Expected vs Actual
## Repro (steps, account, device/browser, network)
## Layer isolated
## Root cause (with file:line or SQL)
## Fix
## Regression test added: <path>
## Verified: dev-server ✔ / build ✔
```
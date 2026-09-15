# SATI Swap — Code Review Checklist

> **Status:** v1.0 | **Date:** Sep 15, 2026

Used for every PR. Review along two axes: **Standards** (repo conventions) and **Spec** (what the ticket asked for).

---

## 1. Standards Axis

- [ ] Naming matches `docs/DOMAIN_MODEL.md` (Listing not `post`, Conversation not `chat`, etc.)
- [ ] No direct `supabase.from(...)` calls in components — goes through repositories
- [ ] Realtime subscriptions are cleaned up on unmount (hook owns lifecycle)
- [ ] Presentational components accept props; they don't fetch
- [ ] No comments added unless asked (repo convention)
- [ ] Pure logic lives in `lib/` + has unit tests
- [ ] Errors are user-friendly ("Couldn't reach server", not raw `select failed`)
- [ ] No secrets: grep for `service_role|SUPABASE_SECRET|sbp_|sb_publishable` in source
- [ ] `.env` not committed; keys only in `.env.example` placeholders

## 2. Spec Axis

- [ ] Matches ticket definition of done in `docs/TICKETS.md`
- [ ] Domain invariants respected (SPEC §6, DOMAIN_MODEL §4)
- [ ] RLS policy added/changed has evidence (SQL test or manual check documented)
- [ ] Route guards: `/new`, `/chat/*`, `/my-listings` behind `RequireVerified`
- [ ] Mobile-first responsive (test at 360px and 1440px)
- [ ] Free/donate invariant: `is_free=true ⇒ price=null`
- [ ] Status transitions only from allowed states

## 3. Security Review (every change touching data)

- [ ] New table → policy matrix updated in SPEC §7
- [ ] New write path → owner/participant check exists at DB level (not just UI)
- [ ] File uploads: type + size validated client & server-side
- [ ] Any new exposure of phone/email → confirmed necessary (contacts moved to in-app chat)

## 4. UX/Quality Bar

- [ ] Empty/loading/error states present (EmptyState, skeletons, Toasts)
- [ ] Keyboard accessible; touch targets ≥ 44px
- [ ] No flash-of-unstyled-content; layout stable while loading
- [ ] Copy uses approved microcopy (FRONTEND §6)

## 5. Performance

- [ ] Images have width/height or aspect-ratio (no layout shift)
- [ ] Search is debounced
- [ ] List over 100 items → pagination/infinite scroll (feed should not fetch all rows)

## 6. Review Output

For each PR, leave:
```
## Standards
✓ / ✗  (referenced file:line for any ✗)

## Spec
✓ / ✗  Ticket: T{number}

## Blocking issues
1. ... (must fix before merge)

## Non-blocking
- ...
```
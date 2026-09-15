# SATI Swap — Project Docs

This folder contains the full design + planning package for **SATI Swap**, the SATI-only student marketplace with a WhatsApp-style chat experience.

## Documents

| Doc | Purpose |
|-----|---------|
| [SPEC.md](./SPEC.md) | Full product spec: scope, functional & non-functional requirements, schema, RLS matrix |
| [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) | Shared vocabulary, entity relationships, state machines, invariants |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Tech stack, directory layout, module boundaries, realtime & auth flows |
| [FRONTEND.md](./FRONTEND.md) | Visual direction: brand, palette, nav model, screen-by-screen spec, motion |
| [TICKETS.md](./TICKETS.md) | Ordered implementation tickets (M0 → M7) with definitions of done |
| [TDD.md](./TDD.md) | Test-first strategy, tooling, red-green walks, coverage targets |
| [WEBAPP_TESTING.md](./WEBAPP_TESTING.md) | Playwright playbook for auth/listing/chat/favorites e2e flows |
| [CODE_REVIEW.md](./CODE_REVIEW.md) | Review checklist (Standards + Spec axes + security) |
| [BUG_DIAGNOSIS.md](./BUG_DIAGNOSIS.md) | Diagnosis loop + failure signatures + triage playbook |

## Related

| Path | What |
|------|------|
| [`../prototype/index.html`](../prototype/index.html) | Interactive clickable mobile prototype (open in browser) |
| [`../supabase/schema.sql`](../supabase/schema.sql) | Current (hackathon) schema — v2 replaces it (T1) |
| [`../src/`](../src) | Current React codebase |
| [`../OPENCODE_SKILLS.md`](../OPENCODE_SKILLS.md) | Installed opencode skills reference |
| [`../.env.example`](../.env.example) | Env template (keys never committed) |

## Quick Start

```bash
npm install
npm run dev        # dev server on :5173
```

Open `prototype/index.html` in a browser to click through the UI prototype.

## Current Build Status

- Hackathon MVP shipped: browse, search, post listing, WhatsApp/phone/email contact links.
- Next milestone (M0): schema v2 + real profiles, in-app chat replaces contact fields.
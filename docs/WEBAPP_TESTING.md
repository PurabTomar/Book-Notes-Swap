# SATI Swap — Web App Testing Playbook

> **Status:** v1.0 | **Date:** Sep 15, 2026

---

## 1. Tooling

- **Playwright** (Chromium + WebKit) against the local dev server (`vite dev`) and against the deployed URL.
- Two browser **contexts** are needed for chat/conversation tests.

## 2. Before You Run

```bash
npm run dev           # local
npm run build && npm run preview   # production-like
```

E2E env: use `VITE_SUPABASE_URL` + anon key pointed at a **test project** (not prod data). Seed deterministic fixtures so tests are idempotent.

## 3. Critical Flows

### 3.1 Onboarding / Auth
1. Visit `/` → redirected to auth page
2. Register with fresh email
3. Fill onboarding (branch, year, semester, avatar)
4. Land on verified home (or verify-banner if not auto-verified)

### 3.2 Create a Listing
1. Tap FAB (＋) → category sheet
2. Pick "Books"
3. Upload 2 photos
4. Fill title/subject/condition/price
5. Toggle FREE → price field disables
6. Submit → row appears in feed (realtime)

### 3.3 Chat Flow (two contexts)
1. Context A (buyer) opens a listing → "Chat with Seller"
2. Conversation created → Message bubble sent
3. Context B (seller) sees conversation with unread badge
4. Seller replies → buyer sees live update
5. Read receipts flip

### 3.4 Favorites
1. Save a listing → appears in Saved tab
2. Unsave → disappears

### 3.5 My Listings + Status
1. Owner marks listing `reserved` → excluded from public feed
2. Owner marks `sold` → shows "sold" banner, review available

## 4. Negative / Security Cases

- **A different user cannot open a conversation they're not in** (expect 404/redirect)
- **Unverified user cannot POST a listing** (expect denied)
- **User B cannot edit User A's listing**
- **Anonymous can't read messages**

## 5. Assertions on the Realtime Feed

- Playwright `page.waitForSelector` on new card after create
- `page.waitForResponse` not needed — realtime is socket-based; assert DOM change

## 6. Visual/UX Checks (manual + screenshot diff)

- Bottom nav reaches all tabs
- FAB does not overlap last row
- Dark theme contrast
- Keyboard tab order (desktop)

## 7. Recording Debug Info

```bash
npx playwright test --debug
npx playwright show-report
```

## 8. CI Integration

```yaml
# .github/workflows/e2e.yml (stub)
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      uses: actions/checkout@v4
      run: npm ci
      run: npm run build
      run: npx playwright install --with-deps
      run: npx playwright test
      env:
        VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
```

## 9. Data Hygiene

- Every e2e run uses a dedicated test user (email like `e2e-<runId>@sati.test`)
- Cleanup job deletes test listings > 24h old
- Never point e2e at real production data
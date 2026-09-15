# SATI Swap — Test-Driven Development Strategy

> **Status:** v1.0 | **Date:** Sep 15, 2026

---

## 1. Principle

**Test-first for pure logic and repositories; integration tests for UI-critical paths.** Security (RLS) is tested at the SQL level — never only by "does the UI hide the button."

---

## 2. Test Tooling

| Layer | Tool |
|---|---|
| Unit (pure logic) | Vitest |
| React component | @testing-library/react + Vitest |
| Supabase repo integration | `@supabase/supabase-js` against pointed test schema |
| RLS policies | SQL script + assertions (pgTAP or Supabase local) |
| E2E | Playwright (2 browser contexts for chat) |
| Coverage gate | ≥ 80% for `src/lib`, `src/repositories`, critical hooks |

---

## 3. What To Test First (Red → Green)

### 3.1 `lib/validation.js`
```js
// Write test first for:
validateTitle("")          -> { title: "Title is required" }
validateTitle("x".repeat(201)) -> { title: "Max 200 characters" }
validateListing({ is_free: true })          -> { price: undefined }
validateListing({ is_free: false, price: -1 }) -> { price: "Enter a valid price" }
validateBranch("ME")       -> ok
validateBranch("SpaceEng") -> { branch: "Unknown branch" }
validatePrice vs isFreeInvariant (never both)
validatePhoto(file)        -> { type, size } checks
```

### 3.2 `lib/format.js`
- `formatPrice`: free/paid/edge (null price, 0, NaN)
- `timeAgo`: nested branches (seconds/minutes/hours/days/months/years)

### 3.3 `repositories/listingsRepo.js`
Mock supabase client (`vi.mock`). Assert:
- feed query applied filters correctly (call args)
- order desc by createdAt
- status=active enforced
- createListing coerces `is_free → price=null`
- owner check on updateStatus

### 3.4 `repositories/chatRepo.js`
- startOrResume returns existing conversation when one exists
- sendMessage rejects when user not participant (expected repository guard)
- fetchMessages sorted ascending

### 3.5 Hooks
- `useListings` — loading → data; realtime event triggers refetch; error path
- `useChat` — subscribe/unsubscribe; optimistic append rollback on failure

---

## 4. RLS Unit Tests (SQL-level)

Write `supabase/security_tests.sql` that asserts with `DO $$` blocks and raises exceptions on violation:

```sql
-- Expect failure (must throw):
select * from messages m
join conversation_participants p on p.conversation_id = m.conversation_id
where not exists (
  select 1 from conversation_participants c
  where c.conversation_id = m.conversation_id and c.user_id = auth.uid()
);
-- -> policy should prevent this; test signals its own violation
```

Better: use `pgTAP` style assertions in the migration runner, or run negative checks from the **anon client** in a Vitest integration file:

```js
// integration.test.js
const anon = createClient(testUrl, anonKey);
await expect(
  anon.from("messages").select("*")
).rejects.toMatch(/row-level security/i);
```

---

## 5. Red-Green Walkthrough (example ticket: T17 start conversation)

1. **RED** — Write test:
   ```js
   describe("startOrResumeConversation", () => {
     it("returns existing conversation when listing already has one with same two users", async () => { ... });
     it("creates exactly 2 participant rows on new conversation", async () => { ... });
     it("refuses to participate a user who is not seller or buyer", async () => { ... });
   });
   ```
2. **GREEN** — implement `chatRepo.startOrResumeConversation` + schema if needed.
3. **REFACTOR** — extract shared `participantGuard` used by both `sendMessage` and `startConversation`.

---

## 6. Test File Layout

```
src/
  lib/
    validation.test.js
    format.test.js
  repositories/
    listingsRepo.test.js
    chatRepo.test.js
    favoritesRepo.test.js
    profileRepo.test.js
  hooks/
    useListings.test.js
    useChat.test.js
e2e/
  onboarding.spec.js
  create-listing.spec.js
  chat.spec.js        # 2 browser contexts
  favorites.spec.js
supabase/
  security_tests.sql  # run by CI, must exit 0
```

---

## 7. Commands

```bash
# dev deps to add
npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom playwright

# run unit/integration
npx vitest run

# run e2e (build first)
npm run build && npx playwright test

# RLS security check (CI step)
psql "$SUPABASE_DB_URL" -f supabase/security_tests.sql
```

---

## 8. Coverage Expectations

| File | Target |
|---|---|
| lib/validation.js | 100% |
| lib/format.js | 100% |
| repositories/* | 90%+ |
| hooks/useChat.js | 90%+ |
| UI components | 60%+ (smoke + key interactions) |

---

## 9. Non-Goals

- Do NOT write unit tests for every CSS rule or layout pixel.
- Do NOT mock RLS — test RLS against the real policies.
- Do NOT snapshot-test entire pages (brittle).
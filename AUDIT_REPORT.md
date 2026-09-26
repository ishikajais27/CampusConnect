# CampusConnect — Student Portal Error Audit
**Branch:** `Prabin` | **Date:** 2026-09-26

---

## ✅ What Passes

| Check | Status |
|---|---|
| TypeScript compiler (`tsc --noEmit`) | ✅ Zero errors |
| `tests/registrations.test.ts` | ✅ PASS |
| `tests/search.test.ts` | ✅ PASS |
| App compiles and serves at `http://localhost:3002` | ✅ OK |

> **Note:** `tests/events.tests.ts` uses the filename pattern `*.tests.ts` (double "s") but the vitest config only picks up `*.test.ts`. This file is **silently skipped** — see Bug #3 below.

---

## 🐛 Bugs Found

### Bug 1 — `registrations/page.tsx` uses undefined CSS classes (UI renders broken)

**File:** `app/registrations/page.tsx`

The Registrations page uses old legacy class names (`shell`, `eyebrow-tag`, `card-surface`, `btn`, `btn-primary`, `btn-secondary`) and CSS custom properties (`var(--font-display)`, `var(--ink-soft)`) that **no longer exist** in the codebase. The rest of the app was fully migrated to Tailwind, but this page was left behind.

**Affected lines:** 15, 27, 29, 30, 44, 57, 71, 72, 82, 101

**Impact:** The "My Registrations" page renders with broken layout, unstyled text, and broken button appearance.

---

### Bug 2 — `organizer/page.tsx` uses undefined CSS class `bg-surface-white` and Tailwind tokens

**File:** `app/organizer/page.tsx`

- `bg-surface-white` — not defined in `tailwind.config.ts` (lines 55, 59, 63, 70)
- `font-display-hero` / `text-display-hero` — not defined in `tailwind.config.ts` (line 47)
- `font-label-sm` / `text-label-sm` — not defined in `tailwind.config.ts` (lines 91–95)
- `border-divider-hairline` — not defined anywhere (lines 90, 102)
- `py-space-sm` — not defined in the spacing tokens in `tailwind.config.ts` (line 73)

**Impact:** These Tailwind classes silently produce no output — the Organizer page metrics cards have no background color, and heading/labels do not have styled typography.

---

### Bug 3 — `tests/events.tests.ts` is silently skipped by the test runner

**File:** `tests/events.tests.ts`  
**Config:** `vitest.config.ts`

The vitest config includes only `tests/**/*.test.ts` but the events test file is named `events.tests.ts` (plural "tests" before the extension). It is **never executed** by `npm test`.

```ts
// vitest.config.ts line 12
include: ['tests/**/*.test.ts'],   // ← only matches *.test.ts
```

**Impact:** The `isPastEvent` test is never run so it can never catch regressions.

---

### Bug 4 — Navbar has a duplicate `/events` link (logic error)

**File:** `components/Navbar.tsx` — Lines 53–58

A hardcoded "Collegiate Series" link to `/events` is rendered **in addition to** the "Events" link from the `NAV_LINKS` array.

**Impact:** Students see two separate links to the same `/events` page in the navbar on all non-events pages.

---

### Bug 5 — `StatusBadge` uses wrong color for `open` status

**File:** `components/StatusBadge.tsx` — Line 11

```ts
open: 'bg-secondary-container text-primary',  // ← text-primary is wrong
```

Everywhere else in the codebase (e.g. `EventCard.tsx`, `events/page.tsx`), the open badge correctly uses `text-secondary`. The `StatusBadge` component uses `text-primary` (red) instead, making it visually inconsistent.

---

### Bug 6 — `registrations/page.tsx` shows `StatusBadge` with a simplified status that ignores past events

**File:** `app/registrations/page.tsx` — Line 96

```tsx
<StatusBadge status={reg.status === 'cancelled' ? 'cancelled' : 'open'} />
```

Past events are always shown as `open` (green) instead of checking `isPastEvent(event)`. For `reg-02` (Football Cup Final on 2026-09-05 — before TODAY = 2026-09-16), the badge incorrectly shows "Open".

---

## Summary Table

| # | Severity | File | Issue |
|---|---|---|---|
| 1 | 🔴 High | `app/registrations/page.tsx` | Legacy CSS classes cause unstyled rendering |
| 2 | 🟠 Medium | `app/organizer/page.tsx` | Missing Tailwind tokens — no backgrounds/fonts applied |
| 3 | 🟠 Medium | `tests/events.tests.ts` | File never executed due to wrong filename pattern |
| 4 | 🟡 Low | `components/Navbar.tsx` | Duplicate `/events` link in nav |
| 5 | 🟡 Low | `components/StatusBadge.tsx` | Wrong text color for `open` status |
| 6 | 🟡 Low | `app/registrations/page.tsx` | Past events shown as "Open" instead of "Past" |

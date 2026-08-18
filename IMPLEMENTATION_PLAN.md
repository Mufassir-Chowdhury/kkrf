# Firestore restructuring: year-scoped scholarship data

## Problem

`scholarships/{year}` already exists as a year-keyed doc (good — `settings/general.activeScholarshipId`
points to the active one). But the actual registration data lives in **hardcoded, year-suffixed
top-level collections**, so every new year requires a code change:

- `scholarshipApplications-2025` (online applications) — written/read in
  `britti_registration/+page.svelte`, `admin/db.js`, `admin/online/+page.svelte`
- `offline-2025` (offline registrations) — written/read in `offline/[branch]/+page.svelte`,
  `admin/list/[branch]/db.js`, `admin/list/+page.svelte`, `admin/list/[branch]/+page.svelte`,
  `admin/result/+page.svelte`, `admin/search/search-db.js`, `admin/institutions/+page.svelte`,
  `admit/+page.svelte`, `admit/[roll]/AdmitCard.svelte`, `admin/list/[branch]/admit/BatchAdmitCards.svelte`,
  `admin/online/+page.svelte` (offline fallback doc)
- `refund-2025` — `refund/+page.svelte`, `admin/refund/+page.svelte`, `admin/refund/db.js`
- `_cache` (global, not year-scoped at all — will silently corrupt across years):
  `start_roll` (roll-number counters), `online-serial`, `institution-groups`, `merge-rules`

There is no `firebase-admin`/Cloud Functions in this repo — everything runs through the client SDK
(`src/lib/firebase.js`), so migration has to be a client-side script/admin page, not a Node script.

## Target schema

Keep `scholarships/{year}` as the year doc, and move all year-scoped data into **subcollections**
under it. Subcollection queries are scoped to the parent doc automatically, so this stays exactly
as efficient as the current top-level collections (no extra `where('year', '==', ...)` filter needed,
same index cost) while removing the need to touch code for each new year.

```
scholarships/{year}                          (doc, unchanged)
scholarships/{year}/applications/{id}         was scholarshipApplications-2025
scholarships/{year}/offline/{id}              was offline-2025
scholarships/{year}/refunds/{id}              was refund-2025
scholarships/{year}/cache/start_roll          was _cache/start_roll
scholarships/{year}/cache/online_serial       was _cache/online-serial
scholarships/{year}/cache/institution_groups  was _cache/institution-groups
scholarships/{year}/cache/merge_rules         was _cache/merge-rules
```

`settings/general` stays as-is.

## Steps (approve one at a time — do not batch)

1. **Add year-scoped path helpers.** New `src/lib/yearScope.js`: `applicationsCol(year)`,
   `offlineCol(year)`, `refundsCol(year)`, `cacheDocRef(year, name)`, plus a small helper/store for
   "currently selected admin year" (defaults to the active scholarship's year).
2. **Migration utility.** A one-off, admin-only tool (button on an admin page, run manually, not
   auto-run) that copies the existing `-2025` collections and `_cache/*` docs into
   `scholarships/2025/...`. Verifies doc counts before/after. Does **not** delete the old data.
3. **Update public write paths** to the new schema: `britti_registration/+page.svelte`,
   `offline/[branch]/+page.svelte`, `refund/+page.svelte` — writing into
   `scholarships/{activeYear}/...` using the active scholarship's year.
4. **Update admin read/write modules** to the new schema: `admin/db.js`, `admin/refund/db.js`,
   `admin/list/[branch]/db.js` (incl. roll-number cache), `admin/search/search-db.js`,
   `admin/online/+page.svelte` (incl. serial cache), `admin/institutions/+page.svelte` (incl.
   merge-rules/groups cache), `admin/result/+page.svelte`, `admin/list/+page.svelte`,
   `admin/list/[branch]/+page.svelte`, `admin/list/edit/[id]/+page.svelte`,
   `admin/list/[branch]/admit/*`, `admit/+page.svelte`, `admit/[roll]/AdmitCard.svelte`.
5. **Year switcher in the admin panel.** A dropdown/tabs sourced from `getAllScholarships()` on the
   registrations/offline-list/refund/online/result/search/institutions pages, letting the admin
   cycle between years. Defaults to the active scholarship's year. Selecting a year re-queries that
   year's subcollections — no code change needed for future years.
6. **Verify new-year creation needs nothing extra.** Subcollections auto-create on first write, so
   `admin/scholarship`'s "create new year" flow shouldn't need structural changes — just confirm the
   other admin pages behave correctly (empty states, year switcher picking up the new year
   immediately) for a year with zero docs.
7. **End-to-end test** against the new schema: online registration, offline registration, refund,
   roll assignment, results upload, admit cards, search — for the migrated 2025 data and a fresh
   test year.
8. **Cleanup (only after you sign off).** Delete the old `-2025` top-level collections and `_cache`
   doc. Manual/optional — not automated.
9. **Create the missing `scholarships/2025` doc.** The migration (Step 2) copied the *data*
   (`applications`/`offline`/`refunds`/`cache`) into `scholarships/2025/...`, but no `scholarships/2025`
   parent doc was ever created — historically that year's info (exam date, fee, syllabus, etc.) lived in
   static page content, not in the `scholarships` collection introduced later. Because
   `getAllScholarships()` (and therefore `YearSwitcher`) only lists docs that exist in the `scholarships`
   collection, 2025 doesn't show up as a pickable year and its migrated data is currently unreachable
   from the admin panel. Fix: create a `scholarships/2025` doc (via `/admin/scholarship`, e.g. using the
   existing `SEED_2025` fallback data as a starting point, or a small one-off script) so it appears in
   the switcher and its subcollections become reachable.
10. **Make the year switcher more prominent.** Currently a small `<select>` in the admin header next to
    Logout — easy to miss. Redesign so the selected year is clearly visible at a glance (e.g. larger/
    styled control, a visible "Year: 2026" label, or move it into the page body near each section's
    title) so admins don't act on the wrong year by mistake.

---
Status:
- Step 1 done: `src/lib/yearScope.js` path helpers + `selectedYear` admin store.
- Step 2 done: `src/lib/migrateLegacyYear.js` + `/admin/migrate` page. Firestore rules updated
  (`firestore.rules`) to allow the new `scholarships/{year}/...` subcollections. 2025 data migrated
  and verified: 184 applications, 4593 offline, 41 refunds, 4 cache docs. Old `-2025` collections
  left untouched as backup.
- Step 3 done: `britti_registration/+page.svelte`, `offline/[branch]/+page.svelte`, `refund/+page.svelte`
  now write into `scholarships/{activeYear}/applications|offline|refunds` via the shared `db` +
  `yearScope.js` helpers, using the active scholarship's year (fetched via `getActiveScholarship()`).
  Dropped each page's duplicate `initializeApp`/`getFirestore` calls in favor of the shared instance.
  All three now no-op with a submit error if there's no active scholarship configured (previously
  would have crashed/thrown on missing `db`).
- Step 4 done: every admin read/write module and public admit-card lookup now uses the
  `scholarships/{year}/...` schema via `yearScope.js` helpers, resolved through
  `loadAdminYear()`/`getCurrentYear()` (defaults to the active scholarship's year). Files touched:
  `admin/db.js`, `admin/refund/db.js` + `refund/+page.svelte`, `admin/online/+page.svelte`,
  `admin/list/[branch]/db.js` + `+page.svelte` (roll-number cache included), `admin/list/+page.svelte`,
  `admin/list/edit/[id]/+page.svelte` (year threaded via `?year=` query param), `admin/list/[branch]/admit/*`
  (year via query param too), `admin/institutions/+page.svelte` (merge-rules/groups cache included),
  `admin/result/+page.svelte` + `UploadResultModal.svelte`, and the public `admit/+page.svelte` /
  `admit/[roll]/AdmitCard.svelte` (scoped to the active year, matching prior behavior). Admin panel and
  public forms are now consistent again — new registrations submitted after Step 3 are visible in the
  admin panel. Left untouched as out-of-scope: `admin/search/search-db.js`'s dead/broken `searchByMobile`
  function (was already missing imports before this work) and the Algolia-backed global search index
  (external service, not Firestore).
- Step 5 done: added `src/lib/components/YearSwitcher.svelte` (a `<select>` sourced from
  `getAllScholarships()`, bound to the `selectedYear` store) and mounted it once in the admin header
  (`(admin)/+layout.svelte`), next to Logout — so it's visible on every admin page instead of being
  duplicated per page. `admin/online`, `admin/refund`, `admin/list`, `admin/list/[branch]`,
  `admin/institutions`, and `admin/result` each now have a `$: if ($selectedYear !== year) { ... }`
  reactive block that reloads their data (and resets selection/merge state where relevant) the moment
  the admin picks a different year — no page navigation needed. Left as-is (already year-scoped via
  `?year=` query param from their parent list page, not global switcher targets):
  `admin/list/edit/[id]`, `admin/list/[branch]/admit`. `admin/search` (Algolia) is unaffected — it's a
  separate global search index, not Firestore.
- Found during manual testing (2026-08-18): no `scholarships/2025` doc exists, so the migrated 2025 data
  is currently unreachable from the admin panel (see Step 9), and the year switcher is too subtle/easy
  to miss (see Step 10). Added both as new steps above.
- Step 9 done: `SEED_2025` moved from `admin/scholarship/+page.svelte` into `src/lib/siteData.js`
  (exported) so it's a single source of truth. Added a "create scholarships/2025 doc" button to
  `/admin/migrate` (`handleSeed2025Doc`) that calls `saveScholarship('2025', SEED_2025)` — but only
  after checking `getScholarship('2025')` returns nothing, and without ever touching
  `settings/general.activeScholarshipId`, so running it can't change which year is live on the
  public site. Once run, 2025 will appear in `getAllScholarships()`/`YearSwitcher` and its migrated
  subcollection data becomes reachable from the admin panel. Not yet run against production —
  admin needs to click the button.
- Step 10 done: `YearSwitcher.svelte` now renders an amber badge (`বছর: <year>`) instead of a plain
  `<select>` blended into the header, so the active admin year is clearly visible at a glance against
  the dark header bar. No structural change — still the same `selectedYear` store/`getAllScholarships()`
  wiring from Step 5.
- Step 6 done: verified `admin/list`, `admin/list/[branch]` (+ `db.js`), `admin/online`, `admin/refund`,
  `admin/institutions`, `admin/result`, and their cache docs (`start_roll`, `online_serial`,
  `institution_groups`, `merge_rules`) all handle a brand-new year with zero subcollection docs cleanly:
  every cache read checks `.exists()` before calling `.data()`, empty query results render proper
  "no data" states, and roll/serial assignment initializes sane defaults (`center0001`/`99001`) when no
  cache doc exists yet. `admin/scholarship`'s "create new year" flow only writes the
  `scholarships/{year}` doc and never touches subcollections, confirming they auto-create on first
  write with no code changes needed. No code changes required for this step.
- Step 7 partially done: no browser automation available this session (Chrome extension declined), so
  ran a route-level smoke test instead — `dev` server started (`vite dev`, port 5174) and curl'd `/`,
  `/britti_registration`, `/offline/dhaka`, `/refund`, `/admit`, `/login`, `/admin`, `/admin/migrate` —
  all 200, no SSR/build errors under the new schema. The actual data-flow E2E test (submit an online
  registration, submit an offline registration, submit a refund request, confirm roll-number assignment,
  upload results, generate an admit card, run search) needs a human in a real browser — checklist below.
- Step 7 confirmed done (user, 2026-08-18): ran the manual checklist — online registration, offline
  registration, refund submission, roll assignment/institutions, results upload, admit cards (migrated
  2025 + fresh year), and the year switcher across `/admin/list`, `/admin/online`, `/admin/refund` — all
  worked correctly, no cross-year data bleed.

All of Steps 1-7, 9, and 10 are now done. Only Step 8 (delete old `-2025` top-level collections and
`_cache` doc) remains, and it's explicitly optional/manual — only do it once the user separately signs
off, since it's a destructive, irreversible cleanup of the pre-migration backup data.
- Step 9's button has been run in production (user confirmed 2026-08-18): `scholarships/2025` doc now
  exists, so 2025 is reachable in the YearSwitcher and its migrated subcollection data is visible.
- All of Steps 1-6, 9, and 10 are now done. Remaining: Step 7 (manual E2E test, human-in-the-loop) and
  Step 8 (cleanup of old `-2025` collections, only after sign-off — explicitly deferred/optional).

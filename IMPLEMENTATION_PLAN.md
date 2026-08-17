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
- Waiting on approval to start Step 4 (update admin read/write modules to the new schema).

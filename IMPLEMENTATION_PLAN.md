# Dynamic, per-year branch (শাখা/থানা) list

## Context

The previous plan (online form validation + institution combo box) is done and committed.

The list of branches (offline data-entry points: thanas, colleges, libraries, `99 = অনলাইন`, …) is
a hardcoded object in `src/routes/+layout.js` (`thana`), returned as `data.thana` to **every** page.
It changes from year to year, so it has to move into Firestore, editable from the admin panel, and
scoped per scholarship year.

### Where the static list is used today (full scout)

| File | Usage |
| --- | --- |
| `src/routes/+layout.js` | Defines the static `thana` map `{ code: name }` — the only source. |
| `src/routes/offline/+page.svelte` | Grid of all branches → links to `/offline/{code}`. |
| `src/routes/offline/[branch]/+page.svelte` | Breadcrumb + heading `data.thana[branch]`. Already loads the active scholarship (for `offlineCol`). Serial regex `^{branch}\d{3}$` uses the code. |
| `src/routes/offline/[branch]/successful/+page.svelte` | Breadcrumb label `data.thana[branch]`. |
| `src/routes/(admin)/admin/list/+page.svelte` | Iterates `data.thana` to run a count query per branch for `$selectedYear`. |
| `src/routes/(admin)/admin/list/[branch]/+page.svelte` | Breadcrumb + heading `data.thana[branch]` (year = `$selectedYear`). |
| `src/routes/(admin)/admin/list/[branch]/admit/+page.svelte` | Breadcrumb + passes `branchName={data.thana[branch]}` to `BatchAdmitCards` (printed on admit cards). Year = `?year=` or current. |

Related (not using `data.thana`, but tied to branch codes):

- `src/routes/(admin)/admin/online/+page.svelte:226` — online→offline transfer hardcodes `branch: '99'`
  (the অনলাইন branch). Code `99` must therefore always exist → treat as reserved.
- `src/routes/(admin)/admin/list/edit/[id]/+page.svelte` — "থানা" is a free-text input for the branch
  code; should become a dropdown of that year's branches.
- `src/routes/(admin)/admin/search/search-db.js` — counts `byBranch` by code only; not displayed. No change.
- `BatchAdmitCards.svelte` also has a hardcoded exam `center` map — **out of scope** (not branches),
  noted for a possible follow-up.

## Design

**Storage:** a `branches` array on the year's scholarship doc, `scholarships/{year}`:

```js
branches: [{ code: '1', name: 'কোতোয়ালী পূর্ব' }, …, { code: '99', name: 'অনলাইন' }]
```

- Array (not map) so admin-defined order is preserved. `code` stored as a string, matching the
  `branch` field already saved on offline registrations.
- Lives next to the other per-year data (`offices`, `syllabus`, …). The doc is already public-read /
  auth-write in `firestore.rules`, and already fetched by public pages → **no rules change**, no extra
  collection.
- Creating a new year on `/admin/scholarship` with "clone from active" copies `branches` automatically
  (it spreads the active doc). For a non-cloned new year, seed with the default list.

**Fallback:** `DEFAULT_BRANCHES` = today's static list, moved into `src/lib/branches.js`. If a year's
doc has no `branches` field (2025 and any existing years), `getBranches(year)` returns the defaults, so
nothing breaks before an admin saves a list.

**Year resolution (per the request):**

- `/offline/**` → active scholarship (`getActiveScholarship()`), same as the online registration and
  scholarship-details pages.
- `/admin/list` and `/admin/list/[branch]` → `$selectedYear` (YearSwitcher); list reloads when the year
  changes.
- `/admin/list/[branch]/admit` and `/admin/list/edit/[id]` → `?year=` param or current year (their
  existing behavior).

## Steps

1. **`src/lib/branches.js`** — `DEFAULT_BRANCHES`, `ONLINE_BRANCH_CODE = '99'`,
   `getBranches(year)` (doc field or defaults), `saveBranches(year, branches)`,
   `branchName(branches, code)` (falls back to the code if unlisted).
2. **Admin page `/admin/branches`** — edits the branch list of `$selectedYear`: rows of code + name,
   add / remove / move up-down, "reset to default". Validation on save: code = English digits,
   unique; name non-empty; code `99` can be renamed but not removed. Before removing a code that has
   registrations in that year, confirm with the count. Add a card on the admin dashboard.
3. **New-year seeding** — `/admin/scholarship`: if the base for a new year has no `branches`, set
   `DEFAULT_BRANCHES`.
4. **`/offline` pages** — load branches for the active scholarship; grid, heading and breadcrumbs use
   them. `/offline/[code]` for a code not in the current list shows an "invalid branch" message
   instead of the form (prevents registrations into a branch that doesn't exist this year).
5. **Admin list pages** — `/admin/list` counts per branch of the selected year, plus a line for
   registrations whose code isn't in that year's list (`total − Σ counts`) so nothing is silently hidden.
   `[branch]` and `admit` pages resolve the name from that year's list.
6. **Edit page** — "থানা" becomes a `<select>` of that year's branches (keeps an unlisted current value
   as an extra option).
7. **Online transfer** — use `ONLINE_BRANCH_CODE` instead of the `'99'` literal.
8. **Remove `src/routes/+layout.js`** (its only job was the static list) and all `export let data`
   uses of `data.thana`.
9. **Verify** — `npm run build` / `npm run check`; grep confirms no `thana` references remain.

---
Status: Steps 1–8 implemented. Step 9: `npm run build` passes with no new warnings, and no `thana`
references remain. Still to do: a manual run against Firestore (edit/save a year's list on
`/admin/branches`, switch years on `/admin/list`, open `/offline` and an invalid `/offline/{code}`).

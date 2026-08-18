# Online registration form: validation + institution combo box

## Context

The previous plan (Firestore year-scoping) is complete and cleaned up (Steps 1-10 all done,
committed). This plan covers two follow-up gaps on the **online registration form**
(`src/routes/britti_registration/+page.svelte`), found by comparing it against the **offline
registration form** (`src/routes/offline/[branch]/+page.svelte`), which already has both features
this form is missing:

1. **No data validation.** The online form relies entirely on HTML `required` attributes — no format
   checks. The offline form has a `validateForm()` function with regex checks (`mobileRegex`,
   `serialRegex`) and a `formErrors` object rendered under each field. The online form has a
   `formErrors` variable declared (`+page.svelte:46`) but it's never populated or used in the markup —
   dead code from a removed/unfinished validation pass.
2. **No institution combo box.** The online form's institution field (`+page.svelte:209-211`) is a
   plain free-text `<input>`. The offline form's institution field (`[branch]/+page.svelte:226-251`) is
   an autocomplete combo box sourced from `static/institutions.json` (filter-as-you-type dropdown,
   `handleInstitutionInput`/`selectInstitution`/`handleInstitutionBlur`). Free-text institution names on
   the online form are exactly what causes the duplicate/typo variants that `/admin/institutions`
   exists to manually clean up after the fact — the combo box is what stops it at the source, same as
   it already does for offline registrations.

## Target

Bring `britti_registration/+page.svelte` to parity with the offline form for these two concerns,
reusing the same patterns (not reinventing them) so behavior stays consistent across both forms:

- Institution field becomes an autocomplete combo box against `static/institutions.json`, same
  filter/select/blur behavior as the offline form.
- Add a `validateForm()` pass before submit, with `formErrors` actually wired into the markup. Fields to
  validate (online form has no `serial`, but has fields the offline form doesn't — `nameEnglish`,
  `birthDate`, `transactionID`, full address block):
  - `mobile` / `guardianMobile`: exactly 11 digits (same `mobileRegex` as offline).
  - `transactionID`: required, non-empty after trim (bKash trx IDs are alphanumeric, no fixed length to
    enforce beyond presence — confirm exact rule with the user if a stricter format is wanted).
  - `birthDate`: required, must be a real past date (not empty, not in the future).
  - Existing `required` text fields (`name`, `nameEnglish`, `fatherName`, `motherName`, `institution`,
    `section`, `classRoll`, `religion`, address fields, `guardianName`, `relation`): non-empty after
    `.trim()`, mirroring the offline form's `cleanedFormData` trim-before-submit step (online form
    currently doesn't trim at all).
  - Radio groups (`institutionType`, `gender`): already `required` at the HTML level like offline, but
    add explicit checks + `formErrors` messages for consistency with the offline form's radio validation.

## Steps (approve one at a time)

1. **Institution combo box.** Port the offline form's institution autocomplete (state vars
   `institutions`, `filteredInstitutions`, `showDropdown`, `handleInstitutionInput`,
   `selectInstitution`, `handleInstitutionBlur`, the `fetch('/institutions.json')` in `onMount`) into
   `britti_registration/+page.svelte`, replacing the current plain `<input>` at line 209-211 with the
   offline form's dropdown markup.
2. **Validation function.** Add `validateForm()` mirroring the offline form's structure (regex + trim
   checks per field above), wire `formErrors` into the markup under each field (offline form's pattern:
   `{#if formErrors.fieldName}<p class="text-red-500 text-sm mt-1">...</p>{/if}`), and call it from
   `handleSubmit()` before the Firestore write — abort submit if invalid, same as offline form.
3. **Trim on submit.** Match the offline form's `cleanedFormData` step — trim all string fields
   (including nested `permanentAddress`) before writing to Firestore.
4. **Manual test.** Submit the online form with a mix of valid/invalid data (bad mobile format, empty
   required field, future birth date, picking an institution from the dropdown vs. typing a new one) and
   confirm errors show correctly and the Firestore doc looks right in `/admin/online`.

---
Status: not started.

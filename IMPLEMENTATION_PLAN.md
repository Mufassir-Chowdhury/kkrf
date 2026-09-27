# AI scan-to-fill for the offline registration form

## Context

The previous plan (dynamic per-year branch list) is done and committed.

Data entry on `/offline/[branch]` is slow: an operator types every field from a paper
registration form. Handwriting and scans are often bad, so instead of OCR we send a photo of
the form to a Gemini Flash / Flash-Lite model and let it return the fields as structured JSON.
The operator then verifies, fixes, types the institution name, and submits as today.

### The paper form (`static/example.jpg`)

- JPEG, **11425 × 11200 px, 300 DPI, 6.3 MB** (a flatbed scan). A phone photo will be ~12 MP / 3–5 MB.
  Either way far larger than needed — the model reads it just as well at 1600 px.
- Printed Bangla form, handwritten Bangla answers (Bangla digits in numbers).

| Paper field | Website field (`formData`) | Notes |
| --- | --- | --- |
| টিক: স্কুল / মাদরাসা | `institutionType` | `school` / `madrasa` |
| ছাত্র / ছাত্রী (tick) | `gender` | `male` / `female` |
| পরীক্ষার্থীর নাম (বাংলায়) | `name` | Bangla, as written |
| ইংরেজিতে | — | not on the website, ignored |
| পিতার নাম | `fatherName` | Bangla |
| মাতার নাম | — | ignored |
| শিক্ষা প্রতিষ্ঠান | `institution` | **never auto-filled** — operator types it (paper names are often wrong) |
| শ্রেণি (tick row + field) | `class` | one of `৪র্থ … ১০ম` |
| শাখা | — | ignored |
| ক্লাস রোল | `classRoll` | Bangla digits → English |
| জন্ম তারিখ, ধর্ম, অভিভাবক, সম্পর্ক | — | ignored |
| মোবাইল নাম্বার (অনলাইন), else মোবাইল | `mobile` | → English digits; must match `01\d{9}` else empty |
| বর্তমান ঠিকানা | `presentAddress` | Bangla |
| Office box: সিরিয়াল নাম্বার | `serial` | → English digits; usually blank on paper |
| Office box: ওয়ার্ড | `ward` | usually blank on paper |

## Flow

1. Operator taps **"ফরম স্ক্যান করুন"** on `/offline/[branch]` → `<input type="file" accept="image/*" capture="environment">`
   opens the phone camera (or file picker on desktop).
2. Browser compresses the photo (canvas): longest side **1600 px, grayscale, JPEG q=0.7** → ~150–300 KB
   instead of 3–6 MB. Faster upload on mobile data; token cost is set separately (below).
3. The browser calls Gemini directly. The key is **public on purpose**: `PUBLIC_GEMINI_API_KEY` is
   inlined into the client bundle at build time (only trusted operators use `/offline`).
4. Gemini returns JSON constrained by `responseSchema`; the client normalises it (Bangla→English digits,
   `"none"` enum sentinel → empty, mobile/class validation).
5. Form is filled with every returned field **except `institution`**. Illegible/absent fields come back
   empty and stay empty. A banner tells the operator to verify and lists the empty fields.
6. Operator checks, edits, types the institution, submits (existing validation + submit unchanged).

## Model & token cost (measured on `example.jpg`)

Gemini 3.x bills an image by `mediaResolution`, **not** by pixel size — the image cost was identical at
768 / 1024 / 1600 px. So "compression" has two parts: pixel/JPEG compression (upload size, latency) and
`mediaResolution` (tokens).

| Model | mediaResolution | Input tokens (img + prompt) | Output | Total | Latency | Quality |
| --- | --- | --- | --- | --- | --- | --- |
| gemini-3.5-flash-lite | LOW | 256 + 207 | 117 | **~580** | 6 s | poor (address, mobile wrong) |
| gemini-3.5-flash-lite | MEDIUM | 529 + 207 | 116 | **~850** | 4 s | father's name wrong |
| gemini-3.5-flash-lite | HIGH | 1089 + 207 | 117 | **~1,410** | 3 s | ✅ all correct (roll 01/09 ambiguous) |
| gemini-3.5-flash (thinking=minimal) | MEDIUM | 529 + 207 | 117 | ~850 | 8–25 s | ✅ good, often 503 "high demand" |
| gemini-flash-latest (default thinking) | HIGH | 1089 + 207 | 118 + 670 thinking | ~2,100 | 11 s | ✅ good |

**Choice:** `gemini-3.5-flash-lite` + `MEDIA_RESOLUTION_HIGH`, `temperature: 0`, pinned model id (not
`-latest`). On 429/503, retry once with `gemini-3.5-flash` (thinking minimal, HIGH).
`gemini-2.5-flash-lite` is no longer available to new keys (404).

### Free-key budget

~**1,400 tokens per form** (~1,300 in, ~120 out).

- Tokens are not the bottleneck: at a 250k TPM free limit that is ~175 forms/min.
- The binding limits are **requests per minute / per day**, which Google sets per project and now only
  shows in AI Studio → <https://aistudio.google.com/rate-limit>. Check it there for `gemini-3.5-flash-lite`.
  1 form = 1 request, so **forms/day = RPD** (+ another RPD pool from the fallback model).
  E.g. at 1,000 RPD → 1,000 forms/day ≈ 1.4 M tokens; at 20 RPD → only 20 forms/day.
- If RPD is too low, enabling billing on the project: Flash-Lite pricing makes ~1,400 tokens a fraction
  of a US cent per form.

⚠️ **Privacy:** on the free tier Google may use prompts (these photos of minors' forms, with faces and
phone numbers) to improve its products. Paid tier does not. Worth deciding before real use.

## Changes

1. **`src/lib/gemini.js`** (new, browser) — `extractForm(base64)`: prompt, `responseSchema`,
   model + fallback, normalisation. Key from `$env/static/public` `PUBLIC_GEMINI_API_KEY`: set it in
   Cloudflare Pages → Settings → Environment variables (needed at **build** time), and in `.env` locally.
2. *(removed)* — the former `/api/scan-form` server route.
3. **`src/lib/compressImage.js`** (new) — canvas resize → grayscale JPEG base64.
4. **`src/lib/components/ScanFormButton.svelte`** (new) — camera/file input, spinner, error, dispatches
   `result`.
5. **`src/routes/offline/[branch]/+page.svelte`** — add the button above the form; merge result into
   `formData` (skip `institution`; keep an already-typed `serial` if the scan returned none); verify banner.

## Usage & rate-limit dashboard (`/admin/ai-usage`)

Google exposes no usage/quota API or rate-limit headers for Gemini API keys (limits are only shown in
AI Studio), so the site tracks its own usage:

- **`recordUsage` in `src/lib/aiUsage.js`** — after every Gemini call the browser increments
  `aiUsage/{YYYY-MM-DD}` (quota day = Pacific time, when Google resets RPD) via the Firebase SDK:
  per model `requests`, `errors`, `rateLimited`, `promptTokens`, `outputTokens`, `totalTokens`, and a
  per-minute request count (`minutes.HHMM`) for peak RPM. On a 429 it saves the message and the quota
  Google reports (`quotaId` → `quotaValue`) as `detectedLimits`.
- **`settings/ai.limits`** — RPM / TPM / RPD per model, typed in by an admin from AI Studio.
- **`src/lib/aiQuota.js`** (pure: model list, Pacific-day clock) + **`src/lib/aiUsage.js`** (Firestore loaders).
- **Admin page:** today's scans/tokens, scans left today (RPD − used), per-model bars for RPD, peak RPM,
  estimated peak TPM, avg tokens/form, max scans/min, limits Google reported, last rate-limit event,
  limit editor, last 7 days table. Linked from the admin dashboard.
- **`firestore.rules`** — `aiUsage/{day}`: read = signed-in, write = public (same model as the other
  public-write collections). **Must be deployed**, otherwise logging fails silently (scans still work).

Only scans made through this site are counted; other use of the same key isn't visible.

## Follow-ups (not in this change)

- `aiUsage` is write-open, so the counters can be tampered with; fine for planning, not for billing.

- The key is visible to anyone who opens the site's JS; anyone could burn the quota with it. If that
  happens, rotate the key and restrict it in Google Cloud (HTTP referrer = the site's domain, API =
  Generative Language only), or move the call back behind a server route.
- Optional: store which fields the AI filled vs. the operator changed, to measure accuracy.

// Runs in the browser. The key is deliberately public: it is inlined at build time from
// PUBLIC_GEMINI_API_KEY (a Cloudflare Pages environment variable, or .env locally).
import { PUBLIC_GEMINI_API_KEY as API_KEY } from '$env/static/public';
import { AI_MODELS } from './aiQuota';
import { recordUsage } from './aiUsage';

// Per-model generationConfig overrides; models are tried in AI_MODELS order.
const MODEL_CONFIG = {
	'gemini-3.5-flash': { thinkingConfig: { thinkingLevel: 'minimal' } }
};

const CLASSES = ['৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম'];

// Institution is intentionally absent: the operator types it manually.
const FIELDS = ['serial', 'institutionType', 'gender', 'name', 'fatherName', 'class', 'classRoll', 'mobile', 'presentAddress', 'ward'];

const str = { type: 'STRING' };
// Empty strings aren't allowed in enums, so "none" stands in for blank/illegible.
const SCHEMA = {
	type: 'OBJECT',
	properties: {
		serial: str,
		institutionType: { type: 'STRING', enum: ['school', 'madrasa', 'none'] },
		gender: { type: 'STRING', enum: ['male', 'female', 'none'] },
		name: str,
		fatherName: str,
		class: { type: 'STRING', enum: [...CLASSES, 'none'] },
		classRoll: str,
		mobile: str,
		presentAddress: str,
		ward: str
	},
	required: FIELDS,
	propertyOrdering: FIELDS
};

const PROMPT = `Scanned Bangla scholarship registration form (handwritten). Extract fields into JSON.
Rules:
- Use "" for any field that is blank, absent, or illegible. Never guess.
- name, fatherName, presentAddress: Bangla script exactly as written.
- serial, classRoll, mobile: convert Bangla digits to English digits (০-৯ → 0-9), digits only, no spaces.
- mobile: prefer "মোবাইল নাম্বার (অনলাইন)"; if empty use the other "মোবাইল". Must be 11 digits starting 01, else "".
- institutionType: ticked স্কুল → "school", মাদরাসা → "madrasa".
- gender: ticked ছাত্র → "male", ছাত্রী → "female".
- class: from the ticked class or শ্রেণি field.
- Enum fields: use "none" if not ticked/illegible.
- serial, ward: from the office section (অফিস কর্তৃক পূরণীয়).`;

const toEnglishDigits = (s) => s.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));

function normalize(raw) {
	const out = {};
	for (const f of FIELDS) {
		const v = typeof raw[f] === 'string' ? raw[f].trim() : '';
		out[f] = v === 'none' ? '' : v;
	}
	for (const f of ['serial', 'classRoll', 'mobile']) out[f] = toEnglishDigits(out[f]).replace(/\s/g, '');
	if (!/^01\d{9}$/.test(out.mobile)) out.mobile = '';
	if (!CLASSES.includes(out.class)) out.class = '';
	// The form's radio groups use null for "not selected".
	out.institutionType ||= null;
	out.gender ||= null;
	return out;
}

async function callModel(id, base64) {
	const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${id}:generateContent`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
		body: JSON.stringify({
			contents: [{ parts: [{ inline_data: { mime_type: 'image/jpeg', data: base64 } }, { text: PROMPT }] }],
			generationConfig: {
				temperature: 0,
				responseMimeType: 'application/json',
				responseSchema: SCHEMA,
				mediaResolution: 'MEDIA_RESOLUTION_HIGH',
				...MODEL_CONFIG[id]
			}
		})
	});
	const body = await res.json().catch(() => ({}));
	if (!res.ok) {
		const err = new Error(body?.error?.message ?? `Gemini ${res.status}`);
		err.status = res.status;
		err.details = body?.error?.details;
		throw err;
	}
	// Tokens are spent even if the answer turns out to be unusable, so log before parsing.
	recordUsage(id, { usage: body.usageMetadata ?? {} });
	const text = body.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
	if (!text) throw new Error('Empty response from model');
	return { data: normalize(JSON.parse(text)), model: id, usage: body.usageMetadata };
}

/** @param {string} base64 JPEG image */
export async function extractForm(base64) {
	if (!API_KEY) throw new Error('PUBLIC_GEMINI_API_KEY is not set');
	let lastErr;
	for (const id of AI_MODELS) {
		try {
			return await callModel(id, base64);
		} catch (e) {
			if (e.status) recordUsage(id, { error: e });
			lastErr = e;
			if (e.status !== 429 && e.status !== 503) throw e;
		}
	}
	throw lastErr;
}

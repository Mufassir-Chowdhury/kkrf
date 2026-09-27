// aiUsage.js
// Gemini scan-to-fill usage tracking. The browser (src/lib/gemini.js) writes one doc per
// quota day: aiUsage/{YYYY-MM-DD}. Admin limits (copied from AI Studio) live in settings/ai.
//
// aiUsage/{day} = {
//   models: { [modelId]: { requests, errors, rateLimited, promptTokens, outputTokens, totalTokens,
//                          minutes: { [HHMM]: requests } } },
//   detectedLimits: { [modelId]: { [quotaId]: number } },   // reported by Google on a 429
//   lastRateLimit: { at, model, message }
// }
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { quotaClock } from './aiQuota';

export { AI_MODELS, quotaClock, nextQuotaReset, recentQuotaDays } from './aiQuota';

/**
 * Logs one Gemini call. Never throws: logging must not break a scan.
 * @param {string} model
 * @param {{ usage?: any, error?: { status?: number, message?: string, details?: any[] } }} event
 */
export async function recordUsage(model, { usage, error }) {
	const { day, minute } = quotaClock();
	const update = {};

	if (usage) {
		update.models = {
			[model]: {
				requests: increment(1),
				minutes: { [minute]: increment(1) },
				promptTokens: increment(usage.promptTokenCount ?? 0),
				outputTokens: increment((usage.candidatesTokenCount ?? 0) + (usage.thoughtsTokenCount ?? 0)),
				totalTokens: increment(usage.totalTokenCount ?? 0)
			}
		};
	} else {
		const rateLimited = error?.status === 429;
		update.models = { [model]: { errors: increment(1), ...(rateLimited && { rateLimited: increment(1) }) } };
		if (rateLimited) {
			update.lastRateLimit = { at: new Date(), model, message: (error.message ?? '').slice(0, 500) };

			// Google includes the quota that was hit, e.g.
			// { quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier', quotaValue: '20' }
			const violations = (error.details ?? []).flatMap((d) => d.violations ?? []);
			const detected = {};
			for (const v of violations) {
				if (v.quotaId && v.quotaValue) detected[v.quotaId] = Number(v.quotaValue);
			}
			if (Object.keys(detected).length) update.detectedLimits = { [model]: detected };
		}
	}

	try {
		await setDoc(doc(db, 'aiUsage', day), update, { merge: true });
	} catch (e) {
		console.error('aiUsage write failed:', e);
	}
}

export async function loadUsageDays(days) {
	const snaps = await Promise.all(days.map((d) => getDoc(doc(db, 'aiUsage', d))));
	return snaps.map((s, i) => ({ day: days[i], ...(s.exists() ? s.data() : {}) }));
}

/** settings/ai -> { limits: { [modelId]: { rpm, tpm, rpd } } } */
export async function loadAiLimits() {
	const snap = await getDoc(doc(db, 'settings', 'ai'));
	return snap.exists() ? snap.data().limits ?? {} : {};
}

export async function saveAiLimits(limits) {
	await setDoc(doc(db, 'settings', 'ai'), { limits }, { merge: true });
}

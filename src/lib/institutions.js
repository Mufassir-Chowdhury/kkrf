// institutions.js
// Single-document Firestore cache of known institution names (Bangla), shared
// by the online (britti_registration) and offline ([branch]) registration
// forms. Deliberately lean — just names, no per-institution counts or
// registration-id lists (that richer aggregate already exists separately as
// the admin `cache/institution_groups` doc) — so a read is one cheap doc get.
import { doc, getDoc, getDocs, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { offlineCol } from './yearScope';

function institutionListDocRef(year) {
	return doc(db, 'scholarships', String(year), 'cache', 'institution_list');
}

export function normalizeInstitutionName(name) {
	return (name || '').trim().replace(/\s+/g, ' ');
}

// Loads the cached institution list. If the cache doc doesn't exist yet,
// seeds it from the existing static list (itself built from 2025 scholarship
// registrations) so every load after the first hits Firestore only.
export async function loadInstitutions(year) {
	try {
		const snap = await getDoc(institutionListDocRef(year));
		if (snap.exists()) {
			const names = snap.data().names;
			if (Array.isArray(names) && names.length > 0) return names;
		}
	} catch (error) {
		console.error('Error loading institution cache:', error);
		return [];
	}

	try {
		const response = await fetch('/institutions.json');
		const jsonData = await response.json();
		const seeded = Array.from(
			new Set((jsonData.institutions || []).map(normalizeInstitutionName).filter(Boolean))
		);
		await setDoc(institutionListDocRef(year), {
			names: seeded,
			updatedAt: new Date().toISOString()
		});
		return seeded;
	} catch (error) {
		console.error('Error seeding institution cache:', error);
		return [];
	}
}

// Adds a name to the cache if it isn't already present (case-insensitive,
// whitespace-normalized). Call after a successful submission.
export async function addInstitutionIfMissing(year, name, knownInstitutions) {
	const normalized = normalizeInstitutionName(name);
	if (!normalized) return;

	const alreadyKnown = knownInstitutions.some(
		(inst) => normalizeInstitutionName(inst).toLowerCase() === normalized.toLowerCase()
	);
	if (alreadyKnown) return;

	try {
		await setDoc(
			institutionListDocRef(year),
			{ names: arrayUnion(normalized), updatedAt: new Date().toISOString() },
			{ merge: true }
		);
	} catch (error) {
		console.error('Error updating institution cache:', error);
	}
}

async function safeGetDocs(colRef, label) {
	try {
		return (await getDocs(colRef)).docs;
	} catch (error) {
		console.error(`Error reading ${label} for institution list rebuild:`, error);
		return [];
	}
}

// Rebuilds the cache doc from real offline registration data instead of the
// static seed list.
export async function rebuildInstitutionListFromRegistrations(year) {
	const offlineDocs = await safeGetDocs(offlineCol(year), 'offline registrations');

	const seen = new Map(); // lowercase key -> display name
	for (const d of offlineDocs) {
		const normalized = normalizeInstitutionName(d.data().institution);
		if (!normalized) continue;
		const key = normalized.toLowerCase();
		if (!seen.has(key)) seen.set(key, normalized);
	}

	const names = Array.from(seen.values()).sort((a, b) => a.localeCompare(b, 'bn'));

	await setDoc(institutionListDocRef(year), {
		names,
		updatedAt: new Date().toISOString()
	});

	return { names, offlineReadCount: offlineDocs.length };
}

function levenshteinDistance(a, b) {
	const al = a.length;
	const bl = b.length;
	if (al === 0) return bl;
	if (bl === 0) return al;

	const dp = new Array(bl + 1);
	for (let j = 0; j <= bl; j++) dp[j] = j;

	for (let i = 1; i <= al; i++) {
		let prev = dp[0];
		dp[0] = i;
		for (let j = 1; j <= bl; j++) {
			const temp = dp[j];
			dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
			prev = temp;
		}
	}
	return dp[bl];
}

// Fuzzy-searches institutions for a query, substring matches ranked as a
// "strong match" tier above edit-distance matches so exact/partial hits
// always sort to the top.
export function searchInstitutions(query, institutions, limit = 10) {
	const q = normalizeInstitutionName(query).toLowerCase();
	if (!q) return [];

	const scored = institutions.map((inst) => {
		const normInst = normalizeInstitutionName(inst).toLowerCase();
		const idx = normInst.indexOf(q);
		if (idx !== -1) {
			return { inst, tier: 0, score: idx + Math.abs(normInst.length - q.length) * 0.01 };
		}
		const dist = levenshteinDistance(q, normInst);
		const maxLen = Math.max(q.length, normInst.length) || 1;
		return { inst, tier: 1, score: dist / maxLen };
	});

	return scored
		.filter((s) => s.tier === 0 || s.score <= 0.5)
		.sort((a, b) => a.tier - b.tier || a.score - b.score)
		.slice(0, limit)
		.map((s) => s.inst);
}

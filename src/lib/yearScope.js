// yearScope.js
// Path helpers for year-scoped scholarship data, plus the "currently selected
// admin year" store used by admin pages to cycle between years.
//
// Schema: scholarships/{year}/applications|offline|refunds/{id}
//         scholarships/{year}/cache/{start_roll|online_serial|institution_groups|merge_rules}
import { collection, doc } from 'firebase/firestore';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { db } from './firebase';

function yearId(year) {
	if (!year) throw new Error('yearScope: year is required');
	return String(year);
}

export function scholarshipDocRef(year) {
	return doc(db, 'scholarships', yearId(year));
}

export function applicationsCol(year) {
	return collection(db, 'scholarships', yearId(year), 'applications');
}

export function offlineCol(year) {
	return collection(db, 'scholarships', yearId(year), 'offline');
}

export function refundsCol(year) {
	return collection(db, 'scholarships', yearId(year), 'refunds');
}

export function applicationDocRef(year, id) {
	return doc(db, 'scholarships', yearId(year), 'applications', id);
}

export function offlineDocRef(year, id) {
	return doc(db, 'scholarships', yearId(year), 'offline', id);
}

export function refundDocRef(year, id) {
	return doc(db, 'scholarships', yearId(year), 'refunds', id);
}

// Cache docs: 'start_roll' | 'online_serial' | 'institution_groups' | 'merge_rules'
export function cacheDocRef(year, name) {
	return doc(db, 'scholarships', yearId(year), 'cache', name);
}

// --- Admin "selected year" store ---
// Backed by sessionStorage so the choice survives navigation between admin
// pages within a tab, but doesn't stick around forever. Defaults to null
// until initAdminYear() sets it (normally to the active scholarship's year).
const STORAGE_KEY = 'admin.selectedYear';

function readStoredYear() {
	if (!browser) return null;
	try {
		return sessionStorage.getItem(STORAGE_KEY) || null;
	} catch {
		return null;
	}
}

export const selectedYear = writable(readStoredYear());

if (browser) {
	selectedYear.subscribe((year) => {
		try {
			if (year) sessionStorage.setItem(STORAGE_KEY, String(year));
			else sessionStorage.removeItem(STORAGE_KEY);
		} catch {
			// sessionStorage unavailable (e.g. private browsing) — ignore
		}
	});
}

// Sets the selected year only if nothing is already selected (e.g. on first
// load of an admin page). Pass the active scholarship's year as a fallback.
export function initAdminYear(fallbackYear) {
	selectedYear.update((current) => current || (fallbackYear ? String(fallbackYear) : current));
}

export function setAdminYear(year) {
	selectedYear.set(year ? String(year) : null);
}

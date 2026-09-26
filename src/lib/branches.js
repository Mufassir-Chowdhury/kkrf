// branches.js
// Per-year list of offline registration branches (শাখা), stored as a
// `branches` array on the scholarships/{year} doc so the admin-defined order
// is kept:  branches: [{ code: '1', name: 'কোতোয়ালী পূর্ব' }, ...]
// Codes are strings, matching the `branch` field on offline registrations.
import { updateDoc } from 'firebase/firestore';
import { getScholarship } from './siteData';
import { scholarshipDocRef } from './yearScope';

// Online registrations transferred to the offline collection land in this
// branch (see admin/online), so it must always exist.
export const ONLINE_BRANCH_CODE = '99';

// Fallback for years whose doc has no `branches` field yet (e.g. 2025), and
// seed for new years that aren't cloned from an existing one.
export const DEFAULT_BRANCHES = [
	{ code: '1', name: 'কোতোয়ালী পূর্ব' },
	{ code: '2', name: 'কোতোয়ালী পশ্চিম' },
	{ code: '3', name: 'শাহপরান পূর্ব' },
	{ code: '4', name: 'শাহপরান পশ্চিম' },
	{ code: '5', name: 'দক্ষিণ সুরমা পূর্ব' },
	{ code: '6', name: 'দক্ষিণ সুরমা পশ্চিম' },
	{ code: '7', name: 'বিমানবন্দর' },
	{ code: '8', name: 'বুরহান উদ্দিন' },
	{ code: '9', name: 'জালালাবাদ' },
	{ code: '10', name: 'এমসি কলেজ' },
	{ code: '11', name: 'মেডিকেল কলেজ' },
	{ code: '12', name: 'মদন মোহন কলেজ' },
	{ code: '13', name: 'সরকারি কলেজ' },
	{ code: '14', name: 'আলিয়া মাদরাসা' },
	{ code: '15', name: 'পাঠানটুলা জামেয়া' },
	{ code: '16', name: 'কৃষি বিশ্ববিদ্যালয়' },
	{ code: '17', name: 'প্রাইভেট বিশ্ববিদ্যালয়' },
	{ code: '18', name: 'প্রাইভেট মেডিকেল' },
	{ code: '19', name: 'কলেজ বিভাগ' },
	{ code: '20', name: 'স্কুল বিভাগ' },
	{ code: '21', name: 'মিরাবাজার' },
	{ code: '22', name: 'সিলেট পলিটেকনিক' },
	{ code: '23', name: 'দক্ষিণ সুরমা কলেজ' },
	{ code: '24', name: 'শিশুকল্যান' },
	{ code: '25', name: 'দিশারী' },
	{ code: '26', name: 'ইংলিশ মিডিয়াম' },
	{ code: '27', name: 'কোচিং' },
	{ code: '28', name: 'কওমি পরিষদ' },
	{ code: '31', name: 'পপি লাইব্রেরি' },
	{ code: '32', name: 'স্বাধীনতা লাইব্রেরি' },
	{ code: '33', name: 'ফ্রেন্ডস লাইব্রেরি' },
	{ code: '34', name: 'প্রভিন্সিয়াল লাইব্রেরি' },
	{ code: '35', name: 'মনোরম লাইব্রেরি' },
	{ code: '36', name: 'সৌম্য এন্টারপ্রাইজ' },
	{ code: '41', name: 'নিউক্লিয়াস (মদিনা মার্কেট)' },
	{ code: '42', name: 'নিউক্লিয়াস (লামাবাজার)' },
	{ code: '43', name: 'নিউক্লিয়াস (শিবগঞ্জ)' },
	{ code: ONLINE_BRANCH_CODE, name: 'অনলাইন' }
];

export function cloneDefaultBranches() {
	return DEFAULT_BRANCHES.map((b) => ({ ...b }));
}

// Returns the branch list stored on a scholarship doc object, or the defaults
// if it has none. Use when the doc is already loaded.
export function branchesOf(scholarship) {
	const list = scholarship?.branches;
	return Array.isArray(list) && list.length > 0 ? list : cloneDefaultBranches();
}

export async function getBranches(year) {
	if (!year) return cloneDefaultBranches();
	try {
		return branchesOf(await getScholarship(String(year)));
	} catch (err) {
		console.error('Error loading branches:', err);
		return cloneDefaultBranches();
	}
}

export async function saveBranches(year, branches) {
	await updateDoc(scholarshipDocRef(year), { branches });
}

export function findBranch(branches, code) {
	return (branches || []).find((b) => b.code === String(code)) || null;
}

// Display name for a code; falls back to the code itself when it isn't in
// the list (e.g. old registrations under a branch removed later).
export function branchName(branches, code) {
	return findBranch(branches, code)?.name || String(code ?? '');
}

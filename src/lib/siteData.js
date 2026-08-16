import {
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	setDoc,
	updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

export const DEFAULT_SITE_INFO = {
	address: 'রশিদ ভবন (৩য় তলা), রিকাবী বাজার, সিলেট।',
	phone: '০১৭৫২-৮৩১১৮৪',
	officeTime: 'বিকাল ৫:০০ থেকে রাত ৮:০০ ঘটিকা',
	email: 'info@kkrfsylhet.org',
	facebook: 'https://www.facebook.com/KKSylhet',
	instagram: 'https://www.instagram.com/kksylhet',
	contactPersons: [
		{ name: 'তৌহিদুল ইসলাম', phone: '০১৩০০২০৮১৮৮' },
		{ name: 'রেজাউল করিম', phone: '০১৭৮২৮৪৭৪৩৯' },
		{ name: 'ফাহাদ হুসাইন', phone: '০১৭৭৯০৯৮৬৪৫' },
		{ name: 'আবুল হাসান রিয়াদ', phone: '০১৩০৬৩২১০৫২' }
	]
};

export const EMPTY_SCHOLARSHIP = {
	year: '',
	registrationOpen: false,
	examDate: '',
	examDateNote: '',
	regDeadline: '',
	prizeAmount: '',
	prizeNote: '',
	regFee: '',
	bkashNumber: '',
	specialNote: '',
	examRules: [],
	offices: [],
	syllabus: []
};

/** Reads settings/general -> { activeScholarshipId } */
export async function getGeneralSettings() {
	try {
		const snap = await getDoc(doc(db, 'settings', 'general'));
		return snap.exists() ? snap.data() : { activeScholarshipId: null };
	} catch (err) {
		console.error('Error loading general settings:', err);
		return { activeScholarshipId: null };
	}
}

export async function setActiveScholarshipId(id) {
	await setDoc(doc(db, 'settings', 'general'), { activeScholarshipId: id }, { merge: true });
}

export async function getScholarship(id) {
	if (!id) return null;
	const snap = await getDoc(doc(db, 'scholarships', id));
	return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Fetches the scholarship marked active in settings/general. Returns null if none configured yet. */
export async function getActiveScholarship() {
	try {
		const general = await getGeneralSettings();
		if (!general.activeScholarshipId) return null;
		return await getScholarship(general.activeScholarshipId);
	} catch (err) {
		console.error('Error loading active scholarship:', err);
		return null;
	}
}

export async function getAllScholarships() {
	try {
		const q = query(collection(db, 'scholarships'), orderBy('year', 'desc'));
		const snaps = await getDocs(q);
		return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
	} catch (err) {
		console.error('Error loading scholarships:', err);
		return [];
	}
}

export async function saveScholarship(id, data) {
	await setDoc(doc(db, 'scholarships', id), data, { merge: true });
}

export async function setRegistrationOpen(id, isOpen) {
	await updateDoc(doc(db, 'scholarships', id), { registrationOpen: isOpen });
}

export async function getSiteInfo() {
	try {
		const snap = await getDoc(doc(db, 'settings', 'siteInfo'));
		return snap.exists() ? { ...DEFAULT_SITE_INFO, ...snap.data() } : DEFAULT_SITE_INFO;
	} catch (err) {
		console.error('Error loading site info:', err);
		return DEFAULT_SITE_INFO;
	}
}

export async function saveSiteInfo(data) {
	await setDoc(doc(db, 'settings', 'siteInfo'), data, { merge: true });
}

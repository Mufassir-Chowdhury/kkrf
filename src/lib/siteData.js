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

// Full 2025 dataset, used to pre-fill the very first scholarship ever created (i.e. when Firestore
// has nothing yet) and to seed the `scholarships/2025` doc itself, which predates this collection.
export const SEED_2025 = {
	year: '2025',
	registrationOpen: false,
	examDate: '০১ নভেম্বর ২০২৫',
	examDateNote: 'শনিবার (সম্ভাব্য)',
	regDeadline: "রেজিস্ট্রেশন ফরম সংগ্রহ ও জমাদানের সময়সীমা ১ আগস্ট থেকে ১৫ অক্টোবর'২৫।",
	prizeAmount: '৬,৫০,০০০/=',
	prizeNote: 'টাকার নগদ অর্থ, সনদপত্র ও আকর্ষণীয় পুরষ্কার',
	regFee: '২০০',
	bkashNumber: '01771144308',
	specialNote: 'সাধারণ জ্ঞানের জন্য (জানুয়ারি - জুলাই\'২৫) কিশোরকণ্ঠ এবং বিশেষ সংকলন "অন্বেষণ" সংগ্রহ করতে হবে।',
	examRules: [
		'৪র্থ, ৫ম, ৬ষ্ঠ, ৭ম, ৮ম, ৯ম ও ১০ম শ্রেণির ছাত্র-ছাত্রী (স্কুল-মাদরাসা) বৃত্তি পরীক্ষায় অংশগ্রহণ করতে পারবে।',
		'সিলেট বিভাগের যে কোন স্কুল-মাদরাসার ছাত্র-ছাত্রী পরীক্ষায় অংশগ্রহণ করতে পারবে।',
		'৬ষ্ঠ থেকে ১০ম শ্রেণির জন্য (MCQ পদ্ধতিতে) বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান বিষয়ে (প্রত্যেক বিষয়ে ৫০ নম্বর করে) সর্বমোট ২০০ নম্বরের পরীক্ষা অনুষ্ঠিত হবে।',
		'৪র্থ ও ৫ম শ্রেণির জন্য (MCQ পদ্ধতিতে) বাংলা, ইংরেজি, গণিত ও সাধারণ বিজ্ঞান বিষয়ে (প্রত্যেক বিষয়ে ৫০ নম্বর করে) সর্বমোট ২০০ নম্বরের পরীক্ষা অনুষ্ঠিত হবে।',
		'প্রয়োজনে পরীক্ষার তারিখ পরিবর্তন হতে পারে।',
		'ট্যালেন্টপুল, সাধারণ ও বিশেষ এই তিনটি গ্রেডে বৃত্তিপ্রাপ্ত ছাত্র-ছাত্রীদের এককালীন শিক্ষা ব্যয় বাবদ নগদ অর্থ, সনদপত্র ও আকর্ষণীয় পুরষ্কার প্রদান করা হবে।',
		'৪র্থ থেকে ১০ম শ্রেণি পর্যন্ত সকল রেজিস্ট্রেশন ফি ২০০/- (দুইশত টাকা)।'
	],
	offices: [
		{ name: 'পপি লাইব্রেরি', address: 'রাজা ম্যানশন, জিন্দাবাজার', phone: '০১৭৫২৮৩১১৮৪' },
		{ name: 'স্বাধীনতা লাইব্রেরি', address: 'শাহজালাল জামেয়ার পাশে, মদিনা মার্কেট', phone: '০১৭৫২৮৩১১৮৪' },
		{ name: 'সৌম্য এন্টারপ্রাইজ', address: 'ব্লু-বার্ড জুনিয়র স্কুলের বিপরীতে, মিরের ময়দান', phone: '০১৩০০২০৮১৮৮' },
		{ name: 'ঢাকা বুক ডিপো এন্ড স্টেশনারী', address: '১নং ঈসমাইল টাওয়ার, ইসলামী ব্যাংকের বিপরীতে, লালদিঘীরপার, সিলেট।', phone: '০১৭৮২৮৪৭৪৩৯' },
		{ name: 'প্রভিন্সিয়াল লাইব্রেরি', address: 'আহমদ ম্যানশন, জিন্দাবাজার', phone: '০১৭৫২৮৩১১৮৪' },
		{ name: 'মনোরম লাইব্রেরি', address: 'ইবনে সিনার পাশে, রিকাবীবাজার', phone: '০১৭৭৯০৯৮৬৪৫' },
		{ name: 'ফ্রেন্ডস লাইব্রেরি', address: 'আম্বরখানা গার্লস এর বিপরীতে, হাউজিং স্টেট', phone: '০১৭৫২৮৩১১৮৪' }
	],
	syllabus: [
		{
			class: 'দশম শ্রেণি (স্কুল/মাদরাসা)',
			subjects: [
				{ name: 'বাংলা', topics: ['গদ্যঃ ১. শিক্ষা ও মনুষ্যত্ব, ২. মানুষ মুহাম্মদ সা., ৩. প্রবাস বন্ধু'] },
				{ name: 'English', topics: ['Unit: 7-8, 11, 13, 16'] },
				{ name: 'গণিত', topics: ['১. বীজগণিতঃ অধ্যায় - ২, ৩, ১১'] }
			]
		}
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

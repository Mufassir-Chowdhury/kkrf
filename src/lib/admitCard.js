// admitCard.js
// Per-year admit card settings, stored as an `admitCard` map on the
// scholarships/{year} doc:
//   admitCard: {
//     centers:  [{ number: '1', name: '...' }, ...],  // number = 1st digit of roll
//     date:     '১ নভেম্বর, ২০২৫',
//     day:      'শনিবার',
//     sessions: [{ time: '১০:০০-১১:০০', subjects: 'বাংলা ও ইংরেজি' }, ...],
//     rules:    ['...', ...]
//   }
// Years without the field (e.g. 2025) fall back to DEFAULT_ADMIT_CARD.

export const DEFAULT_ADMIT_CARD = {
	centers: [
		{ number: '1', name: 'শাহজালাল জামেয়া ইসলামিয়া স্কুল এন্ড কলেজ, মিরাবাজার' },
		{ number: '2', name: 'শাহজালাল জামেয়া ইসলামিয়া কামিল মাদরাসা, পাঠানটুলা' },
		{ number: '3', name: 'আল আমিন জামেয়া উচ্চ বিদ্যালয়, মেজরটিলা' }
	],
	date: '১ নভেম্বর, ২০২৫',
	day: 'শনিবার',
	sessions: [
		{ time: '১০:০০-১১:০০', subjects: 'বাংলা ও ইংরেজি' },
		{ time: '১১:১০-১২:১০', subjects: 'গণিত ও সাধারণ জ্ঞান/সাধারণ বিজ্ঞান' }
	],
	rules: [
		'প্রবেশপত্র ব্যতিত কোন পরীক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে না।',
		'প্রত্যেক পরীক্ষার্থী প্রয়োজনীয় ক্যালকুলেটর, কলম ও জ্যামিতি বক্স অবশ্যই সাথে আনতে হবে। এছাড়া অতিরিক্ত কাগজ সাথে রাখা যাবে না।',
		'পরীক্ষার হলে মোবাইল ফোন ও ইলেকট্রনিক ডিভাইস আনা সম্পূর্ণ নিষিদ্ধ।',
		'পরীক্ষা শুরুর ১৫ মিনিট পূর্বে আসন গ্রহণ করতে হবে।',
		'উত্তরপত্রে রোল নম্বর ও অন্যান্য তথ্য সঠিকভাবে পূরণ করতে হবে।'
	]
};

export function cloneDefaultAdmitCard() {
	return JSON.parse(JSON.stringify(DEFAULT_ADMIT_CARD));
}

// Returns the admit card settings stored on a scholarship doc object, with
// any missing part filled in from the defaults.
export function admitCardOf(scholarship) {
	const saved = scholarship?.admitCard || {};
	const defaults = cloneDefaultAdmitCard();
	const nonEmpty = (list) => Array.isArray(list) && list.length > 0;
	return {
		centers: nonEmpty(saved.centers) ? saved.centers : defaults.centers,
		date: saved.date ?? defaults.date,
		day: saved.day ?? defaults.day,
		sessions: nonEmpty(saved.sessions) ? saved.sessions : defaults.sessions,
		rules: Array.isArray(saved.rules) ? saved.rules : defaults.rules
	};
}

// Roll numbers are `${center}${classDigit}NNNN`, so the center is the first digit.
export function centerNameForRoll(admitCard, roll) {
	const number = String(roll ?? '')[0];
	return (admitCard?.centers || []).find((c) => String(c.number) === number)?.name || '';
}

export function toBanglaDigits(value) {
	const bn = '০১২৩৪৫৬৭৮৯';
	return String(value ?? '').replace(/\d/g, (d) => bn[d]);
}

// Admit card heading, e.g. '2026' -> 'কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৬'
export function admitCardTitle(year) {
	return `কিশোরকণ্ঠ মেধাবৃত্তি - ${toBanglaDigits(year)}`;
}

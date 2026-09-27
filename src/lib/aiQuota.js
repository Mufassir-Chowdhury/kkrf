// aiQuota.js
// Pure helpers shared by the scanner (usage logging) and the admin usage page.

// Primary first; the scanner falls back down this list on 429/503.
export const AI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];

// Gemini's daily quota resets at midnight Pacific time.
const QUOTA_TZ = 'America/Los_Angeles';

/** { day: 'YYYY-MM-DD', minute: 'HHMM', secondsOfDay } in the quota timezone. */
export function quotaClock(date = new Date()) {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat('en-CA', {
			timeZone: QUOTA_TZ,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hourCycle: 'h23'
		})
			.formatToParts(date)
			.map((p) => [p.type, p.value])
	);
	return {
		day: `${parts.year}-${parts.month}-${parts.day}`,
		minute: `${parts.hour}${parts.minute}`,
		secondsOfDay: +parts.hour * 3600 + +parts.minute * 60 + +parts.second
	};
}

/** When the current quota day ends, as a Date. */
export function nextQuotaReset(now = new Date()) {
	return new Date(now.getTime() + (86400 - quotaClock(now).secondsOfDay) * 1000);
}

/** The last `count` quota days, newest first. */
export function recentQuotaDays(count, now = new Date()) {
	const days = [];
	for (let i = 0; days.length < count; i++) {
		const day = quotaClock(new Date(now.getTime() - i * 86400000)).day;
		if (!days.includes(day)) days.push(day);
	}
	return days;
}

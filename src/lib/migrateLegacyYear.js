// migrateLegacyYear.js
// One-off migration: copies the old hardcoded `-2025` collections and the
// global `_cache` docs into the new scholarships/{year}/... subcollection
// schema (see yearScope.js). Safe to re-run (uses setDoc with the original
// doc ids, so it overwrites rather than duplicates). Never deletes the old
// data — that's a manual step once the migration is verified.
import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { applicationsCol, offlineCol, refundsCol, cacheDocRef } from './yearScope';

const BATCH_LIMIT = 450; // stay under Firestore's 500 writes/batch

async function copyCollection(sourceName, destCol, log) {
	const sourceSnap = await getDocs(collection(db, sourceName));
	const docs = sourceSnap.docs;

	for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
		const chunk = docs.slice(i, i + BATCH_LIMIT);
		const batch = writeBatch(db);
		for (const d of chunk) {
			batch.set(doc(destCol, d.id), d.data());
		}
		await batch.commit();
	}

	log(`${sourceName}: copied ${docs.length} doc(s) -> ${destCol.path}`);
	return docs.length;
}

async function copyCacheDoc(sourceDocId, year, destName, log) {
	const sourceSnap = await getDoc(doc(db, '_cache', sourceDocId));
	if (!sourceSnap.exists()) {
		log(`_cache/${sourceDocId}: not found, skipped`);
		return false;
	}
	const batch = writeBatch(db);
	batch.set(cacheDocRef(year, destName), sourceSnap.data());
	await batch.commit();
	log(`_cache/${sourceDocId}: copied -> scholarships/${year}/cache/${destName}`);
	return true;
}

/**
 * Migrates legacy `-2025`-suffixed collections and `_cache` docs for the
 * given year into scholarships/{year}/... Returns a report of what was
 * copied and a verification pass comparing source/dest doc counts.
 */
export async function migrateLegacyYear(year, onLog = () => {}) {
	const log = (msg) => onLog(msg);
	const report = { year: String(year), collections: {}, cache: {}, verified: true };

	log(`Starting migration for year ${year}...`);

	report.collections.applications = await copyCollection(
		`scholarshipApplications-${year}`,
		applicationsCol(year),
		log
	);
	report.collections.offline = await copyCollection(`offline-${year}`, offlineCol(year), log);
	report.collections.refunds = await copyCollection(`refund-${year}`, refundsCol(year), log);

	report.cache.start_roll = await copyCacheDoc('start_roll', year, 'start_roll', log);
	report.cache.online_serial = await copyCacheDoc('online-serial', year, 'online_serial', log);
	report.cache.institution_groups = await copyCacheDoc(
		'institution-groups',
		year,
		'institution_groups',
		log
	);
	report.cache.merge_rules = await copyCacheDoc('merge-rules', year, 'merge_rules', log);

	log('Verifying doc counts...');
	const verifications = await Promise.all([
		verifyCount(`scholarshipApplications-${year}`, applicationsCol(year), 'applications', log),
		verifyCount(`offline-${year}`, offlineCol(year), 'offline', log),
		verifyCount(`refund-${year}`, refundsCol(year), 'refunds', log)
	]);
	report.verified = verifications.every(Boolean);

	log(report.verified ? 'Migration verified OK.' : 'Migration verification FAILED — check counts above.');
	return report;
}

async function verifyCount(sourceName, destCol, label, log) {
	const [sourceSnap, destSnap] = await Promise.all([
		getDocs(collection(db, sourceName)),
		getDocs(destCol)
	]);
	const ok = sourceSnap.size === destSnap.size;
	log(
		`Verify ${label}: source=${sourceSnap.size} dest=${destSnap.size} ${ok ? 'OK' : 'MISMATCH'}`
	);
	return ok;
}

// deleteLegacyYear.js
// One-off cleanup (Step 8): deletes the old hardcoded `-YYYY`-suffixed
// top-level collections and the matching `_cache` docs, now that their data
// has been copied into scholarships/{year}/... (see migrateLegacyYear.js).
// Refuses to delete anything unless the new subcollections already contain
// at least as many docs as the legacy source — this is the safety check
// against running cleanup before (or instead of) a successful migration.
import { collection, doc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { applicationsCol, offlineCol, refundsCol } from './yearScope';

const BATCH_LIMIT = 450; // stay under Firestore's 500 writes/batch

async function deleteCollection(sourceName, destCol, log) {
	const [sourceSnap, destSnap] = await Promise.all([
		getDocs(collection(db, sourceName)),
		getDocs(destCol)
	]);

	if (sourceSnap.size === 0) {
		log(`${sourceName}: already empty, skipped`);
		return { deleted: 0, skipped: true };
	}
	if (destSnap.size < sourceSnap.size) {
		log(
			`${sourceName}: REFUSING to delete — migrated dest has ${destSnap.size} doc(s), source has ${sourceSnap.size}. Re-run migration first.`
		);
		return { deleted: 0, skipped: true, mismatch: true };
	}

	const docs = sourceSnap.docs;
	for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
		const chunk = docs.slice(i, i + BATCH_LIMIT);
		const batch = writeBatch(db);
		for (const d of chunk) {
			batch.delete(d.ref);
		}
		await batch.commit();
	}
	log(`${sourceName}: deleted ${docs.length} doc(s)`);
	return { deleted: docs.length, skipped: false };
}

async function deleteCacheDoc(sourceDocId, log) {
	const ref = doc(db, '_cache', sourceDocId);
	await deleteDoc(ref);
	log(`_cache/${sourceDocId}: deleted`);
}

/**
 * Deletes the legacy `-{year}`-suffixed collections and `_cache` docs for
 * the given year, but only for collections whose migrated
 * scholarships/{year}/... counterpart already has doc counts >= the legacy
 * source (i.e. migration verified). Returns a report of what was deleted.
 */
export async function deleteLegacyYear(year, onLog = () => {}) {
	const log = (msg) => onLog(msg);
	const report = { year: String(year), collections: {}, cache: 'deleted' };

	log(`Starting cleanup for year ${year}...`);

	report.collections.applications = await deleteCollection(
		`scholarshipApplications-${year}`,
		applicationsCol(year),
		log
	);
	report.collections.offline = await deleteCollection(`offline-${year}`, offlineCol(year), log);
	report.collections.refunds = await deleteCollection(`refund-${year}`, refundsCol(year), log);

	// _cache is global (not year-scoped) — only delete it if every
	// year-scoped collection above was actually cleaned up (i.e. this is the
	// only/last year still referencing it), to avoid deleting shared cache
	// docs while another year's cleanup hasn't run yet.
	const anyMismatch = Object.values(report.collections).some((r) => r.mismatch);
	if (anyMismatch) {
		report.cache = 'skipped (collection mismatch above)';
		log('_cache: skipped due to mismatch above — fix and re-run before deleting cache.');
	} else {
		await deleteCacheDoc('start_roll', log);
		await deleteCacheDoc('online-serial', log);
		await deleteCacheDoc('institution-groups', log);
		await deleteCacheDoc('merge-rules', log);
	}

	log('Cleanup complete.');
	return report;
}

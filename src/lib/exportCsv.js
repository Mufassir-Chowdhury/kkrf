// exportCsv.js
// CSV export of offline registrations, shared by the all-registrations and
// per-branch admin pages.
import { getBranches } from './branches';
import { getScholarship } from './siteData';
import { admitCardOf, centerNameForRoll } from './admitCard';

// Registrations are { id, ...doc.data() }. Adds roll, exam center and thana
// (branch name) up front, and flattens nested maps (e.g. permanentAddress),
// which would otherwise export as "[object Object]".
export async function exportRegistrationsCSV(registrations, year) {
	if (!registrations || registrations.length === 0) {
		console.warn('No registrations to export');
		return;
	}

	const [branches, scholarship] = await Promise.all([getBranches(year), getScholarship(String(year))]);
	const branchNames = new Map(branches.map((b) => [String(b.code), b.name]));
	const admitCard = admitCardOf(scholarship);

	const rows = registrations.map(({ id, ...data }) => {
		const flat = {};
		for (const [key, value] of Object.entries(data)) {
			if (value && typeof value === 'object' && !Array.isArray(value) && !value.toDate) {
				for (const [subKey, subValue] of Object.entries(value)) flat[`${key}.${subKey}`] = subValue;
			} else {
				flat[key] = value;
			}
		}
		return {
			id,
			roll: data.roll ?? '',
			center: data.roll ? String(data.roll)[0] : '',
			centerName: centerNameForRoll(admitCard, data.roll),
			thana: branchNames.get(String(data.branch)) ?? '',
			...flat
		};
	});

	// Collect all unique field names from all registrations
	const allFields = new Set();
	rows.forEach((row) => Object.keys(row).forEach((key) => allFields.add(key)));
	const headers = Array.from(allFields);

	const csvContent = [
		headers.join(','),
		...rows.map((row) =>
			headers
				.map((field) => {
					const value = row[field];
					const fieldValue = value !== undefined && value !== null ? String(value) : '';
					return `"${fieldValue.replace(/"/g, '""')}"`;
				})
				.join(',')
		)
	].join('\n');

	// Add BOM for proper Excel UTF-8 encoding
	const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', 'scholarship_applications.csv');
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
}

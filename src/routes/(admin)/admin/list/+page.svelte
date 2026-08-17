<script>
	import { onMount } from 'svelte';
	import { getDocs, query, where, getCountFromServer, orderBy } from 'firebase/firestore';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { loadAdminYear, offlineCol } from '$lib/yearScope';

	export let data;
	let thanaWithCounts = [];
	let total = 0;
	let year = null;
	onMount(async () => {
		year = await loadAdminYear();
		const countPromises = Object.entries(data.thana).map(async ([key, value]) => {
			const q = query(offlineCol(year), where('branch', '==', key));
			const querySnapshot = await getCountFromServer(q);
			return {
				key,
				value,
				count: querySnapshot.data().count
			};
		});
		const q = query(offlineCol(year));
		const querySnapshot = await getCountFromServer(q);

		total = querySnapshot.data().count;
		thanaWithCounts = await Promise.all(countPromises);
	});
	async function handleExportCSV() {
		const q = query(offlineCol(year), orderBy('creationTime', 'desc'));
		const querySnapshot = await getDocs(q);
		let registrations = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		if (!registrations || registrations.length === 0) {
			console.warn('No registrations to export');
			return;
		}

		// Collect all unique field names from all registrations
		const allFields = new Set();
		registrations.forEach((reg) => {
			Object.keys(reg).forEach((key) => allFields.add(key));
		});

		const headers = Array.from(allFields);

		// Create CSV content
		const csvContent = [
			headers.join(','),
			...registrations.map((reg) =>
				headers
					.map((field) => {
						const value = reg[field];
						// Handle missing fields as empty strings
						const fieldValue = value !== undefined && value !== null ? String(value) : '';
						// Escape quotes and wrap in quotes
						return `"${fieldValue.replace(/"/g, '""')}"`;
					})
					.join(',')
			)
		].join('\n');

		// Add BOM for proper Excel UTF-8 encoding
		const BOM = '\uFEFF';
		const csvContentWithBOM = BOM + csvContent;

		// Create and download the file
		const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		if (link.download !== undefined) {
			const url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', 'scholarship_applications.csv');
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url); // Clean up the URL object
		}
	}
</script>

<BreadCrumb
	links={[
		{ url: '/admin', label: 'Home' },
		{ url: `#`, label: 'Offline Registrations' }
	]}
/>
<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="section-title">Offline Registrations <span class="text-gray-400 font-normal">({total})</span></h1>
		<div class="space-x-2">
			<a href="/offline">
				<button
					class="border border-primary-300 text-primary-800 px-4 py-2 rounded-md hover:bg-primary-50 transition-colors font-medium"
				>
					Data Entry Page
				</button>
			</a>
			<button
				on:click={() => handleExportCSV()}
				class="bg-primary-800 text-white px-4 py-2 rounded-md hover:bg-primary-900 transition-colors font-medium shadow-card"
			>
				Export CSV
			</button>
		</div>
	</div>
	<div class="grid">
		{#each thanaWithCounts as { key, value, count }}
			<a href={`/admin/list/${key}`} class="grid-item">
				{value}
				<br />
				Count: {count}
			</a>
		{/each}
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 10px;
	}
	.grid-item {
		padding: 10px;
		background-color: #f0f4f8;
		text-align: center;
		text-decoration: none;
		color: #102a43;
		font-weight: 500;
		border: 1px solid #d9e2ec;
		border-radius: 6px;
		transition: background-color 0.2s ease;
	}
	.grid-item:hover {
		background-color: #d9e2ec;
	}
</style>

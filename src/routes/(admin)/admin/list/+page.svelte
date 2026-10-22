<script>
	import { onMount } from 'svelte';
	import { getDocs, query, where, getCountFromServer, orderBy } from 'firebase/firestore';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { selectedYear, loadAdminYear, offlineCol } from '$lib/yearScope';
	import { getBranches } from '$lib/branches';
	import { exportRegistrationsCSV } from '$lib/exportCsv';

	let branchesWithCounts = [];
	let total = 0;
	let unlistedCount = 0;
	let year = null;

	onMount(() => {
		loadAdminYear();
	});

	$: if ($selectedYear && $selectedYear !== year) {
		year = $selectedYear;
		loadCounts();
	}

	async function loadCounts() {
		const loadingYear = year;
		const branches = await getBranches(loadingYear);
		const countPromises = branches.map(async ({ code, name }) => {
			const q = query(offlineCol(loadingYear), where('branch', '==', code));
			const querySnapshot = await getCountFromServer(q);
			return {
				key: code,
				value: name,
				count: querySnapshot.data().count
			};
		});
		const q = query(offlineCol(loadingYear));
		const querySnapshot = await getCountFromServer(q);
		const counts = await Promise.all(countPromises);

		// The year was switched while counts were loading; a newer load owns the UI.
		if (loadingYear !== year) return;
		total = querySnapshot.data().count;
		branchesWithCounts = counts;
		// Registrations whose branch code isn't in this year's list (e.g. a branch removed later).
		unlistedCount = total - counts.reduce((sum, b) => sum + b.count, 0);
	}
	async function handleExportCSV() {
		const q = query(offlineCol(year), orderBy('creationTime', 'desc'));
		const querySnapshot = await getDocs(q);
		const registrations = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		await exportRegistrationsCSV(registrations, year);
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
	{#if unlistedCount > 0}
		<p class="text-sm text-orange-600">
			{unlistedCount}টি রেজিস্ট্রেশনের শাখা কোড {year} সালের শাখার তালিকায় নেই।
			<a href="/admin/branches" class="underline">শাখার তালিকা দেখুন</a>
		</p>
	{/if}
	<div class="grid">
		{#each branchesWithCounts as { key, value, count }}
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

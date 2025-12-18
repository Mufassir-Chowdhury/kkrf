<script>
	import { onMount } from 'svelte';
	import { collection, getDocs, orderBy, query } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import UploadResultModal from '$lib/components/UploadResultModal.svelte';

	let allRegistrations = [];
	let filteredRegistrations = [];
	let loading = true;
	let activeTab = '৪র্থ';
	let showUploadModal = false;

	const tabs = ['৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম'];

	onMount(async () => {
		try {
			const q = query(
				collection(db, 'offline-2025'),
				orderBy('serial', 'desc') // Or any other sorting
			);
			const querySnapshot = await getDocs(q);
			allRegistrations = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			filterRegistrations();
		} catch (error) {
			console.error('Error loading registrations:', error);
		} finally {
			loading = false;
		}
	});

	function filterRegistrations() {
		filteredRegistrations = allRegistrations.filter((reg) => reg.class === activeTab);
	}

	function handleTabChange(tab) {
		activeTab = tab;
		filterRegistrations();
	}
</script>

<svelte:head>
	<title>Results - Admin Dashboard</title>
</svelte:head>
<BreadCrumb
	links={[
		{ url: '/admin', label: 'Home' },
		{ url: '#', label: 'Result' }
	]}
/>
<div class="p-6 space-y-6 bg-gray-50 min-h-screen">
	<div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
		<h2 class="text-2xl font-bold text-teal-700">Results</h2>
		<button
			on:click={() => (showUploadModal = true)}
			class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
		>
			Upload Result
		</button>
	</div>

	<!-- Tabs -->
	<div class="bg-white rounded-lg p-2 shadow-sm">
		<nav class="flex space-x-2 overflow-x-auto" aria-label="Tabs">
			{#each tabs as tab}
				<button
					on:click={() => handleTabChange(tab)}
					class="{activeTab === tab
						? 'bg-teal-100 text-teal-700'
						: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} whitespace-nowrap px-4 py-2 rounded-md font-medium text-sm transition-colors flex-1 text-center"
				>
					{tab}
				</button>
			{/each}
		</nav>
	</div>

	<!-- Table -->
	{#if loading}
		<div class="text-center py-10">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
			<span class="mt-2 text-gray-500 block">Loading...</span>
		</div>
	{:else if filteredRegistrations.length === 0}
		<div
			class="text-center py-12 bg-white rounded-lg shadow-sm items-center flex flex-col justify-center"
		>
			<p class="text-gray-500 text-lg">No entries found for {activeTab}</p>
		</div>
	{:else}
		<div class="overflow-hidden shadow-md sm:rounded-lg bg-white">
			<table class="w-full text-sm text-left text-gray-500">
				<thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
					<tr>
						<th scope="col" class="px-6 py-4">Student Details</th>
						<th scope="col" class="px-6 py-4 text-center">Type</th>
						<th scope="col" class="px-6 py-4 text-center">Gender</th>
						<th scope="col" class="px-6 py-4 text-center">First</th>
						<th scope="col" class="px-6 py-4 text-center">Second</th>
						<th scope="col" class="px-6 py-4 text-center">Total</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredRegistrations as reg}
						<tr class="bg-white border-b hover:bg-gray-50 transition-colors">
							<td class="px-6 py-4">
								<div class="flex flex-col">
									<span class="text-teal-600 font-bold text-base">#{reg.roll || 'N/A'}</span>
									<span class="font-semibold text-gray-900 text-base">{reg.name}</span>
									<span class="text-xs text-gray-500 mt-0.5">{reg.institution}</span>
								</div>
							</td>
							<td class="px-6 py-4 text-center">
								<span
									class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
								>
									{reg.institutionType ? reg.institutionType.charAt(0).toUpperCase() : '-'}
								</span>
							</td>
							<td class="px-6 py-4 text-center">
								<span
									class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium {reg.gender ===
									'female'
										? 'bg-pink-100 text-pink-800'
										: 'bg-green-100 text-green-800'}"
								>
									{reg.gender ? reg.gender.charAt(0).toUpperCase() : '-'}
								</span>
							</td>
							<td class="px-6 py-4 text-center font-medium">{reg.first || 0}</td>
							<td class="px-6 py-4 text-center font-medium">{reg.second || 0}</td>
							<td class="px-6 py-4 text-center">
								<span class="text-lg font-bold text-gray-900">{reg.total || 0}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<UploadResultModal show={showUploadModal} on:close={() => (showUploadModal = false)} />
</div>

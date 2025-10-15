<script>
	import { onMount } from 'svelte';
	import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
	import { db } from '$lib/firebase';

	let loading = true;
	let institutionGroups = [];
	let selectedInstitutions = new Set();
	let standardName = '';
	let searchTerm = '';
	let sortBy = 'count';
	let filteredGroups = [];

	onMount(async () => {
		await loadInstitutions();
	});

	async function loadInstitutions() {
		loading = true;
		try {
			const querySnapshot = await getDocs(collection(db, 'offline-2025'));
			const registrations = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

			// Group by institution name (case-insensitive)
			const institutionMap = new Map();
			
			registrations.forEach(reg => {
				const institution = reg.institution || 'Unknown';
				const lowerInstitution = institution.toLowerCase().trim();
				
				if (!institutionMap.has(lowerInstitution)) {
					institutionMap.set(lowerInstitution, {
						displayName: institution,
						count: 0,
						registrationIds: []
					});
				}
				
				const group = institutionMap.get(lowerInstitution);
				group.count++;
				group.registrationIds.push(reg.id);
			});

			// Convert to array and sort by count (descending)
			institutionGroups = Array.from(institutionMap.entries())
				.map(([key, value]) => ({
					key,
					displayName: value.displayName,
					count: value.count,
					registrationIds: value.registrationIds
				}));

			applySorting();
			filteredGroups = [...institutionGroups];
		} catch (err) {
			console.error('Error loading institutions:', err);
			alert('Error loading institutions');
		}
		loading = false;
	}

	function applySorting() {
		if (sortBy === 'count') {
			institutionGroups.sort((a, b) => b.count - a.count);
		} else {
			institutionGroups.sort((a, b) => a.displayName.localeCompare(b.displayName));
		}
	}

	function handleSearch() {
		if (!searchTerm.trim()) {
			filteredGroups = [...institutionGroups];
		} else {
			const term = searchTerm.toLowerCase();
			filteredGroups = institutionGroups.filter(g => 
				g.displayName.toLowerCase().includes(term)
			);
		}
	}

	function toggleSort() {
		sortBy = sortBy === 'count' ? 'name' : 'count';
		applySorting();
		handleSearch(); // Re-apply search with new sorting
	}

	function toggleSelect(key) {
		if (selectedInstitutions.has(key)) {
			selectedInstitutions.delete(key);
		} else {
			selectedInstitutions.add(key);
		}
		selectedInstitutions = selectedInstitutions; // trigger reactivity
	}

	function selectAll() {
		selectedInstitutions = new Set(filteredGroups.map(g => g.key));
	}

	function deselectAll() {
		selectedInstitutions = new Set();
	}

	async function handleMerge() {
		if (selectedInstitutions.size === 0) {
			alert('Please select at least one institution to merge');
			return;
		}

		if (!standardName.trim()) {
			alert('Please enter a standard name for the merged institutions');
			return;
		}

		const selectedGroups = institutionGroups.filter(g => selectedInstitutions.has(g.key));
		const totalRegistrations = selectedGroups.reduce((sum, g) => sum + g.count, 0);
		const institutionNames = selectedGroups.map(g => g.displayName).join(', ');

		if (!confirm(
			`Are you sure you want to merge these ${selectedInstitutions.size} institution names into "${standardName}"?\n\n` +
			`This will update ${totalRegistrations} registrations.\n\n` +
			`Institutions to merge:\n${institutionNames}`
		)) {
			return;
		}

		try {
			loading = true;
			
			// Get all registration IDs that need updating
			const allRegistrationIds = selectedGroups.flatMap(g => g.registrationIds);
			
			// Batch update in chunks of 500 (Firestore limit)
			const chunkSize = 500;
			for (let i = 0; i < allRegistrationIds.length; i += chunkSize) {
				const chunk = allRegistrationIds.slice(i, i + chunkSize);
				const batch = writeBatch(db);
				
				chunk.forEach(id => {
					const ref = doc(db, 'offline-2025', id);
					batch.update(ref, { institution: standardName.trim() });
				});
				
				await batch.commit();
			}

			alert(`Successfully merged ${selectedInstitutions.size} institution names, updating ${totalRegistrations} registrations!`);
			
			// Reset and reload
			selectedInstitutions = new Set();
			standardName = '';
			await loadInstitutions();
		} catch (err) {
			console.error('Error merging institutions:', err);
			alert('Error merging institutions. Please try again.');
			loading = false;
		}
	}

	function autoFillStandardName() {
		if (selectedInstitutions.size === 0) return;
		
		// Get the selected institution with the highest count
		const selected = institutionGroups
			.filter(g => selectedInstitutions.has(g.key))
			.sort((a, b) => b.count - a.count);
		
		if (selected.length > 0) {
			standardName = selected[0].displayName;
		}
	}

	$: totalSelected = institutionGroups
		.filter(g => selectedInstitutions.has(g.key))
		.reduce((sum, g) => sum + g.count, 0);
</script>

<svelte:head>
	<title>Institution Name Management - Merge & Standardize</title>
</svelte:head>

{#if loading}
	<div class="flex justify-center items-center h-screen">
		<p class="text-xl">Loading...</p>
	</div>
{:else}
	<div class="space-y-6 p-6 max-w-7xl mx-auto">
		<div class="bg-white shadow-md rounded-lg p-6">
			<h1 class="text-3xl font-bold text-center text-teal-700 mb-2">
				Institution Name Management
			</h1>
			<p class="text-center text-gray-600 mb-6">
				Total Unique Institutions: {institutionGroups.length}
			</p>

			<!-- Search Bar -->
			<div class="mb-6">
				<input
					type="text"
					bind:value={searchTerm}
					on:input={handleSearch}
					placeholder="Search institutions..."
					class="w-full p-3 border border-gray-300 rounded-md"
				/>
			</div>
			<!-- Sort Toggle -->
			<div class="mb-4 flex justify-end">
				<button
					on:click={toggleSort}
					class="bg-indigo-500 px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
				>
					Sort by: {sortBy === 'count' ? 'Count ↓' : 'Name ↑'}
				</button>
			</div>

			<!-- Selection Controls -->
			<div class="flex justify-between items-center mb-4">
				<div class="space-x-2">
					<button
						on:click={selectAll}
						class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
					>
						Select All ({filteredGroups.length})
					</button>
					<button
						on:click={deselectAll}
						class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
					>
						Deselect All
					</button>
				</div>
				<div class="text-sm text-gray-600">
					Selected: {selectedInstitutions.size} institutions ({totalSelected} registrations)
				</div>
			</div>

			<!-- Merge Section -->
			{#if selectedInstitutions.size > 0}
				<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
					<h3 class="font-semibold text-lg mb-3">Merge Selected Institutions</h3>
					<div class="flex gap-2 mb-3">
						<input
							type="text"
							bind:value={standardName}
							placeholder="Enter standard institution name..."
							class="flex-1 p-2 border border-gray-300 rounded-md"
						/>
						<button
							on:click={autoFillStandardName}
							class="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors whitespace-nowrap"
						>
							Use Most Common
						</button>
					</div>
					<button
						on:click={handleMerge}
						disabled={!standardName.trim()}
						class="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
					>
						Merge {selectedInstitutions.size} Institutions → "{standardName || '...'}"
					</button>
				</div>
			{/if}

			<!-- Institution List -->
			<div class="overflow-x-auto shadow-md sm:rounded-lg">
				<table class="w-full text-sm text-left text-gray-500">
					<thead class="text-xs text-gray-700 uppercase bg-gray-50">
						<tr>
							<th scope="col" class="px-6 py-3 w-12">Select</th>
							<th scope="col" class="px-6 py-3">Institution Name</th>
							<th scope="col" class="px-6 py-3 text-center">Count</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredGroups as group, i}
							<tr 
								class="{selectedInstitutions.has(group.key) ? 'bg-blue-100' : (i % 2 === 0 ? 'bg-white' : 'bg-gray-50')} border-b hover:bg-gray-100 cursor-pointer"
								on:click={() => toggleSelect(group.key)}
							>
								<td class="px-6 py-4">
									<input
										type="checkbox"
										checked={selectedInstitutions.has(group.key)}
										on:change={() => toggleSelect(group.key)}
										class="w-4 h-4"
									/>
								</td>
								<td class="px-6 py-4 font-medium text-gray-900">
									{group.displayName}
								</td>
								<td class="px-6 py-4 text-center">
									<span class="bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold">
										{group.count}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if filteredGroups.length === 0}
				<p class="text-center text-gray-500 my-8">No institutions found.</p>
			{/if}
		</div>
	</div>
{/if}
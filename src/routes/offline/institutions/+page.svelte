<script>
	import { onMount } from 'svelte';
	import { collection, getDocs, writeBatch, doc, getDoc, setDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';

	let loading = true;
	let institutionGroups = [];
	let selectedInstitutions = new Set();
	let standardName = '';
	let searchTerm = '';
	let sortBy = 'count';
	let filteredGroups = [];
	let mergeRules = new Map(); // Tracks: oldName -> newName
	let pendingMerges = []; // Array of merge rules for display

	onMount(async () => {
		await loadInstitutions();
		await loadMergeRules();
	});

	async function loadInstitutions() {
		loading = true;
		try {
			// Try to load from cache first
			const cacheDoc = await getDoc(doc(db, '_cache', 'institution-groups'));

			if (cacheDoc.exists()) {
				const cached = cacheDoc.data();
				institutionGroups = cached.groups || [];
				applySorting();
				filteredGroups = [...institutionGroups];
				loading = false;
				return;
			}

			// If no cache, rebuild from scratch
			await rebuildCache();
		} catch (err) {
			console.error('Error loading institutions:', err);
			alert('Error loading institutions');
			loading = false;
		}
	}

	async function loadMergeRules() {
		try {
			const rulesDoc = await getDoc(doc(db, '_cache', 'merge-rules'));
			if (rulesDoc.exists()) {
				const data = rulesDoc.data();
				mergeRules = new Map(Object.entries(data.rules || {}));
				updatePendingMerges();
			}
		} catch (err) {
			console.error('Error loading merge rules:', err);
		}
	}

	async function saveMergeRules() {
		try {
			const rulesObject = Object.fromEntries(mergeRules);
			await setDoc(doc(db, '_cache', 'merge-rules'), {
				rules: rulesObject,
				lastUpdated: new Date().toISOString()
			});
		} catch (err) {
			console.error('Error saving merge rules:', err);
			throw err;
		}
	}

	function updatePendingMerges() {
		// Convert mergeRules Map to array for display
		const mergeMap = new Map(); // newName -> [oldNames]

		mergeRules.forEach((newName, oldKey) => {
			if (!mergeMap.has(newName)) {
				mergeMap.set(newName, []);
			}
			// Find the display name for this key
			const group = institutionGroups.find((g) => g.key === oldKey);
			if (group) {
				mergeMap.get(newName).push(group.displayName);
			}
		});

		pendingMerges = Array.from(mergeMap.entries()).map(([newName, oldNames]) => ({
			standardName: newName,
			institutions: oldNames,
			count: oldNames.length
		}));
	}

	async function rebuildCache() {
		const querySnapshot = await getDocs(collection(db, 'offline-2025'));
		const registrations = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

		const institutionMap = new Map();

		registrations.forEach((reg) => {
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

		institutionGroups = Array.from(institutionMap.entries()).map(([key, value]) => ({
			key,
			displayName: value.displayName,
			count: value.count,
			registrationIds: value.registrationIds
		}));

		// Save to cache
		await setDoc(doc(db, '_cache', 'institution-groups'), {
			groups: institutionGroups,
			lastUpdated: new Date().toISOString()
		});

		applySorting();
		filteredGroups = [...institutionGroups];
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
			filteredGroups = institutionGroups.filter((g) => g.displayName.toLowerCase().includes(term));
		}
	}

	function toggleSort() {
		sortBy = sortBy === 'count' ? 'name' : 'count';
		applySorting();
		handleSearch();
	}

	function toggleSelect(key) {
		if (selectedInstitutions.has(key)) {
			selectedInstitutions.delete(key);
		} else {
			selectedInstitutions.add(key);
		}
		selectedInstitutions = selectedInstitutions;
	}

	function selectAll() {
		selectedInstitutions = new Set(filteredGroups.map((g) => g.key));
	}

	function deselectAll() {
		selectedInstitutions = new Set();
	}

	async function addMergeRule() {
		if (selectedInstitutions.size === 0) {
			alert('Please select at least one institution to merge');
			return;
		}

		if (!standardName.trim()) {
			alert('Please enter a standard name for the merged institutions');
			return;
		}

		try {
			// Add selected institutions to merge rules
			selectedInstitutions.forEach((key) => {
				mergeRules.set(key, standardName.trim());
			});

			await saveMergeRules();
			updatePendingMerges();

			alert(`Added merge rule for ${selectedInstitutions.size} institutions → "${standardName}"`);

			selectedInstitutions = new Set();
			standardName = '';
		} catch (err) {
			console.error('Error adding merge rule:', err);
			alert('Error adding merge rule. Please try again.');
		}
	}

	async function applyAllMerges() {
		if (mergeRules.size === 0) {
			alert('No merge rules to apply');
			return;
		}

		const totalInstitutions = mergeRules.size;
		const totalRegistrations = Array.from(mergeRules.keys()).reduce((sum, key) => {
			const group = institutionGroups.find((g) => g.key === key);
			return sum + (group?.count || 0);
		}, 0);

		if (
			!confirm(
				`Are you sure you want to apply all pending merges?\n\n` +
					`This will update ${totalRegistrations} registrations across ${totalInstitutions} institutions.\n\n` +
					`This action cannot be undone.`
			)
		) {
			return;
		}

		try {
			loading = true;

			// Get all registration IDs and their new institution names
			const updates = [];
			mergeRules.forEach((newName, oldKey) => {
				const group = institutionGroups.find((g) => g.key === oldKey);
				if (group) {
					group.registrationIds.forEach((id) => {
						updates.push({ id, newName });
					});
				}
			});

			// Batch update in chunks of 500
			const chunkSize = 500;
			for (let i = 0; i < updates.length; i += chunkSize) {
				const chunk = updates.slice(i, i + chunkSize);
				const batch = writeBatch(db);

				chunk.forEach((update) => {
					const ref = doc(db, 'offline-2025', update.id);
					batch.update(ref, { institution: update.newName });
				});

				await batch.commit();
			}

			// Clear merge rules
			mergeRules.clear();
			await saveMergeRules();
			updatePendingMerges();

			alert(`Successfully applied all merges! Updated ${totalRegistrations} registrations.`);

			// Rebuild cache to reflect changes
			await rebuildCache();
		} catch (err) {
			console.error('Error applying merges:', err);
			alert('Error applying merges. Please try again.');
		} finally {
			loading = false;
		}
	}

	async function clearAllMergeRules() {
		if (!confirm('Are you sure you want to clear all pending merge rules?')) {
			return;
		}

		mergeRules.clear();
		await saveMergeRules();
		updatePendingMerges();
		alert('All merge rules cleared');
	}

	async function removeMergeRule(standardNameToRemove) {
		// Remove all rules with this standard name
		const keysToRemove = [];
		mergeRules.forEach((newName, oldKey) => {
			if (newName === standardNameToRemove) {
				keysToRemove.push(oldKey);
			}
		});

		keysToRemove.forEach((key) => mergeRules.delete(key));
		await saveMergeRules();
		updatePendingMerges();
	}

	function autoFillStandardName() {
		if (selectedInstitutions.size === 0) return;

		const selected = institutionGroups
			.filter((g) => selectedInstitutions.has(g.key))
			.sort((a, b) => b.count - a.count);

		if (selected.length > 0) {
			standardName = selected[0].displayName;
		}
	}

	$: totalSelected = institutionGroups
		.filter((g) => selectedInstitutions.has(g.key))
		.reduce((sum, g) => sum + g.count, 0);

	$: totalPendingRegistrations = Array.from(mergeRules.keys()).reduce((sum, key) => {
		const group = institutionGroups.find((g) => g.key === key);
		return sum + (group?.count || 0);
	}, 0);
</script>

<svelte:head>
	<title>Institution Name Management - Merge & Standardize</title>
</svelte:head>

<BreadCrumb links={[
    { url: '/offline/list', label: 'Home' },
    { url: `#`, label: 'Institution List' }
  ]} />

{#if loading}
	<div class="flex justify-center items-center h-screen">
		<p class="text-xl">Loading...</p>
	</div>
{:else}
	<div class="space-y-6 p-6 max-w-7xl mx-auto">
		<!-- Pending Merges Section -->
		{#if pendingMerges.length > 0}
			<div class="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 shadow-lg">
				<div class="flex justify-between items-start mb-4">
					<div>
						<h2 class="text-2xl font-bold text-orange-800 mb-2">
							Pending Merges ({pendingMerges.length})
						</h2>
						<p class="text-sm text-orange-700">
							{totalPendingRegistrations} registrations will be updated
						</p>
					</div>
					<div class="space-x-2">
						<button
							on:click={applyAllMerges}
							class="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-semibold"
						>
							✓ Apply All Merges
						</button>
						<button
							on:click={clearAllMergeRules}
							class="bg-red-500 text-white px-4 py-3 rounded-md hover:bg-red-600 transition-colors"
						>
							Clear All
						</button>
					</div>
				</div>

				<div class="space-y-3 max-h-96 overflow-y-auto">
					{#each pendingMerges as merge}
						<div class="bg-white p-4 rounded-md shadow-sm border border-orange-200">
							<div class="flex justify-between items-start">
								<div class="flex-1">
									<p class="font-semibold text-lg text-gray-900 mb-2">
										→ {merge.standardName}
									</p>
									<p class="text-sm text-gray-600">
										Merging {merge.count} variants: {merge.institutions.join(', ')}
									</p>
								</div>
								<button
									on:click={() => removeMergeRule(merge.standardName)}
									class="text-red-500 hover:text-red-700 font-bold text-xl ml-4"
									title="Remove this merge rule"
								>
									×
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="bg-white shadow-md rounded-lg p-6">
			<h1 class="text-3xl font-bold text-center text-teal-700 mb-2">Institution Name Management</h1>
			<button
				on:click={async () => {
					if (confirm('Rebuild cache from registrations? This will reload all institution data.')) {
						loading = true;
						await rebuildCache();
						loading = false;
						alert('Cache rebuilt successfully!');
					}
				}}
				class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
			>
				🔄 Refresh Cache
			</button>
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
					class="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
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

			<!-- Add Merge Rule Section -->
			{#if selectedInstitutions.size > 0}
				<div
					class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 fixed bottom-6 right-6 z-50 shadow-2xl max-w-md"
				>
					<h3 class="font-semibold text-lg mb-3">Add Merge Rule</h3>
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
						on:click={addMergeRule}
						disabled={!standardName.trim()}
						class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
					>
						Add Rule: {selectedInstitutions.size} Institutions → "{standardName || '...'}"
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
							{@const hasPendingMerge = mergeRules.has(group.key)}
							<tr
								class="{hasPendingMerge
									? 'bg-orange-100'
									: selectedInstitutions.has(group.key)
										? 'bg-blue-100'
										: i % 2 === 0
											? 'bg-white'
											: 'bg-gray-50'} border-b hover:bg-gray-100 cursor-pointer"
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
									{#if hasPendingMerge}
										<span class="ml-2 text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
											→ {mergeRules.get(group.key)}
										</span>
									{/if}
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
<!-- "institutions": [
{#each filteredGroups as group, i}
	{group.displayName},<br />
{/each}
] -->

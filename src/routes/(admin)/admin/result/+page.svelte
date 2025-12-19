<script>
	import { onMount } from 'svelte';
	import { collection, getDocs, orderBy, query, writeBatch, doc } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import UploadResultModal from '$lib/components/UploadResultModal.svelte';

	let allRegistrations = [];
	let filteredRegistrations = [];
	let loading = true;
	// Selection & Grading State
	let activeTab = '৪র্থ';
	let showUploadModal = false;
	let filterMode = 'class'; // 'class' or 'school'
	let selectedSchool = '';
	let schoolCounts = [];

	let sortField = 'total';
	let sortDirection = 'desc';

	let selectedIds = new Set();
	let selectAll = false;
	let isAssigning = false;

	let globalStats = { talentpool: 0, general: 0, special: 0, total: 0 };
	let classStats = { talentpool: 0, general: 0, special: 0, total: 0 };

	const tabs = ['৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম'];

	onMount(() => {
		loadData();
	});

	async function loadData() {
		try {
			loading = true;
			const q = query(collection(db, 'offline-2025'), orderBy('serial', 'desc'));
			const querySnapshot = await getDocs(q);
			allRegistrations = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

			// Compute initial school counts from ALL data (for global school mode)
			computeSchoolCounts(allRegistrations);

			filterRegistrations();
		} catch (error) {
			console.error('Error loading registrations:', error);
		} finally {
			loading = false;
		}
	}

	function handleSort(field) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'desc';
		}
		filterRegistrations();
	}

	function sortData(data) {
		return [...data].sort((a, b) => {
			const valA = Number(a[sortField] || 0);
			const valB = Number(b[sortField] || 0);
			return sortDirection === 'asc' ? valA - valB : valB - valA;
		});
	}

	function computeSchoolCounts(data) {
		const counts = {};
		data.forEach((r) => {
			const school = r.institution || 'Unknown';
			counts[school] = (counts[school] || 0) + 1;
		});
		schoolCounts = Object.entries(counts)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);
	}

	function filterRegistrations() {
		let filtered = [];

		if (filterMode === 'class') {
			// Filter by Class
			filtered = allRegistrations.filter((reg) => reg.class === activeTab);
		} else {
			// Filter by School
			if (selectedSchool) {
				filtered = allRegistrations.filter(
					(reg) => (reg.institution || 'Unknown') === selectedSchool
				);
			} else {
				// Show all if no school selected
				filtered = allRegistrations;
			}
		}

		filteredRegistrations = sortData(filtered);

		// Reset selection when filtering/tab changing
		selectedIds = new Set();
		selectAll = false;

		computeStats(filtered); // Pass filtered list to compute stats for the current view
	}

	function handleTabChange(tab) {
		activeTab = tab;
		filterRegistrations();
	}

	function setFilterMode(mode) {
		filterMode = mode;
		selectedSchool = ''; // Reset school selection when switching modes
		filterRegistrations();
	}

	function computeStats(currentViewList) {
		// Global Stats (remains based on ALL data)
		globalStats = { talentpool: 0, general: 0, special: 0, total: 0 };
		allRegistrations.forEach((reg) => {
			if (reg.grade) {
				globalStats[reg.grade] = (globalStats[reg.grade] || 0) + 1;
				globalStats.total++;
			}
		});

		// Current View Stats (based on filtered list - Class + School)
		// Default to current filteredRegistrations if argument not provided (handled in loadData)
		const targetList = currentViewList || filteredRegistrations;

		classStats = { talentpool: 0, general: 0, special: 0, total: 0 };
		targetList.forEach((reg) => {
			if (reg.grade) {
				classStats[reg.grade] = (classStats[reg.grade] || 0) + 1;
				classStats.total++;
			}
		});
	}

	function toggleSelectAll() {
		if (selectAll) {
			selectedIds = new Set(filteredRegistrations.map((r) => r.id));
		} else {
			selectedIds = new Set();
		}
		selectedIds = selectedIds; // trigger reactivity
	}

	function toggleSelect(id) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
		selectedIds = selectedIds;
		selectAll =
			filteredRegistrations.length > 0 && selectedIds.size === filteredRegistrations.length;
	}

	async function assignGrade(grade) {
		if (selectedIds.size === 0) return;
		const actionName = grade ? `assign '${grade}' to` : 'unassign grade from';
		if (!confirm(`Are you sure you want to ${actionName} ${selectedIds.size} student(s)?`)) {
			return;
		}

		isAssigning = true;
		try {
			const batch = writeBatch(db);
			selectedIds.forEach((id) => {
				const docRef = doc(db, 'offline-2025', id);
				batch.update(docRef, { grade: grade || null });
			});
			await batch.commit();

			// Optimistic update
			allRegistrations = allRegistrations.map((r) => {
				if (selectedIds.has(r.id)) {
					return { ...r, grade: grade || null };
				}
				return r;
			});

			computeStats();
			filterRegistrations(); // Re-apply sort and filter to refresh view

			selectedIds = new Set();
			selectAll = false;
			// alert('Grades updated successfully');
		} catch (e) {
			console.error('Error updating grades:', e);
			alert('Error updating grades');
		} finally {
			isAssigning = false;
		}
	}

	function getRowClass(grade) {
		switch (grade) {
			case 'talentpool':
				return 'bg-green-50 hover:bg-green-100';
			case 'general':
				return 'bg-blue-50 hover:bg-blue-100';
			case 'special':
				return 'bg-purple-50 hover:bg-purple-100';
			default:
				return 'bg-white hover:bg-gray-50';
		}
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
	<div
		class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm"
	>
		<div class="flex items-center gap-4">
			<h2 class="text-2xl font-bold text-teal-700">Results</h2>
			<!-- Filter Mode Switcher -->
			<div class="flex bg-gray-100 rounded-lg p-1">
				<button
					on:click={() => setFilterMode('class')}
					class="px-3 py-1 text-sm font-medium rounded {filterMode === 'class'
						? 'bg-white shadow text-teal-700'
						: 'text-gray-500 hover:text-gray-700'}">By Class</button
				>
				<button
					on:click={() => setFilterMode('school')}
					class="px-3 py-1 text-sm font-medium rounded {filterMode === 'school'
						? 'bg-white shadow text-teal-700'
						: 'text-gray-500 hover:text-gray-700'}">By Institution</button
				>
			</div>
		</div>
		<button
			on:click={() => (showUploadModal = true)}
			class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
		>
			Upload Result
		</button>
	</div>

	<!-- Global Stats -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		<div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-teal-500">
			<div class="text-xs text-gray-500 uppercase font-bold">Total Assigned</div>
			<div class="text-2xl font-bold text-gray-800">{globalStats.total}</div>
		</div>
		<div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
			<div class="text-xs text-gray-500 uppercase font-bold">Talentpool</div>
			<div class="text-2xl font-bold text-gray-800">{globalStats.talentpool}</div>
		</div>
		<div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
			<div class="text-xs text-gray-500 uppercase font-bold">General</div>
			<div class="text-2xl font-bold text-gray-800">{globalStats.general}</div>
		</div>
		<div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
			<div class="text-xs text-gray-500 uppercase font-bold">Special</div>
			<div class="text-2xl font-bold text-gray-800">{globalStats.special}</div>
		</div>
	</div>

	<div class="space-y-4">
		<!-- Dynamic Filter Controls -->
		<div class="bg-white rounded-lg p-2 shadow-sm">
			{#if filterMode === 'class'}
				<!-- Class Tabs -->
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
			{:else}
				<!-- Global School Dropdown -->
				<div class="p-2">
					<label class="block text-sm font-medium text-gray-700 mb-1">Select Institution</label>
					<select
						bind:value={selectedSchool}
						on:change={() => filterRegistrations()}
						class="w-full lg:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
					>
						<option value="">All Institutions ({allRegistrations.length})</option>
						{#each schoolCounts as school}
							<option value={school.name}>{school.name} ({school.count})</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>

		<!-- View Level Stats & Controls -->
		<div
			class="bg-white p-4 rounded-lg shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4"
		>
			<div
				class="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center justify-center lg:justify-start"
			>
				<span class="font-bold text-gray-700 border-r pr-4 mr-0">
					{#if filterMode === 'class'}
						Class {activeTab}
					{:else}
						{selectedSchool || 'All Institutions'}
					{/if}
					Stats:
				</span>
			</div>

			<div class="flex flex-wrap gap-2 justify-center lg:justify-end w-full lg:w-auto">
				<button
					disabled={selectedIds.size === 0 || isAssigning}
					on:click={() => assignGrade('talentpool')}
					class="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-wide transition-colors"
				>
					Talentpool
				</button>
				<button
					disabled={selectedIds.size === 0 || isAssigning}
					on:click={() => assignGrade('general')}
					class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-wide transition-colors"
				>
					General
				</button>
				<button
					disabled={selectedIds.size === 0 || isAssigning}
					on:click={() => assignGrade('special')}
					class="px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-wide transition-colors"
				>
					Special
				</button>
				<div class="w-px bg-gray-300 mx-1 hidden sm:block"></div>
				<button
					disabled={selectedIds.size === 0 || isAssigning}
					on:click={() => assignGrade(null)}
					class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-wide transition-colors"
				>
					Unassign
				</button>
			</div>
		</div>
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
		<div class="overflow-x-auto shadow-md sm:rounded-lg bg-white">
			<table class="w-full text-sm text-left text-gray-500">
				<thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
					<tr>
						<th scope="col" class="px-6 py-4 w-10">
							<input
								type="checkbox"
								bind:checked={selectAll}
								on:change={toggleSelectAll}
								class="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
							/>
						</th>
						<th scope="col" class="px-6 py-4 w-16">#</th>
						<th scope="col" class="px-6 py-4">Student Details</th>
						<th scope="col" class="px-6 py-4 text-center">Type</th>
						<th scope="col" class="px-6 py-4 text-center">Gender</th>
						{#each ['first', 'second', 'total'] as field}
							<th
								scope="col"
								class="px-6 py-4 text-center cursor-pointer hover:bg-gray-100"
								on:click={() => handleSort(field)}
							>
								<div class="flex items-center justify-center gap-1">
									{field.charAt(0).toUpperCase() + field.slice(1)}
									{#if sortField === field}
										<span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
									{/if}
								</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each filteredRegistrations as reg, i}
						<tr class="{getRowClass(reg.grade)} border-b transition-colors">
							<td class="px-6 py-4">
								<input
									type="checkbox"
									checked={selectedIds.has(reg.id)}
									on:change={() => toggleSelect(reg.id)}
									class="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
								/>
							</td>
							<td class="px-6 py-4 font-medium text-gray-500">
								{i + 1}
							</td>
							<td class="px-6 py-4">
								<div class="flex flex-col">
									<span class="text-teal-600 font-bold text-base">#{reg.roll || 'N/A'}</span>
									<span class="font-semibold text-gray-900 text-base">{reg.name}</span>
									<span class="text-xs text-gray-500 mt-0.5">{reg.institution} | {reg.class}</span>
								</div>
							</td>
							<td class="px-6 py-4 text-center">
								<span
									class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium {reg.institutionType ===
									'school'
										? 'bg-pink-100 text-pink-800'
										: 'bg-green-100 text-green-800'}"
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

	<UploadResultModal
		show={showUploadModal}
		registrations={allRegistrations}
		on:close={() => {
			showUploadModal = false;
			loadData();
		}}
	/>
</div>

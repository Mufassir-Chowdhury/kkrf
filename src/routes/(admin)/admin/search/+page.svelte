<script>
	import { onMount } from 'svelte';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { encodeRoll } from '$lib/hash';
	import { searchAllRegistrations } from './search-db';

	let searchTerm = '';
	let searchResults = [];
	let loading = false;
	let hasSearched = false;
	let searchType = 'all'; // 'all', 'mobile', 'name', 'institution'

	async function handleSearch() {
		if (!searchTerm.trim()) {
			alert('Please enter a search term');
			return;
		}

		loading = true;
		hasSearched = true;

		try {
			searchResults = await searchAllRegistrations(searchTerm.trim(), searchType);
		} catch (err) {
			console.error('Error searching:', err);
			alert('Error performing search. Please try again.');
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function clearSearch() {
		searchTerm = '';
		searchResults = [];
		hasSearched = false;
	}

	const class_ban = {
		'1': '১০ম',
		'4': '৪র্থ',
		'5': '৫ম',
		'6': '৬ষ্ঠ',
		'7': '৭ম',
		'8': '৮ম',
		'9': '৯ম'
	};
</script>

<svelte:head>
	<title>Search All Registrations - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</title>
</svelte:head>

<BreadCrumb
	links={[
		{ url: '/admin', label: 'Home' },
		{ url: '#', label: 'Search All' }
	]}
/>

<div class="max-w-6xl mx-auto p-6 space-y-6">
	<h2 class="text-3xl font-bold text-center text-teal-700">Search All Registrations</h2>

	<div class="bg-white rounded-lg shadow-md p-6 space-y-4">
		<!-- Search Type Selection -->
		<div class="flex flex-wrap gap-2 justify-center">
			<label class="inline-flex items-center">
				<input
					type="radio"
					bind:group={searchType}
					value="all"
					class="form-radio text-teal-600 focus:ring-teal-500"
				/>
				<span class="ml-2">All Fields</span>
			</label>
			<label class="inline-flex items-center">
				<input
					type="radio"
					bind:group={searchType}
					value="mobile"
					class="form-radio text-teal-600 focus:ring-teal-500"
				/>
				<span class="ml-2">Mobile</span>
			</label>
			<label class="inline-flex items-center">
				<input
					type="radio"
					bind:group={searchType}
					value="name"
					class="form-radio text-teal-600 focus:ring-teal-500"
				/>
				<span class="ml-2">Name</span>
			</label>
			<label class="inline-flex items-center">
				<input
					type="radio"
					bind:group={searchType}
					value="institution"
					class="form-radio text-teal-600 focus:ring-teal-500"
				/>
				<span class="ml-2">Institution</span>
			</label>
		</div>

		<!-- Search Input -->
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={searchTerm}
				on:keypress={handleKeyPress}
				placeholder="Search by mobile, name, or institution..."
				class="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
			/>
			<button
				on:click={handleSearch}
				disabled={loading}
				class="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
			>
				{loading ? 'Searching...' : 'Search'}
			</button>
			{#if hasSearched}
				<button
					on:click={clearSearch}
					class="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
				>
					Clear
				</button>
			{/if}
		</div>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="text-center">
				<div
					class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"
				></div>
				<p class="mt-4 text-gray-600">Searching all branches...</p>
			</div>
		</div>
	{/if}

	<!-- Results -->
	{#if hasSearched && !loading}
		<div class="bg-white rounded-lg shadow-md p-6">
			<h3 class="text-xl font-semibold mb-4 text-gray-800">
				Search Results: {searchResults.length} found
			</h3>

			{#if searchResults.length === 0}
				<p class="text-center text-gray-500 py-8">
					No registrations found matching "{searchTerm}"
				</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm text-left text-gray-500">
						<thead class="text-xs text-gray-700 uppercase bg-gray-50">
							<tr class="hidden lg:table-row">
								<th scope="col" class="px-6 py-3">Serial/Roll</th>
								<th scope="col" class="px-6 py-3">Name</th>
								<th scope="col" class="px-6 py-3">Institution</th>
								<th scope="col" class="px-6 py-3">Class</th>
								<th scope="col" class="px-6 py-3">Mobile</th>
								<th scope="col" class="px-6 py-3 text-right">Admit Card</th>
							</tr>
						</thead>
						<tbody>
							{#each searchResults as registration}
								<tr
									class="block lg:table-row border-b border-gray-200 mb-4 lg:mb-0 hover:bg-gray-50 transition-colors duration-200 {registration.confirm
										? 'bg-teal-50'
										: 'bg-white'}"
								>
									<td class="block lg:table-cell px-6 py-4" data-label="Serial/Roll">
										<div>Serial: {registration.serial}</div>
										{#if registration.roll}
											<div class="text-teal-600 font-bold">Roll: {registration.roll}</div>
										{/if}
									</td>

									<td
										class="block lg:table-cell px-6 py-4 font-bold text-gray-900"
										data-label="Name"
									>
										{registration.name}
									</td>

									<td class="block lg:table-cell px-6 py-4" data-label="Institution">
										{registration.institution}
									</td>

									<td class="block lg:table-cell px-6 py-4" data-label="Class">
										{#if registration.roll}
											{class_ban[registration.roll[1]]}
										{/if}
									</td>

									<td class="block lg:table-cell px-6 py-4" data-label="Mobile">
										{registration.mobile}
									</td>

									<td class="block lg:table-cell px-6 py-4" data-label="Admit Card">
										<div class="flex justify-end">
											{#if registration.roll}
												<a
													href="/admit/{encodeRoll(registration.roll)}"
													target="_blank"
													class="inline-flex items-center px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm"
													title="View Admit Card"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														class="h-4 w-4 mr-1"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
														/>
													</svg>
													View
												</a>
											{:else}
												<span class="text-gray-400 text-sm">No roll assigned</span>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	@media (max-width: 1023px) {
		td[data-label]::before {
			content: attr(data-label);
			font-weight: 600;
			color: #4b5563;
			float: left;
			margin-right: 1rem;
		}

		td {
			display: flex;
			justify-content: space-between;
			align-items: center;
			text-align: right;
		}

		td:last-child {
			justify-content: flex-end;
		}
	}
</style>

<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { handleExportCSV } from './util';
	import { loadRegistrations, deleteRegistration } from './db';

	export let data;
	let branch = $page.params.branch;
	let registrations = [];
	let filteredRegistrations = [];
	let searchTerm = '';
	let loading = true;
	let error = null;
	let serialRange = '';
	let duplicateSerials = [];
	let missingSerials = [];
	let invalidSerials = [];
	let invalidMobiles = [];

	onMount(async () => {
		await handleLoad();
	});

	import { updateDoc, doc } from 'firebase/firestore';
	import { db } from '$lib/firebase';

	let incompleteRegs = [];

	function computeIncomplete() {
		incompleteRegs = registrations.filter((r) => !r.gender || !r.institutionType);
	}

	async function handleBulkUpdate() {
		for (const reg of incompleteRegs) {
			const ref = doc(db, 'offline-2025', reg.id);
			await updateDoc(ref, {
				gender: reg.gender ?? '',
				institutionType: reg.institutionType ?? ''
			});
		}
		// refresh only the temporary list
		const branch = $page.params.branch;
		registrations = await loadRegistrations(branch);
		handleLoad();
	}

	async function handleLoad() {
		loading = true;
		registrations = await loadRegistrations(branch);
		computeSerialRange(branch);
		computeIncomplete();
		filterRegistrations();
		loading = false;
	}

	function computeSerialRange(branch) {
		const regex = new RegExp(`^${branch}\\d{3}$`);
		const allSerials = registrations.map((r) => r.serial);

		const validSerials = allSerials.filter((s) => regex.test(s)).map((s) => parseInt(s));

		if (validSerials.length > 0) {
			const min = Math.min(...validSerials);
			const max = Math.max(...validSerials);
			serialRange = `${min}-${max}`;

			// duplicates
			const counts = {};
			validSerials.forEach((s) => (counts[s] = (counts[s] || 0) + 1));
			duplicateSerials = Object.keys(counts).filter((k) => counts[k] > 1);

			// gaps
			const serialSet = new Set(validSerials);
			missingSerials = [];
			for (let i = min; i <= max; i++) {
				if (!serialSet.has(i)) missingSerials.push(i);
			}

			// invalids (not matching regex OR outside min/max)
			invalidSerials = allSerials.filter((s) => {
				if (!regex.test(s)) return true;
				const num = parseInt(s);
				return num < min || num > max;
			});

			// invalid mobiles
			invalidMobiles = registrations
				.filter((r) => !/^\d{11}$/.test(r.mobile ?? ''))
				.map((r) => r.serial);
		} else {
			serialRange = 'No valid serials';
			duplicateSerials = [];
			missingSerials = [];
			invalidSerials = [];
			invalidMobiles = [];
		}
	}

	function filterRegistrations() {
		filteredRegistrations = registrations.filter(
			(reg) =>
				reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				reg.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
				reg.mobile.includes(searchTerm)
		);
	}

	function handleSearch() {
		filterRegistrations();
	}

	async function handleDelete(id) {
		await deleteRegistration(id);
		await handleLoad();
	}

	function handleEdit(id) {
		goto(`/offline/edit/${id}`);
	}
</script>

<svelte:head>
	<title>Admin Dashboard - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</title>
</svelte:head>

{#if loading}
	<div class="flex justify-center items-center h-screen">
		<p class="text-xl">Loading...</p>
	</div>
{:else if error}
	<div class="text-red-500 text-center p-4">
		{error}
	</div>
{:else}
	<div class="space-y-6 p-6">
		<h2 class="text-2xl font-bold text-center text-teal-700">
			Registrations: {data.thana[branch]} - [{registrations.length}]
		</h2>
		<p class="text-center text-gray-600">Serial Range: {serialRange}</p>
		{#if duplicateSerials.length > 0}
			<p class="text-center text-red-600">Duplicates: {duplicateSerials.join(', ')}</p>
		{/if}
		{#if missingSerials.length > 0}
			<p class="text-center text-orange-600">Gaps: {missingSerials.join(', ')}</p>
		{/if}
		{#if invalidSerials.length > 0}
			<p class="text-center text-purple-600">
				Invalid Serials: {invalidSerials.join(', ')} (There may be extra spaces)
			</p>
		{/if}
		{#if invalidMobiles.length > 0}
			<p class="text-center text-pink-600">
				Invalid Mobile (not 11 digits): {invalidMobiles.join(', ')}
			</p>
		{/if}

		<div class="flex justify-between items-center">
			<input
				type="text"
				bind:value={searchTerm}
				on:input={handleSearch}
				placeholder="Search by name, institution, or mobile"
				class="p-2 border border-gray-300 rounded-md w-64"
			/>
			<div class="space-x-2">
				<button
					on:click={() => handleExportCSV(registrations)}
					class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
				>
					Export CSV
				</button>
			</div>
		</div>

		{#if incompleteRegs.length > 0}
			<div class="p-4 border rounded bg-yellow-50 space-y-2">
				<p class="font-semibold text-yellow-700">
					Incomplete Registrations: {incompleteRegs.length}
				</p>
				<table class="w-full text-sm border">
					<thead class="bg-gray-100">
						<tr>
							<th class="px-2 py-1">Serial</th>
							<th class="px-2 py-1">Name</th>
							<th class="px-2 py-1">Gender</th>
							<th class="px-2 py-1">Institution Type</th>
						</tr>
					</thead>
					<tbody>
						{#each incompleteRegs as reg}
							<tr class="border-t">
								<td class="px-2 py-1">{reg.serial}</td>
								<td class="px-2 py-1">{reg.name}</td>
								<td class="px-2 py-1">{reg.institution}</td>
								<td class="px-2 py-1">
									<select bind:value={reg.gender} class="border p-1 rounded w-full">
										<option value="">Select</option>
										<option value="male">male</option>
										<option value="female">female</option>
									</select>
								</td>
								<td class="px-2 py-1">
									<select bind:value={reg.institutionType} class="border p-1 rounded w-full">
										<option value="">Select</option>
										<option value="school">school</option>
										<option value="madrasa">madrasa</option>
									</select>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<button
					on:click={handleBulkUpdate}
					class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
				>
					Save All
				</button>
			</div>
		{/if}

		{#if filteredRegistrations.length === 0}
			<p class="text-center text-gray-500 my-4">No registrations found.</p>
		{:else}
			<div class="overflow-x-auto shadow-md sm:rounded-lg my-6">
				<table class="w-full text-sm text-left text-gray-500">
					<thead class="text-xs text-gray-700 uppercase bg-gray-50">
						<tr>
							<th scope="col" class="px-6 py-3">Qualifiers</th>
							<th scope="col" class="px-6 py-3">Serial</th>
							<th scope="col" class="px-6 py-3">Name</th>
							<th scope="col" class="px-6 py-3">Institution</th>
							<th scope="col" class="px-6 py-3">Class</th>
							<th scope="col" class="px-6 py-3">Mobile</th>
							<th scope="col" class="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredRegistrations as registration, i}
							<tr class="{i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b hover:bg-gray-100">
								<td class="px-6 py-4">
									{registration.gender ?? 'Gender Not Specified'} <br />
									{registration.institutionType ?? 'Institution Type Not Specified'}
								</td>
								<td class="px-6 py-4">{registration.serial}</td>
								<td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
									>{registration.name}</td
								>
								<td class="px-6 py-4">{registration.institution}</td>
								<td class="px-6 py-4">{registration.class}</td>
								<td class="px-6 py-4">{registration.mobile}</td>
								<td class="px-6 py-4 space-x-2">
									<button
										on:click={() => handleEdit(registration.id)}
										class="font-medium text-blue-600 hover:underline"
									>
										Edit
									</button>
									<button
										on:click={() => handleDelete(registration.id)}
										class="font-medium text-red-600 hover:underline"
									>
										Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
{/if}

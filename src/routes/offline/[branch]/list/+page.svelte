<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { handleExportCSV } from './util';
	import { loadRegistrations, deleteRegistration, assignRollNumbers } from './db';
	import { writeBatch } from 'firebase/firestore';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';

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

	let rangeStart = '';
	let rangeEnd = '';
	let showRangeModal = false;

	// Roll assignment modal
	let showRollModal = false;
	let centerNumber = '';
	let assigningRolls = false;

	let selectedIds = new Set();
	let selectAll = false;
	let confirmedCount = 0;

	function toggleSelectAll() {
		if (selectAll) {
			selectedIds = new Set(filteredRegistrations.map((r) => r.id));
		} else {
			selectedIds = new Set();
		}
	}

	function toggleSelect(id) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
		selectedIds = selectedIds; // trigger reactivity
		selectAll = selectedIds.size === filteredRegistrations.length;
	}

	async function handleAssignRolls() {
		const center = parseInt(centerNumber);

		if (!centerNumber || isNaN(center) || center < 1 || center > 3) {
			alert('Please enter a valid center number (1-3)');
			return;
		}

		const confirmedRegs = registrations.filter((r) => r.confirm === true && !r.roll);

		if (confirmedRegs.length === 0) {
			alert('No confirmed registrations without roll numbers found');
			return;
		}

		if (
			!confirm(
				`Assign roll numbers to ${confirmedRegs.length} confirmed registration(s) in center ${center}?`
			)
		) {
			return;
		}

		try {
			assigningRolls = true;
			await assignRollNumbers(confirmedRegs, center);
			showRollModal = false;
			centerNumber = '';
			await handleLoad();
			alert('Roll numbers assigned successfully!');
		} catch (err) {
			console.error('Error assigning rolls:', err);
			alert('Error assigning roll numbers. Please try again.');
		} finally {
			assigningRolls = false;
		}
	}

	async function handleConfirmRegistrations() {
		if (selectedIds.size === 0) {
			alert('Please select at least one registration to confirm');
			return;
		}

		if (!confirm(`Are you sure you want to confirm ${selectedIds.size} registration(s)?`)) {
			return;
		}

		try {
			const batch = writeBatch(db);

			for (const id of selectedIds) {
				const ref = doc(db, 'offline-2025', id);
				batch.update(ref, { confirm: true });
			}

			await batch.commit();
			selectedIds = new Set();
			selectAll = false;
			await handleLoad();
			alert('Registrations confirmed successfully!');
		} catch (err) {
			console.error('Error confirming registrations:', err);
			alert('Error confirming registrations. Please try again.');
		}
	}

	async function handleConfirmRange() {
		if (!rangeStart || !rangeEnd) {
			alert('Please enter both start and end serial numbers');
			return;
		}

		const start = parseInt(rangeStart);
		const end = parseInt(rangeEnd);

		if (isNaN(start) || isNaN(end)) {
			alert('Please enter valid numbers');
			return;
		}

		if (start > end) {
			alert('Start serial must be less than or equal to end serial');
			return;
		}

		// Find registrations in range
		const regsInRange = registrations.filter((r) => {
			const serialNum = parseInt(r.serial);
			return serialNum >= start && serialNum <= end;
		});

		if (regsInRange.length === 0) {
			alert('No registrations found in this range');
			return;
		}

		if (
			!confirm(
				`Are you sure you want to confirm ${regsInRange.length} registration(s) in range ${start}-${end}?`
			)
		) {
			return;
		}

		try {
			const batch = writeBatch(db);

			for (const reg of regsInRange) {
				const ref = doc(db, 'offline-2025', reg.id);
				batch.update(ref, { confirm: true });
			}

			await batch.commit();
			showRangeModal = false;
			rangeStart = '';
			rangeEnd = '';
			await handleLoad();
			alert('Range confirmed successfully!');
		} catch (err) {
			console.error('Error confirming range:', err);
			alert('Error confirming range. Please try again.');
		}
	}

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
		confirmedCount = registrations.filter((r) => r.confirm === true).length;
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

<BreadCrumb links={[
    { url: '/offline/list', label: 'Home' },
    { url: `/offline/${branch}/list`, label: data.thana[branch] },
    { url: `#`, label: 'List' }
  ]} />

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
		<p class="text-center text-blue-600 font-semibold">Confirmed Registrations: {confirmedCount}</p>
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
		<input
			type="text"
			bind:value={searchTerm}
			on:input={handleSearch}
			placeholder="Search by name, institution, or mobile"
			class="p-2 border border-gray-300 rounded-md w-96"
		/>
		<div class="flex justify-between items-center w-full">
			<div class="flex items-center gap-2 flex-wrap w-full justify-between">
				<button
					on:click={handleConfirmRegistrations}
					disabled={selectedIds.size === 0}
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
					title="Confirm Registration"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5 mr-0 sm:mr-2"
						><path
							fill-rule="evenodd"
							d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z"
							clip-rule="evenodd"
						/></svg
					>
					<span class="hidden sm:inline">Confirm ({selectedIds.size})</span>
				</button>

				<button
					on:click={() => (showRangeModal = true)}
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
					title="Confirm Range"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5 mr-0 sm:mr-2"
						><path
							fill-rule="evenodd"
							d="M13.28 3.22a.75.75 0 00-1.06 0l-7 7a.75.75 0 000 1.06l7 7a.75.75 0 001.06-1.06L6.81 10l6.47-6.47a.75.75 0 000-1.06z"
							clip-rule="evenodd"
						/></svg
					>
					<span class="hidden sm:inline">Confirm Range</span>
				</button>

				<button
					on:click={() => (showRollModal = true)}
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
					title="Assign Roll Numbers"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5 mr-0 sm:mr-2"
						><path
							fill-rule="evenodd"
							d="M11.78 5.22a.75.75 0 01.22.53v4.25h4.25a.75.75 0 010 1.5h-4.25v4.25a.75.75 0 01-1.5 0v-4.25H6.25a.75.75 0 010-1.5h4.25V5.75a.75.75 0 01.53-.72l.092-.022a.75.75 0 01.948.72zM4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z"
							clip-rule="evenodd"
						/></svg
					>
					<span class="hidden sm:inline">Assign Roll Numbers</span>
				</button>

				<a
					href="/offline/{branch}/admit"
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-colors"
					title="Admit Card"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5 mr-0 sm:mr-2"
						><path
							d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.995 9.995 0 0010 12c-2.31 0-4.438.784-6.131 2.095z"
						/></svg
					>
					<span class="hidden sm:inline">Admit Card</span>
				</a>

				<button
					on:click={() => handleExportCSV(registrations)}
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-colors"
					title="Export CSV"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5 mr-0 sm:mr-2"
						><path
							d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"
						/><path
							d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"
						/></svg
					>
					<span class="hidden sm:inline">Export CSV</span>
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
			<div class="overflow-hidden shadow-lg sm:rounded-lg my-6 bg-white">
				<table class="w-full text-sm text-left text-gray-500">
					<thead class="text-xs text-gray-700 uppercase bg-gray-50">
						<tr class="hidden lg:table-row">
							<th scope="col" class="p-4">
								<input
									type="checkbox"
									bind:checked={selectAll}
									on:change={toggleSelectAll}
									class="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
								/>
							</th>
							<th scope="col" class="px-6 py-3">Qualifiers</th>
							<th scope="col" class="px-6 py-3">Serial/Roll</th>
							<th scope="col" class="px-6 py-3">Name</th>
							<th scope="col" class="px-6 py-3">Institution</th>
							<th scope="col" class="px-6 py-3">Class</th>
							<th scope="col" class="px-6 py-3">Mobile</th>
							<th scope="col" class="px-6 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredRegistrations as registration}
							<tr
								class="block lg:table-row border-b border-gray-200 mb-4 lg:mb-0
                           hover:bg-gray-50 transition-colors duration-200
                           {registration.confirm ? 'bg-teal-50' : 'bg-white'}"
							>
								<td class="block lg:table-cell p-4 lg:w-4" data-label="Select">
									<input
										type="checkbox"
										checked={selectedIds.has(registration.id)}
										on:change={() => toggleSelect(registration.id)}
										class="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
									/>
								</td>

								<td class="block lg:table-cell px-6 py-4" data-label="Qualifiers">
									<span class="font-semibold text-gray-700">{registration.gender ?? 'N/A'}</span> /
									<span>{registration.institutionType ?? 'N/A'}</span>
								</td>

								<td class="block lg:table-cell px-6 py-4" data-label="Serial/Roll">
									<div>Serial: {registration.serial}</div>
									{#if registration.roll}
										<div class="text-teal-600 font-bold">Roll: {registration.roll}</div>
									{/if}
								</td>

								<td class="block lg:table-cell px-6 py-4 font-bold text-gray-900" data-label="Name">
									{registration.name}
								</td>

								<td class="block lg:table-cell px-6 py-4" data-label="Institution"
									>{registration.institution}</td
								>
								<td class="block lg:table-cell px-6 py-4" data-label="Class"
									>{registration.class}</td
								>
								<td class="block lg:table-cell px-6 py-4" data-label="Mobile"
									>{registration.mobile}</td
								>

								<td class="block lg:table-cell px-6 py-4" data-label="Actions">
									<div class="flex justify-end items-center gap-4">
										<button
											on:click={() => handleEdit(registration.id)}
											class="text-blue-600 hover:text-blue-800 h-8 w-8"
											title="Edit"
										>
											<svg fill="#008080" width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z"/></svg>
										</button>
										<button
											on:click={() => handleDelete(registration.id)}
											class="text-red-600 hover:text-red-800 h-8 w-8"
											title="Delete"
										>
											<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2h4a1 1 0 1 1 0 2h-1.069l-.867 12.142A2 2 0 0 1 17.069 22H6.93a2 2 0 0 1-1.995-1.858L4.07 8H3a1 1 0 0 1 0-2h4V4zm2 2h6V4H9v2zM6.074 8l.857 12H17.07l.857-12H6.074zM10 10a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1z" fill="#FF0000"/></svg>
										</button>
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

{#if showRangeModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-96 shadow-xl">
			<h3 class="text-xl font-bold mb-4">Confirm Serial Range</h3>
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-1">Start Serial</label>
					<input
						type="number"
						bind:value={rangeStart}
						placeholder="e.g., 1001"
						class="w-full p-2 border border-gray-300 rounded-md"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">End Serial</label>
					<input
						type="number"
						bind:value={rangeEnd}
						placeholder="e.g., 1050"
						class="w-full p-2 border border-gray-300 rounded-md"
					/>
				</div>
				<div class="flex space-x-2 justify-end">
					<button
						on:click={() => {
							showRangeModal = false;
							rangeStart = '';
							rangeEnd = '';
						}}
						class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
					>
						Cancel
					</button>
					<button
						on:click={handleConfirmRange}
						class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if showRollModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-96 shadow-xl">
			<h3 class="text-xl font-bold mb-4">Assign Roll Numbers</h3>
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-1">Center Number (1-3)</label>
					<input
						type="number"
						bind:value={centerNumber}
						placeholder="Enter 1, 2, or 3"
						min="1"
						max="3"
						disabled={assigningRolls}
						class="w-full p-2 border border-gray-300 rounded-md"
					/>
				</div>
				<p class="text-sm text-gray-600">
					This will assign roll numbers to all confirmed registrations without existing roll
					numbers.
				</p>
				<div class="flex space-x-2 justify-end">
					<button
						on:click={() => {
							showRollModal = false;
							centerNumber = '';
						}}
						disabled={assigningRolls}
						class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						on:click={handleAssignRolls}
						disabled={assigningRolls}
						class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
					>
						{assigningRolls ? 'Assigning...' : 'Assign Rolls'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	/* This is the magic for the responsive card layout */
	@media (max-width: 1023px) {
		/* Corresponds to Tailwind's 'lg' breakpoint */
		td[data-label]::before {
			content: attr(data-label); /* Use the data-label attribute as content */
			font-weight: 600; /* semibold */
			color: #4b5563; /* text-gray-600 */
			float: left;
			margin-right: 1rem; /* space between label and value */
		}

		td {
			display: flex;
			justify-content: space-between;
			align-items: center;
			text-align: right;
		}

		/* First cell in the card (checkbox) should not have a label */
		td:first-child::before {
			content: '';
		}

		/* Last cell (Actions) should just align right */
		td:last-child {
			justify-content: flex-end;
		}

		td:last-child::before {
			content: ''; /* Actions don't need a visible label */
		}
	}
</style>

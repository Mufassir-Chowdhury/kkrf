<script>
	import { createEventDispatcher } from 'svelte';
	import readXlsxFile from 'read-excel-file';
	import { doc, writeBatch } from 'firebase/firestore';
	import { db } from '$lib/firebase';

	export let show = false;
	export let registrations = [];

	const dispatch = createEventDispatcher();
	let files = [];
	let headers = [];
	let selectedRollCol = '';
	let selectedMarkCol = '';
	let parsing = false;
	let previewData = [];
	let missingRolls = [];
	let processing = false;

	function close() {
		files = [];
		headers = [];
		selectedRollCol = '';
		selectedMarkCol = '';
		previewData = [];
		missingRolls = [];
		dispatch('close');
	}

	function handleFileChange(event) {
		files = Array.from(event.target.files);
		if (files.length > 0) {
			readHeaders(files[0]);
		}
	}

	async function readHeaders(file) {
		try {
			const rows = await readXlsxFile(file);
			if (rows.length > 0) {
				headers = rows[0];
			}
		} catch (error) {
			console.error('Error reading headers:', error);
			alert('Error reading Excel file headers.');
		}
	}

	async function handlePreview() {
		if (!selectedRollCol || !selectedMarkCol) {
			alert('Please select Roll and Mark columns.');
			return;
		}

		parsing = true;
		previewData = [];
		missingRolls = [];

		try {
			for (const file of files) {
				const filename = file.name.replace('.xlsx', '');
				const [classPart, paperPart] = filename.split('_');

				// Map filename to class and field
				// 4_1 -> Class: '৪র্থ', Field: 'first'
				// 4_2 -> Class: '৪র্থ', Field: 'second'
				const classMap = {
					'4': '৪র্থ',
					'5': '৫ম',
					'6': '৬ষ্ঠ',
					'7': '৭ম',
					'8': '৮ম',
					'9': '৯ম',
					'10': '১০ম'
				};
				const fieldMap = {
					'1': 'first',
					'2': 'second'
				};

				const targetClass = classMap[classPart];
				const targetField = fieldMap[paperPart];

				if (!targetClass || !targetField) {
					console.warn(`Skipping invalid filename: ${file.name}`);
					continue;
				}

				const rows = await readXlsxFile(file);

				// Find indices
				const rollIndex = headers.indexOf(selectedRollCol);
				const markIndex = headers.indexOf(selectedMarkCol);

				if (rollIndex === -1 || markIndex === -1) {
					alert(`Columns mismatch in file ${file.name}`);
					continue;
				}

				// Skip header
				for (let i = 1; i < rows.length; i++) {
					const row = rows[i];
					const roll = row[rollIndex]?.toString().trim();
					const mark = row[markIndex];

					if (!roll) continue;

					// Find in registrations
					const reg = registrations.find((r) => r.roll === roll && r.class === targetClass);

					if (reg) {
						previewData.push({
							id: reg.id,
							roll: roll,
							name: reg.name,
							class: targetClass,
							field: targetField,
							mark: mark
						});
					} else {
						missingRolls.push({
							file: file.name,
							roll: roll,
							class: targetClass
						});
					}
				}
			}
		} catch (error) {
			console.error('Error parsing files:', error);
			alert('Error parsing files.');
		} finally {
			parsing = false;
		}
	}

	async function handleUpload() {
		if (previewData.length === 0) {
			alert('No matching data to upload.');
			return;
		}

		if (!confirm(`Update ${previewData.length} records?`)) return;

		processing = true;
		try {
			const batch = writeBatch(db);

			// We might have multiple updates for the same doc if both papers are uploaded
			// But since we iterate files sequentially and might have duplicates in previewData
			// Firestore batch limits: 500 ops. We should chunk it.

			const chunks = [];
			const chunkSize = 400; // Safe limit

			// Group by ID to merge updates
			const updatesById = {};
			for (const item of previewData) {
				if (!updatesById[item.id]) {
					updatesById[item.id] = {};
				}
				updatesById[item.id][item.field] = item.mark;
			}

			// Re-calculate totals
			for (const id in updatesById) {
				// Find original reg to get existing marks if not in update
				const reg = registrations.find((r) => r.id === id);
				if (reg) {
					const first =
						updatesById[id].first !== undefined
							? Number(updatesById[id].first)
							: Number(reg.first) || 0;
					const second =
						updatesById[id].second !== undefined
							? Number(updatesById[id].second)
							: Number(reg.second) || 0;
					updatesById[id].total = first + second;
					updatesById[id].first = first;
					updatesById[id].second = second;
				}
			}

			const updateIds = Object.keys(updatesById);
			for (let i = 0; i < updateIds.length; i += chunkSize) {
				chunks.push(updateIds.slice(i, i + chunkSize));
			}

			for (const chunk of chunks) {
				const subBatch = writeBatch(db);
				for (const id of chunk) {
					const ref = doc(db, 'offline-2025', id);
					subBatch.update(ref, updatesById[id]);
				}
				await subBatch.commit();
			}

			alert('Result uploaded successfully!');
			close();
		} catch (error) {
			console.error('Error updating DB:', error);
			alert('Error updating database.');
		} finally {
			processing = false;
		}
	}
</script>

{#if show}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto shadow-xl">
			<h3 class="text-xl font-bold mb-4">Upload Result</h3>

			{#if previewData.length === 0 && missingRolls.length === 0}
				<div class="space-y-4">
					<p class="text-gray-600 text-sm">
						File names should be 4_1, 4_2, 5_1, 5_2.....10_1, 10_2
					</p>
					<div>
						<label class="block text-sm font-medium mb-1">
							Select Files
							<input
								type="file"
								multiple
								accept=".xlsx"
								on:change={handleFileChange}
								class="w-full p-2 border border-gray-300 rounded-md mt-1"
							/>
						</label>
					</div>

					{#if headers.length > 0}
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium mb-1">Roll Column</label>
								<select bind:value={selectedRollCol} class="w-full p-2 border rounded">
									<option value="">Select</option>
									{#each headers as header}
										<option value={header}>{header}</option>
									{/each}
								</select>
							</div>
							<div>
								<label class="block text-sm font-medium mb-1">Mark Column</label>
								<select bind:value={selectedMarkCol} class="w-full p-2 border rounded">
									<option value="">Select</option>
									{#each headers as header}
										<option value={header}>{header}</option>
									{/each}
								</select>
							</div>
						</div>
					{/if}

					<div class="flex space-x-2 justify-end mt-6">
						<button
							on:click={close}
							class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
						>
							Cancel
						</button>
						<button
							on:click={handlePreview}
							disabled={!selectedRollCol || !selectedMarkCol || parsing}
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
						>
							{parsing ? 'Parsing...' : 'Preview'}
						</button>
					</div>
				</div>
			{:else}
				<!-- Preview Section -->
				<div class="space-y-4">
					<div class="flex gap-4">
						<div class="flex-1 bg-green-50 p-4 rounded border border-green-200">
							<h4 class="font-bold text-green-800">Ready to Update: {previewData.length}</h4>
							<p class="text-sm text-green-700">Records matched and marked for update.</p>
						</div>
						<div class="flex-1 bg-red-50 p-4 rounded border border-red-200">
							<h4 class="font-bold text-red-800">Missing Rolls: {missingRolls.length}</h4>
							<p class="text-sm text-red-700">Rolls in Excel not found in Database.</p>
						</div>
					</div>

					{#if missingRolls.length > 0}
						<div class="mt-4">
							<h5 class="font-bold mb-2">Missing Rolls Details</h5>
							<div class="max-h-40 overflow-y-auto border rounded bg-gray-50 p-2 text-sm">
								<table class="w-full text-left">
									<thead>
										<tr>
											<th>File</th>
											<th>Roll</th>
											<th>Expected Class</th>
										</tr>
									</thead>
									<tbody>
										{#each missingRolls as item}
											<tr class="border-t border-gray-200">
												<td>{item.file}</td>
												<td>{item.roll}</td>
												<td>{item.class}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					{/if}

					<div class="flex space-x-2 justify-end mt-6">
						<button
							on:click={() => {
								previewData = [];
								missingRolls = [];
							}}
							class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
						>
							Back
						</button>
						<button
							on:click={handleUpload}
							disabled={processing || previewData.length === 0}
							class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
						>
							{processing ? 'Updating...' : 'Confirm Update'}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

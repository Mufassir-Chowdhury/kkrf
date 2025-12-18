<script>
	import { createEventDispatcher } from 'svelte';

	export let show = false;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function handleUpload() {
		// Placeholder for upload functionality
		// Logic will be implemented later by the user
		close();
	}
</script>

{#if show}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-96 shadow-xl">
			<h3 class="text-xl font-bold mb-4">Upload Result</h3>
			<div class="space-y-4">
				<p class="text-gray-600 text-sm">File names should be 4_1, 4_2, 5_1, 5_2.....10_1, 10_2</p>
				<div>
					<label class="block text-sm font-medium mb-1">
						Select Files
						<input
							type="file"
							multiple
							accept=".xlsx"
							class="w-full p-2 border border-gray-300 rounded-md mt-1"
						/>
					</label>
				</div>

				<div class="flex space-x-2 justify-end mt-6">
					<button
						on:click={close}
						class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
					>
						Cancel
					</button>
					<button
						on:click={handleUpload}
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						Upload
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

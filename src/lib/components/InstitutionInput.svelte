<script>
	import { searchInstitutions } from '$lib/institutions';

	export let value = '';
	export let institutions = [];
	export let error = '';

	let filtered = [];
	let showDropdown = false;

	function handleInput() {
		filtered = searchInstitutions(value, institutions, 10);
		showDropdown = filtered.length > 0;
	}

	function selectInstitution(institution) {
		value = institution;
		showDropdown = false;
	}

	function handleBlur() {
		// Delay hiding dropdown to allow click events to register
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}
</script>

<div class="relative">
	<label class="block text-sm font-medium text-gray-700">
		শিক্ষা প্রতিষ্ঠান (শুধুমাত্র বাংলায় লিখুন) — তালিকায় ভালোভাবে খুঁজুন, না পেলে সম্পূর্ণ নাম নিজে টাইপ
		করুন
	</label>
	<input
		type="text"
		bind:value
		on:input={handleInput}
		on:focus={handleInput}
		on:blur={handleBlur}
		required
		class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
		autocomplete="off"
	/>
	{#if showDropdown}
		<div
			class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
		>
			{#each filtered as institution}
				<button
					type="button"
					class="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
					on:click={() => selectInstitution(institution)}
				>
					{institution}
				</button>
			{/each}
		</div>
	{/if}
	{#if error}
		<p class="text-red-500 text-sm mt-1">{error}</p>
	{/if}
</div>

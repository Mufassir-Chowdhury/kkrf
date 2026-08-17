<script>
	import { onMount } from 'svelte';
	import { getAllScholarships } from '$lib/siteData';
	import { selectedYear, setAdminYear, loadAdminYear } from '$lib/yearScope';

	let scholarships = [];
	let loading = true;

	onMount(async () => {
		await loadAdminYear();
		scholarships = await getAllScholarships();
		loading = false;
	});

	function handleChange(e) {
		setAdminYear(e.target.value);
	}
</script>

{#if !loading && scholarships.length > 0}
	<select
		value={$selectedYear}
		on:change={handleChange}
		class="bg-white/10 text-white border border-white/20 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40"
	>
		{#each scholarships as s}
			<option value={s.id} class="text-gray-900">{s.year || s.id}</option>
		{/each}
	</select>
{/if}

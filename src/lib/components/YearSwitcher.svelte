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
	<label
		class="flex items-center gap-2 bg-amber-400 text-primary-950 border border-amber-300 rounded-md pl-3 pr-2 py-1.5 shadow-sm"
	>
		<span class="text-xs font-bold uppercase tracking-wide opacity-80">বছর</span>
		<select
			value={$selectedYear}
			on:change={handleChange}
			class="bg-transparent text-primary-950 font-extrabold text-base focus:outline-none cursor-pointer"
		>
			{#each scholarships as s}
				<option value={s.id} class="text-gray-900 font-semibold">{s.year || s.id}</option>
			{/each}
		</select>
	</label>
{/if}

<script>
	import BatchAdmitCards from './BatchAdmitCards.svelte';
	import { page } from '$app/stores';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { getCurrentYear } from '$lib/yearScope';
	import { getBranches, branchName } from '$lib/branches';

	let branch = $page.params.branch;
	let branchLabel = branch;

	let yearPromise = (async () => {
		const year = $page.url.searchParams.get('year') || (await getCurrentYear());
		branchLabel = branchName(await getBranches(year), branch);
		return year;
	})();
</script>

<div class="print:hidden">
	<BreadCrumb
		links={[
			{ url: '/admin', label: 'Home' },
			{ url: `/admin/list`, label: 'Registrations' },
			{ url: `/admin/list/${branch}`, label: branchLabel },
			{ url: `#`, label: 'Admit' }
		]}
	/>
</div>
<div>
	{#await yearPromise then year}
		<BatchAdmitCards {branch} branchName={branchLabel} {year} />
	{/await}
</div>

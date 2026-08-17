<script>
	import BatchAdmitCards from './BatchAdmitCards.svelte';
	import { page } from '$app/stores';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { getCurrentYear } from '$lib/yearScope';

	export let data;
	let branch = $page.params.branch;

	let yearPromise = (async () => $page.url.searchParams.get('year') || (await getCurrentYear()))();
</script>

<div class="print:hidden">
	<BreadCrumb
		links={[
			{ url: '/admin', label: 'Home' },
			{ url: `/admin/list`, label: 'Registrations' },
			{ url: `/admin/list/${branch}`, label: data.thana[branch] },
			{ url: `#`, label: 'Admit' }
		]}
	/>
</div>
<div>
	{#await yearPromise then year}
		<BatchAdmitCards {branch} branchName={data.thana[branch]} {year} />
	{/await}
</div>

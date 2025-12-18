<script>
	import BatchAdmitCards from './BatchAdmitCards.svelte';
	import { page } from '$app/stores';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';

	export let data;
	let branch = $page.params.branch;
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
	<BatchAdmitCards {branch} branchName={data.thana[branch]} />
</div>

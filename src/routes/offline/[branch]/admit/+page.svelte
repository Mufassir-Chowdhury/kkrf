<script>
	import BatchAdmitCards from './BatchAdmitCards.svelte';
  import { page } from '$app/stores';
  import BreadCrumb from '$lib/components/BreadCrumb.svelte';

  export let data;
	let branch = $page.params.branch;
  </script>
  <div class="print:hidden">
    <BreadCrumb links={[
      { url: '/offline/list', label: 'Home' },
      { url: `/offline/${branch}/list`, label: data.thana[branch] },
      { url: `#`, label: 'Admit' }
    ]} />

  </div>
  <div>
      <BatchAdmitCards branch={branch} branchName={data.thana[branch]} />
  </div>
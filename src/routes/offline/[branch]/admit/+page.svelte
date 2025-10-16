<script>
	import BatchAdmitCards from './BatchAdmitCards.svelte';
  import { page } from '$app/stores';
  export let data;
	let branch = $page.params.branch;
  </script>
  <div>
      <BatchAdmitCards branch={branch} branchName={data.thana[branch]} />
  </div>
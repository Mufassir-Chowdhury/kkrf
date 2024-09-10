<script>
  import { createEventDispatcher } from 'svelte';
  import { handleExportCSV, handleExportPDF, handleLogout } from './dashboardUtils';
  
  export let registrations;
  export let filteredRegistrations;
  const dispatch = createEventDispatcher();
  
  function logout() {
    dispatch('logout');
  }
</script>

<div class="space-x-2">
  <button 
    on:click={() => handleExportCSV(registrations)}
    class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
  >
    Export CSV
  </button>
  <button 
    on:click={() => handleExportPDF(filteredRegistrations)}
    class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
  >
    Export PDF
  </button>
  <button 
    on:click={logout}
    class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
  >
    Logout
  </button>
</div>
<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth, db } from '$lib/firebase';
    import { browser } from '$app/environment';
    import SearchBar from './SearchBar.svelte';
    import RegistrationTable from './RegistrationTable.svelte';
    import ExportButtons from './ExportButtons.svelte';
    import ConfirmationModal from './ConfirmationModal.svelte';
    import { loadRegistrations, handleLogout, filterRegistrations } from './dashboardUtils';
    
    let registrations = [];
    let filteredRegistrations = [];
    let searchTerm = '';
    let isLoggedIn = false;
    let loading = true;
    let error = null;
    let selectedRegistration = null;
    
    onMount(() => {
      if (browser) {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!user) {
            goto('/login');
          }
          isLoggedIn = true;
          loading = false;
          registrations = await loadRegistrations();
          filteredRegistrations = registrations;
        });
    
        return () => unsubscribe();
      }
    });
    
    function handleSearch() {
      filteredRegistrations = filterRegistrations(registrations, filteredRegistrations, searchTerm);
    }
    
    function showConfirmationDetails(registration) {
      selectedRegistration = registration;
    }
    </script>
    
    <svelte:head>
      <title>Admin Dashboard - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪</title>
    </svelte:head>
    
    {#if loading}
      <div class="flex justify-center items-center h-screen">
        <p class="text-xl">Loading...</p>
      </div>
    {:else if error}
      <div class="text-red-500 text-center p-4">
        {error}
      </div>
    {:else if isLoggedIn}
      <div class="space-y-6 p-6">
        <h1 class="text-3xl font-bold text-center text-teal-700">Admin Dashboard</h1>
    
        <div class="flex justify-between items-center">
          <SearchBar bind:searchTerm on:search={handleSearch} />
          <ExportButtons 
            {registrations} 
            {filteredRegistrations} 
            on:logout={handleLogout} 
          />
        </div>
    
        <RegistrationTable 
          {filteredRegistrations} 
          on:showDetails={showConfirmationDetails}
        />
      </div>
    {/if}
    
    {#if selectedRegistration}
      <ConfirmationModal 
        registration={selectedRegistration}
        on:close={() => selectedRegistration = null}
        on:confirmationUpdate={() => loadRegistrations(registrations, filteredRegistrations, error)}
      />
    {/if}
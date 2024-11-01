<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page }  from '$app/stores';
  import Papa from 'papaparse';
  
  let registrations = [];
  let filteredRegistrations = [];
  let searchTerm = '';
  let loading = true;
  let error = null;
  let center = $page.params.center;
  
  // Add filter state
  let genderFilter = '';
  let classFilter = '';

  onMount(async () => {
      try {
          const csvResponse = await fetch('/Rolls.csv');
          const csvText = await csvResponse.text();
          Papa.parse(csvText, {
              header: true,
              complete: (result) => {
                  registrations = result.data.filter(reg => reg["Center Number"] === center);
                  filteredRegistrations = registrations;
                  loading = false;
              },
              error: (error) => {
                  console.error('Error parsing CSV:', error);
              }
          });
      } catch (error) {
          console.error('Error fetching CSV:', error);
      }
  });
 
  function filterRegistrations() {
      filteredRegistrations = registrations.filter(reg => {
          const nameMatch = reg.Name.toLowerCase().includes(searchTerm.toLowerCase());
          const instituteMatch = reg.Institute.toLowerCase().includes(searchTerm.toLowerCase());
          const mobileMatch = reg.Mobile.includes(searchTerm);
          const rollMatch = reg.Roll.includes(searchTerm);
          
          // Add gender filter
          const genderMatch = !genderFilter || reg.Gender === genderFilter;
          
          // Add class filter
          const classMatch = !classFilter || reg.Class === classFilter;
          
          return (nameMatch || instituteMatch || mobileMatch || rollMatch) 
                 && genderMatch 
                 && classMatch;
      });
  }

  function handleSearch() {
      filterRegistrations();
  }

  // Function to get unique classes
  $: availableClasses = [...new Set(registrations.map(reg => reg.Class).filter(Boolean))].sort();
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
{:else}
<div class="space-y-6 p-6">
  <h2 class="text-2xl font-bold text-center text-teal-700">Registrations [{registrations.length}]</h2>
  
  <div class="flex space-x-4 mb-4">
    <input
      type="text"
      bind:value={searchTerm}
      on:input={handleSearch}
      placeholder="Search by name, institution, or mobile"
      class="p-2 border border-gray-300 rounded-md w-64"
    />
    
    <select 
      bind:value={genderFilter} 
      on:change={handleSearch}
      class="p-2 border border-gray-300 rounded-md"
    >
      <option value="">All Genders</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>
    
    <select 
      bind:value={classFilter} 
      on:change={handleSearch}
      class="p-2 border border-gray-300 rounded-md"
    >
      <option value="">All Classes</option>
      {#each availableClasses as classOption}
        <option value={classOption}>{classOption}</option>
      {/each}
    </select>
  </div>

  {#if filteredRegistrations.length === 0}
    <p class="text-center text-gray-500 my-4">No registrations found.</p>
  {:else}
    <div class="overflow-x-auto shadow-md sm:rounded-lg my-6">
      <table class="w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3">Qualifiers</th>
            <th scope="col" class="px-6 py-3">Roll</th>
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3">Institution</th>
            <th scope="col" class="px-6 py-3">Class</th>
            <th scope="col" class="px-6 py-3">Mobile</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredRegistrations as registration, i}
            <tr class="{i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b hover:bg-gray-100">
              <td class="px-6 py-4">
                {registration.Gender ?? "Gender Not Specified"} <br>
                {registration["Institute Type"] ?? "Institution Type Not Specified"}
              </td>
              <td class="px-6 py-4">{registration.Roll}</td>
              <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{registration.Name}</td>
              <td class="px-6 py-4">{registration.Institute}</td>
              <td class="px-6 py-4">{registration.Class}</td>
              <td class="px-6 py-4">{registration.Mobile}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
{/if}
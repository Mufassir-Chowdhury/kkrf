<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page }  from '$app/stores';
    import { db } from '$lib/firebase';
    import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, getDoc } from 'firebase/firestore';

    import { handleExportCSV } from './util';
    import { loadRegistrations, deleteRegistration } from './db';
    let registrations = [];
    let filteredRegistrations = [];
    let searchTerm = '';
    let loading = true;
    let error = null;
    let selectedRegistration = null;
    let smsModalOpen = false;
    let selectedUnconfirmedReg = null;

    onMount(async () => {
          await handleLoad();
    });
    async function handleLoad() {
        let branch = $page.params.branch;
        loading = true;
        registrations = await loadRegistrations(branch);
        filterRegistrations();
        loading = false;
    }



    function filterRegistrations() {
      filteredRegistrations = registrations.filter(reg => 
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.mobile.includes(searchTerm)
      );
    }

    function handleSearch() {
      filterRegistrations();
    }

    async function handleDelete(id) {
      await deleteRegistration(id);
        await handleLoad();
    }

    function handleEdit(id) {
      goto(`/offline/edit/${id}`);
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
{:else}
  <div class="space-y-6 p-6">
    <h2 class="text-2xl font-bold text-center text-teal-700">Registrations [{registrations.length}]</h2>

    <div class="flex justify-between items-center">
      <input 
        type="text" 
        bind:value={searchTerm} 
        on:input={handleSearch} 
        placeholder="Search by name, institution, or mobile" 
        class="p-2 border border-gray-300 rounded-md w-64"
      />
      <div class="space-x-2">
        <button 
          on:click={() => handleExportCSV(registrations)}
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Export CSV
        </button>
      </div>
    </div>

    {#if filteredRegistrations.length === 0}
      <p class="text-center text-gray-500 my-4">No registrations found.</p>
    {:else}
      <div class="overflow-x-auto shadow-md sm:rounded-lg my-6">
        <table class="w-full text-sm text-left text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3">ID</th>
              <th scope="col" class="px-6 py-3">Serial</th>
              <th scope="col" class="px-6 py-3">Name</th>
              <th scope="col" class="px-6 py-3">Institution</th>
              <th scope="col" class="px-6 py-3">Class</th>
              <th scope="col" class="px-6 py-3">Mobile</th>
              <th scope="col" class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredRegistrations as registration, i}
              <tr class="{i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b hover:bg-gray-100">
                <td class="px-6 py-4">{registration.id}</td>
                <td class="px-6 py-4">{registration.serial}</td>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{registration.name}</td>
                <td class="px-6 py-4">{registration.institution}</td>
                <td class="px-6 py-4">{registration.class}</td>
                <td class="px-6 py-4">{registration.mobile}</td>
                <td class="px-6 py-4 space-x-2">
                  <button 
                    on:click={() => handleEdit(registration.id)} 
                    class="font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button 
                    on:click={() => handleDelete(registration.id)} 
                    class="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
{/if}


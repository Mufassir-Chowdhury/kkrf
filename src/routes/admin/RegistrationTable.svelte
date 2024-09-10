<script>
    import { createEventDispatcher } from 'svelte';
    import { handleEdit, handleDelete } from './dashboardUtils';
    
    export let filteredRegistrations = [];
    const dispatch = createEventDispatcher();
    
    function showDetails(registration) {
      dispatch('showDetails', registration);
    }
  </script>
  
  {#if filteredRegistrations.length === 0}
    <p class="text-center text-gray-500 my-4">No registrations found.</p>
  {:else}
    <div class="overflow-x-auto shadow-md sm:rounded-lg my-6">
      <table class="w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3">Institution</th>
            <th scope="col" class="px-6 py-3">Class</th>
            <th scope="col" class="px-6 py-3">Mobile</th>
            <th scope="col" class="px-6 py-3">Status</th>
            <th scope="col" class="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredRegistrations as registration, i}
            <tr class="{i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b hover:bg-gray-100">
              <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{registration.name}</td>
              <td class="px-6 py-4">{registration.institution}</td>
              <td class="px-6 py-4">{registration.class}</td>
              <td class="px-6 py-4">{registration.mobile}</td>
              <td class="px-6 py-4">
                <span class={registration.confirmed ? "text-green-600" : "text-red-600"}>
                  {registration.confirmed ? "Confirmed" : "Unconfirmed"}
                </span>
              </td>
              <td class="px-6 py-4 space-x-2">
                <button 
                  on:click={() => showDetails(registration)} 
                  class="font-medium text-purple-600 hover:underline"
                >
                  {registration.confirmed ? "View Details" : "Confirm"}
                </button>
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
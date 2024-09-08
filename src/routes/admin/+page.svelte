<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth, db } from '$lib/firebase';
    import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
    import { browser } from '$app/environment';
  
    let registrations = [];
    let filteredRegistrations = [];
    let searchTerm = '';
    let isLoggedIn = false;
    let loading = true;
    let error = null;
  
    onMount(() => {
      if (browser) {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!user) {
            goto('/login');
          }
          isLoggedIn = true;
          loading = false;
          await loadRegistrations();
        });
  
        return () => unsubscribe();
      }
    });
  
    async function loadRegistrations() {
      try {
        loading = true;
        const querySnapshot = await getDocs(collection(db, 'scholarshipApplications'));
        registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        filterRegistrations();
      } catch (err) {
        console.error("Error loading registrations:", err);
        error = "Failed to load registrations. Please try again.";
      } finally {
        loading = false;
      }
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
      if (confirm('Are you sure you want to delete this registration?')) {
        try {
          await deleteDoc(doc(db, 'scholarshipApplications', id));
          await loadRegistrations();
        } catch (err) {
          console.error("Error deleting registration:", err);
          error = "Failed to delete registration. Please try again.";
        }
      }
    }
  
    function handleEdit(id) {
      goto(`/edit-registration/${id}`);
    }
  
    async function handleLogout() {
      try {
        await auth.signOut();
        isLoggedIn = false;
        goto('/login');
      } catch (err) {
        console.error("Error signing out:", err);
        error = "Failed to sign out. Please try again.";
      }
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
      <input 
        type="text" 
        bind:value={searchTerm} 
        on:input={handleSearch} 
        placeholder="Search by name, institution, or mobile" 
        class="p-2 border border-gray-300 rounded-md w-64"
      />
      <button 
        on:click={handleLogout}
        class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>

    {#if filteredRegistrations.length === 0}
      <p class="text-center text-gray-500">No registrations found.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th class="py-2 px-4 border-b">Name</th>
              <th class="py-2 px-4 border-b">Institution</th>
              <th class="py-2 px-4 border-b">Class</th>
              <th class="py-2 px-4 border-b">Mobile</th>
              <th class="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredRegistrations as registration}
              <tr>
                <td class="py-2 px-4 border-b">{registration.name}</td>
                <td class="py-2 px-4 border-b">{registration.institution}</td>
                <td class="py-2 px-4 border-b">{registration.class}</td>
                <td class="py-2 px-4 border-b">{registration.mobile}</td>
                <td class="py-2 px-4 border-b">
                  <button 
                    on:click={() => handleEdit(registration.id)} 
                    class="bg-teal-500 text-white px-2 py-1 rounded-md mr-2 hover:bg-teal-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    on:click={() => handleDelete(registration.id)} 
                    class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors"
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
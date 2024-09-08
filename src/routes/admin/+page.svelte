<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth, db } from '$lib/firebase';
    import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
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
        const q = query(collection(db, 'scholarshipApplications'), orderBy('creationTime', 'desc'));
        const querySnapshot = await getDocs(q);
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

    function handleExport() {
    const headers = [
        'Name', 'Name (English)', 'Father\'s Name', 'Mother\'s Name', 'Institution', 'Class',
        'Section', 'Class Roll', 'Birth Date', 'Religion', 'Mobile', 'Village', 'Post Office',
        'Upazila', 'District', 'Present Address', 'Guardian Name', 'Relation', 'Guardian Mobile',
        'Transaction ID', 'Creation Time'
    ];

    const csvContent = [
        headers.join(','),
        ...registrations.map(reg => [
        reg.name,
        reg.nameEnglish,
        reg.fatherName,
        reg.motherName,
        reg.institution,
        reg.class,
        reg.section,
        reg.classRoll,
        reg.birthDate,
        reg.religion,
        reg.mobile,
        reg.permanentAddress.village,
        reg.permanentAddress.postOffice,
        reg.permanentAddress.upazila,
        reg.permanentAddress.district,
        reg.presentAddress,
        reg.guardianName,
        reg.relation,
        reg.guardianMobile,
        reg.transactionID,
        reg.creationTime
        ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "scholarship_applications.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
      <div class="space-x-2">
        <button 
          on:click={handleExport}
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Export CSV
        </button>
        <button 
          on:click={handleLogout}
          class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Logout
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
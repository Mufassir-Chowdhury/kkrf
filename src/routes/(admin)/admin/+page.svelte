<script>
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { db } from '$lib/firebase';
    import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, getDoc, limit, startAfter, getCountFromServer } from 'firebase/firestore';
    import { sendConfirmationSMS, handleExportCSV, sendIncompleteRegistrationSMS } from './util';
    import { deleteRegistration, loadAllRegistrations } from './db';
    
    let registrations = [];
    let filteredRegistrations = [];
    let searchTerm = '';
    let loading = true;
    let loadingMore = false;
    let error = null;
    let selectedRegistration = null;
    let smsModalOpen = false;
    let selectedUnconfirmedReg = null;

    // Infinite scroll variables
    let itemsPerPage = 25;
    let totalItems = 0;
    let lastVisible = null;
    let hasMore = true;
    let scrollContainer;

    onMount(async () => {
        await handleInitialLoad();
        window.addEventListener('scroll', handleScroll);
    });

    onDestroy(() => {
        window.removeEventListener('scroll', handleScroll);
    });

    async function handleInitialLoad() {
        loading = true;
        
        try {
            const { items, total, last, hasMoreItems } = await loadMoreRegistrations(null);
            registrations = items;
            totalItems = total;
            lastVisible = last;
            hasMore = hasMoreItems;
            filterRegistrations();
        } catch (err) {
            console.error("Error loading registrations:", err);
            error = "Failed to load registrations. Please try again.";
        } finally {
            loading = false;
        }
    }

    async function handleLoadMore() {
        if (loadingMore || !hasMore) return;
        
        loadingMore = true;
        
        try {
            const { items, total, last, hasMoreItems } = await loadMoreRegistrations(lastVisible);
            registrations = [...registrations, ...items];
            totalItems = total;
            lastVisible = last;
            hasMore = hasMoreItems;
            filterRegistrations();
        } catch (err) {
            console.error("Error loading more registrations:", err);
            error = "Failed to load more registrations. Please try again.";
        } finally {
            loadingMore = false;
        }
    }

    async function loadMoreRegistrations(lastDoc) {
        const registrationsRef = collection(db, 'scholarshipApplications-2025');
        let q;

        if (lastDoc === null) {
            q = query(registrationsRef, orderBy('creationTime', 'desc'), limit(itemsPerPage));
        } else {
            q = query(registrationsRef, orderBy('creationTime', 'desc'), startAfter(lastDoc), limit(itemsPerPage));
        }

        const documentSnapshots = await getDocs(q);
        
        const items = documentSnapshots.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        const last = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        const hasMoreItems = items.length === itemsPerPage;

        // Get total count only on initial load
        let total = totalItems;
        if (lastDoc === null) {
            const countSnapshot = await getCountFromServer(registrationsRef);
            total = countSnapshot.data().count;
        }
        
        return { items, total, last, hasMoreItems };
    }

    function handleScroll() {
        if (searchTerm) return; // Don't load more while filtering
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        // Load more when user is 200px from bottom
        if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore && !loadingMore) {
            handleLoadMore();
        }
    }

    function filterRegistrations() {
        if (searchTerm === '') {
            filteredRegistrations = registrations;
        } else {
            filteredRegistrations = registrations.filter(reg => 
                reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reg.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reg.mobile.includes(searchTerm)
            );
        }
    }

    function handleSearch() {
        filterRegistrations();
    }

    async function handleDelete(id) {
        await deleteRegistration(id);
        // Remove from local array instead of reloading everything
        registrations = registrations.filter(reg => reg.id !== id);
        totalItems--;
        filterRegistrations();
    }

    function handleEdit(id) {
        goto(`/edit-registration/${id}`);
    }

    async function handleExportAllCSV() {
        try {
            const allRegistrations = await loadAllRegistrations();
            handleExportCSV(allRegistrations);
        } catch (err) {
            console.error("Error exporting CSV:", err);
            error = "Failed to export CSV. Please try again.";
        }
    }

    function showConfirmationDetails(registration) {
        selectedRegistration = registration;
    }

    async function confirmRegistration(id) {
        try {
            await updateDoc(doc(db, 'scholarshipApplications-2025', id), { confirmed: true });
            const registrationDoc = await getDoc(doc(db, 'scholarshipApplications-2025', id));
            const registrationData = registrationDoc.data();
            await sendConfirmationSMS(registrationData.mobile);
            
            // Update local array
            registrations = registrations.map(reg => 
                reg.id === id ? { ...reg, confirmed: true } : reg
            );
            filterRegistrations();
            selectedRegistration = null;
        } catch (err) {
            console.error("Error confirming registration:", err);
            error = "Failed to confirm registration. Please try again.";
        }
    }

    async function cancelConfirmation(id) {
        try {
            await updateDoc(doc(db, 'scholarshipApplications-2025', id), { confirmed: false });
            
            // Update local array
            registrations = registrations.map(reg => 
                reg.id === id ? { ...reg, confirmed: false } : reg
            );
            filterRegistrations();
            selectedRegistration = null;
        } catch (err) {
            console.error("Error canceling confirmation:", err);
            error = "Failed to cancel confirmation. Please try again.";
        }
    }

    function openSmsModal(registration) {
        selectedUnconfirmedReg = registration;
        smsModalOpen = true;
    }

    async function handleIncompleteRegistrationSMS(selectedUnconfirmedReg) {
        if (!selectedUnconfirmedReg) return;
        try {
            await sendIncompleteRegistrationSMS(selectedUnconfirmedReg.mobile);
        } finally {
            smsModalOpen = false;
            selectedUnconfirmedReg = null;
        }
    }
</script>

<svelte:head>
    <title>Admin Dashboard - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</title>
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
        <h2 class="text-2xl font-bold text-center text-teal-700">
            Registrations [{totalItems}]
        </h2>

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
                    on:click={handleExportAllCSV}
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
                                    {#if !registration.confirmed}
                                        <button 
                                            on:click={() => openSmsModal(registration)}
                                            class="font-medium text-yellow-600 hover:underline"
                                        >
                                            📩
                                        </button>
                                    {/if}  
                                    <button 
                                        on:click={() => showConfirmationDetails(registration)} 
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

            {#if loadingMore}
                <div class="flex justify-center items-center py-4">
                    <p class="text-gray-600">Loading more...</p>
                </div>
            {/if}

            {#if !hasMore && !searchTerm}
                <div class="flex justify-center items-center py-4">
                    <p class="text-gray-500">No more registrations to load</p>
                </div>
            {/if}

            {#if searchTerm && filteredRegistrations.length < registrations.length}
                <div class="flex justify-center items-center py-4">
                    <p class="text-gray-500">
                        Showing {filteredRegistrations.length} of {registrations.length} loaded registrations
                    </p>
                </div>
            {/if}
        {/if}
    </div>
{/if}

{#if selectedRegistration}
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Registration Details</h3>
                <div class="mt-2 px-7 py-3">
                    <p class="text-sm text-gray-500">
                        Transaction ID: {selectedRegistration.transactionID}
                    </p>
                </div>
                <div class="items-center px-4 py-3">
                    {#if !selectedRegistration.confirmed}
                        <button
                            on:click={() => confirmRegistration(selectedRegistration.id)}
                            class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            Confirm Registration
                        </button>
                    {:else}
                        <button
                            on:click={() => cancelConfirmation(selectedRegistration.id)}
                            class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                            Cancel Confirmation
                        </button>
                    {/if}
                    <button
                        on:click={() => selectedRegistration = null}
                        class="mt-3 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

{#if smsModalOpen}
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="sms-modal">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Send Incomplete Registration SMS</h3>
                <div class="mt-2 px-7 py-3">
                    <p class="text-sm text-gray-500">
                        Are you sure you want to send an SMS to {selectedUnconfirmedReg.name} ({selectedUnconfirmedReg.mobile}) about their incomplete registration?
                    </p>
                </div>
                <div class="items-center px-4 py-3">
                    <button
                        on:click={handleIncompleteRegistrationSMS}
                        class="px-4 py-2 bg-yellow-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    >
                        Send SMS
                    </button>
                    <button
                        on:click={() => { smsModalOpen = false; selectedUnconfirmedReg = null; }}
                        class="mt-3 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}
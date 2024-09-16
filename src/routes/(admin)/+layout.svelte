<script>
    import { onMount } from 'svelte';
    import { auth } from '$lib/firebase';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';

    let loggedIn = false;
    let error = null;

    onMount(() => {
        if (browser) {
            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                if (!user) {
                    goto('/login');
                }
                loggedIn = true;
            });

            return () => unsubscribe();
        }
    });
    
    async function handleLogout() {
        try {
            await auth.signOut();
            goto('/login');
        } catch (err) {
            console.error("Error signing out:", err);
            error = "Failed to sign out. Please try again.";
        }
    }
</script>

{#if loggedIn}
    <div class="space-y-6 p-6">
        <h1 class="text-3xl font-bold text-center text-teal-700">Admin Dashboard</h1>

        <div class="flex justify-between items-center">
        <div class="w-full flex justify-end">
            <button 
            on:click={handleLogout}
            class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
            Logout
            </button>
        </div>
        </div>
    </div>
    <slot></slot>
{:else}
    <p>Loading...</p>
{/if}
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
    <div class="min-h-screen bg-gray-50">
        <header class="bg-primary-900 text-white sticky top-0 z-40 shadow-card">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <a href="/admin" class="flex items-center space-x-3">
                    <img class="h-8 w-8" src="/favicon.png" alt="কিশোরকণ্ঠ Logo">
                    <span class="font-bold text-white">Admin Panel</span>
                </a>
                <button
                    on:click={handleLogout}
                    class="bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-white/20 transition-colors border border-white/20"
                >
                    Logout
                </button>
            </div>
        </header>

        {#if error}
            <p class="text-red-600 text-center text-sm py-2">{error}</p>
        {/if}

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <slot></slot>
        </main>
    </div>
{:else}
    <p class="text-center text-gray-500 py-12">Loading...</p>
{/if}
<script>
    import { onMount } from 'svelte';
    import { getActiveScholarship } from '$lib/siteData';
    import { branchesOf } from '$lib/branches';

    let branches = [];
    let loading = true;

    onMount(async () => {
        branches = branchesOf(await getActiveScholarship());
        loading = false;
    });
</script>

<div>
    {#if loading}
        <p class="text-center text-gray-500 py-12">Loading...</p>
    {:else}
        <div class="grid">
            {#each branches as { code, name }}
                <a href={`/offline/${code}`} class="grid-item">{name}</a>
            {/each}
        </div>
    {/if}

    
</div>
<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
    }
    .grid-item {
        padding: 10px;
        background-color: #f0f4f8;
        text-align: center;
        text-decoration: none;
        color: #102a43;
        font-weight: 500;
        border: 1px solid #d9e2ec;
        border-radius: 6px;
        transition: background-color 0.2s ease;
    }
    .grid-item:hover {
        background-color: #d9e2ec;
    }
</style>
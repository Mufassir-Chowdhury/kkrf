<script>
    export let data;
</script>

<div>
    <div class="grid">
        {#each Object.entries(data.thana) as [key, value]}
            <a href={`/offline/${key}`} class="grid-item">{value}</a>
        {/each}
    </div>

    
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
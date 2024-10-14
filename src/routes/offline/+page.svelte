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
        background-color: #f0f0f0;
        text-align: center;
        text-decoration: none;
        color: inherit;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
</style>
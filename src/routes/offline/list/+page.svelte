<script>
    import { onMount } from 'svelte';
    import { getFirestore, collection, query, where, getCountFromServer } from 'firebase/firestore';
    import { db } from '$lib/firebase';

    export let data;
    let thanaWithCounts = [];
    let total = 0;
    onMount(async () => {
        
        const countPromises = Object.entries(data.thana).map(async ([key, value]) => {
            const q = query(collection(db, 'offline'), where('branch', '==', key));
            const querySnapshot = await getCountFromServer(q);
            return {
                key,
                value,
                count: querySnapshot.data().count
            };
        });
            const q = query(collection(db, 'offline'));
            const querySnapshot = await getCountFromServer(q);
            
            total = querySnapshot.data().count;
        thanaWithCounts = await Promise.all(countPromises);

});
</script>

<div>
    <h1>Offline Registrations {total}</h1>
    <div class="grid">
        {#each thanaWithCounts as { key, value, count }}
            <a href={`/offline/${key}`} class="grid-item">
                {value}
                <br>
                Count: {count}
            </a>
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
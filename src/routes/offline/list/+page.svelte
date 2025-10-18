<script>
    import { onMount } from 'svelte';
    import { getFirestore, collection, getDocs, query, where, getCountFromServer, orderBy } from 'firebase/firestore';
    import { db } from '$lib/firebase';

    export let data;
    let thanaWithCounts = [];
    let total = 0;
    onMount(async () => {
        
        const countPromises = Object.entries(data.thana).map(async ([key, value]) => {
            const q = query(collection(db, 'offline-2025'), where('branch', '==', key));
            const querySnapshot = await getCountFromServer(q);
            return {
                key,
                value,
                count: querySnapshot.data().count
            };
        });
            const q = query(collection(db, 'offline-2025'));
            const querySnapshot = await getCountFromServer(q);
            
            total = querySnapshot.data().count;
        thanaWithCounts = await Promise.all(countPromises);

});
  async function handleExportCSV() {
    const q = query(
        collection(db, 'offline-2025'),
        orderBy('creationTime', 'desc')
    );
      const querySnapshot = await getDocs(q);
      let registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  if (!registrations || registrations.length === 0) {
    console.warn('No registrations to export');
    return;
  }

  // Collect all unique field names from all registrations
  const allFields = new Set();
  registrations.forEach(reg => {
    Object.keys(reg).forEach(key => allFields.add(key));
  });
  
  const headers = Array.from(allFields);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...registrations.map(reg => 
      headers.map(field => {
        const value = reg[field];
        // Handle missing fields as empty strings
        const fieldValue = value !== undefined && value !== null ? String(value) : '';
        // Escape quotes and wrap in quotes
        return `"${fieldValue.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  // Add BOM for proper Excel UTF-8 encoding
  const BOM = "\uFEFF";
  const csvContentWithBOM = BOM + csvContent;
  
  // Create and download the file
  const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "scholarship_applications.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  }
}
</script>

<div>
    <div class="flex justify-between mb-4">
        <h1>Offline Registrations {total}</h1>
        <div class="space-x-2">
          <a href="/offline">
            <button 
                class="border border-green-500 text-black px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Data Entry Page
              </button>
          </a>
          <a href="/offline/institution-names">
            <button 
                class="border border-green-500 text-black px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Institutions
              </button>
          </a>
            <button 
              on:click={() => handleExportCSV()}
              class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Export CSV
            </button>
          </div>
    </div>
    <div class="grid">
        {#each thanaWithCounts as { key, value, count }}
            <a href={`/offline/${key}/list`} class="grid-item">
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
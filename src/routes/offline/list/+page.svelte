<script>
    import { onMount } from 'svelte';
    import { getFirestore, collection, getDocs, query, where, getCountFromServer, orderBy } from 'firebase/firestore';
    import { db } from '$lib/firebase';

    export let data;
    let thanaWithCounts = [];
    let total = 0;
    onMount(async () => {
        
        const countPromises = Object.entries(data.thana).map(async ([key, value]) => {
            const q = query(collection(db, 'offline'), where('branch', '==', key), orderBy('serial', 'desc'));
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
    async function handleExportCSV() {
    const q = query(
        collection(db, 'offline'),
        orderBy('creationTime', 'desc')
    );
      const querySnapshot = await getDocs(q);
      let registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    const headers = [
      'Serial', 'Institute Type', 'Gender', 'Name', 'Father\'s name', 'Institute',
      'Class', 'Section', 'Class Roll', 'Mobile', 'Present Address', 'Creation Time', 'Branch'
    ];
  
    const csvContent = [
      headers.join(','),
      ...registrations.map(reg => [
    reg.serial,
    reg.institutionType,
		reg.gender,
		reg.name,
		reg.fatherName,
		reg.institution,
		reg.class,
		reg.section,
		reg.classRoll,
		reg.mobile,
		reg.presentAddress,
		reg.creationTime,
        reg.branch,
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    const BOM = "\uFEFF";
    const csvContentWithBOM = BOM + csvContent;
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
    }
  }
</script>

<div>
    <div class="flex justify-between">
        <h1>Offline Registrations {total}</h1>
        <div class="space-x-2">
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
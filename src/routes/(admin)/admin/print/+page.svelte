<script>
    import { onMount } from 'svelte';
    import { loadAllRegistrations } from '../db';
   
    let registrations = [];
    let loading = true;
    let error = null;
    let totalItems = 0;
    onMount(async () => {
        registrations = await loadAllRegistrations();
        totalItems = registrations.length;
        loading = false;
    });

    function printPage() {
        window.print();
    }
</script>

<svelte:head>
  <title>Admin Dashboard - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</title>
</svelte:head>

<style>
    @media print {
        .no-print {
            display: none;
        }
        
        @page {
            size: A4;
            margin: 15mm;
        }
        
        body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
        }
        
        table {
            page-break-inside: auto;
        }
        
        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }
        
        thead {
            display: table-header-group;
        }
    }
    
    @media screen {
        .print-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 15mm;
        }
    }
</style>

{#if loading}
  <div class="flex justify-center items-center h-screen">
    <p class="text-xl">Loading...</p>
  </div>
{:else if error}
  <div class="text-red-500 text-center p-4">
    {error}
  </div>
{:else}
  <div class="print-container">
    <div class="no-print mb-4 text-center">
      <button on:click={printPage} class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded">
        Print List
      </button>
    </div>
    
    <div class="text-center mb-4">
      <h1 class="text-lg font-bold text-teal-700">কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</h1>
      <h2 class="text-sm font-semibold text-gray-700">Registration List</h2>
      <p class="text-xs text-gray-600">Total Registrations: {totalItems}</p>
    </div>
    
    {#if registrations.length === 0}
      <p class="text-center text-gray-500 my-4 text-sm">No registrations found.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-2 py-1 text-left font-semibold">#</th>
              <th class="border border-gray-300 px-2 py-1 text-left font-semibold">Name</th>
              <th class="border border-gray-300 px-2 py-1 text-left font-semibold">Institution</th>
              <th class="border border-gray-300 px-2 py-1 text-left font-semibold">TRXID</th>
              <th class="border border-gray-300 px-2 py-1 text-left font-semibold">Mobile</th>
              <th class="border border-gray-300 px-2 py-1 text-left font-semibold">District</th>
              <th class="border border-gray-300 px-2 py-1 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {#each registrations as registration, i}
              <tr class="hover:bg-gray-50">
                <td class="border border-gray-300 px-2 py-1 text-gray-700">{i + 1}</td>
                <td class="border border-gray-300 px-2 py-1 text-gray-900 font-medium">{registration.name}</td>
                <td class="border border-gray-300 px-2 py-1 text-gray-700">{registration.institution}</td>
                <td class="border border-gray-300 px-2 py-1 text-gray-700">{registration.transactionID}</td>
                <td class="border border-gray-300 px-2 py-1 text-gray-700">{registration.mobile}<br/>{registration.guardianMobile}</td>
                <td class="border border-gray-300 px-2 py-1 text-gray-700">{registration.permanentAddress.district}</td>
                <td class="border border-gray-300 px-2 py-1">
                  <span class={registration.confirmed ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
                    {registration.confirmed ? "✓" : "✗"}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
    
    <div class="mt-4 text-[8px] text-gray-500 text-center">
      <p>Generated on {new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })}</p>
    </div>
  </div>
{/if}
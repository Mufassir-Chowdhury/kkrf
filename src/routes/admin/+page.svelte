<script>
    import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { auth, db } from '$lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, getDoc } from 'firebase/firestore';
import { browser } from '$app/environment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

let registrations = [];
let filteredRegistrations = [];
let searchTerm = '';
let isLoggedIn = false;
let loading = true;
let error = null;
let selectedRegistration = null;

onMount(() => {
  if (browser) {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        goto('/login');
      }
      isLoggedIn = true;
      loading = false;
      await loadRegistrations();
    });

    return () => unsubscribe();
  }
});
async function sendConfirmationSMS(phoneNumber) {
        const url = "https://api.bdbulksms.net/api.php?json";
        const t1 = "59702300401725";
        const t2 = "814840c01d5e52";
        const t3 = "79bac7dda539127ec4a9f539";
        const SMS_API_TOKEN = `${t1}${t2}${t3}`;
        const data = new FormData();
        data.set('token', SMS_API_TOKEN);
        data.set('message', 'আপনার রেজিস্ট্রেশন কনফার্ম হয়েছে। কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৪');
        data.set('to', phoneNumber);

        try {
            const response = await fetch(url, {
                method: "POST",
                body: data
            });
            const result = await response.json();
            console.log('SMS sent successfully:', result);
        } catch (error) {
            console.error('Error sending SMS:', error);
        }
    }
async function loadRegistrations() {
  try {
    loading = true;
    const q = query(collection(db, 'scholarshipApplications'), orderBy('creationTime', 'desc'));
    const querySnapshot = await getDocs(q);
    registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    filterRegistrations();
  } catch (err) {
    console.error("Error loading registrations:", err);
    error = "Failed to load registrations. Please try again.";
  } finally {
    loading = false;
  }
}

function filterRegistrations() {
  filteredRegistrations = registrations.filter(reg => 
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.mobile.includes(searchTerm)
  );
}

function handleSearch() {
  filterRegistrations();
}

async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this registration?')) {
    try {
      await deleteDoc(doc(db, 'scholarshipApplications', id));
      await loadRegistrations();
    } catch (err) {
      console.error("Error deleting registration:", err);
      error = "Failed to delete registration. Please try again.";
    }
  }
}

function handleEdit(id) {
  goto(`/edit-registration/${id}`);
}

async function handleLogout() {
  try {
    await auth.signOut();
    isLoggedIn = false;
    goto('/login');
  } catch (err) {
    console.error("Error signing out:", err);
    error = "Failed to sign out. Please try again.";
  }
}

function handleExportCSV() {
  const headers = [
    'Name', 'Name (English)', 'Father\'s Name', 'Mother\'s Name', 'Institution', 'Class',
    'Section', 'Class Roll', 'Birth Date', 'Religion', 'Mobile', 'Village', 'Post Office',
    'Upazila', 'District', 'Present Address', 'Guardian Name', 'Relation', 'Guardian Mobile',
    'Transaction ID', 'Creation Time'
  ];

  const csvContent = [
    headers.join(','),
    ...registrations.map(reg => [
      reg.name,
      reg.nameEnglish,
      reg.fatherName,
      reg.motherName,
      reg.institution,
      reg.class,
      reg.section,
      reg.classRoll,
      reg.birthDate,
      reg.religion,
      reg.mobile,
      reg.permanentAddress.village,
      reg.permanentAddress.postOffice,
      reg.permanentAddress.upazila,
      reg.permanentAddress.district,
      reg.presentAddress,
      reg.guardianName,
      reg.relation,
      reg.guardianMobile,
      reg.transactionID,
      reg.creationTime
    ].map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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

function handleExportPDF() {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Scholarship Applications", 14, 22);

  const headers = [['Name', 'Institution', 'Class', 'Mobile']];
  const data = filteredRegistrations.map(reg => [
    reg.name,
    reg.institution,
    reg.class,
    reg.mobile
  ]);

  doc.autoTable({
    startY: 30,
    head: headers,
    body: data,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [242, 242, 242] },
  });

  doc.save("scholarship_applications.pdf");
}
function showConfirmationDetails(registration) {
        selectedRegistration = registration;
    }
    async function confirmRegistration(id) {
        try {
            await updateDoc(doc(db, 'scholarshipApplications', id), { confirmed: true });
            const registrationDoc = await getDoc(doc(db, 'scholarshipApplications', id));
            const registrationData = registrationDoc.data();
            await sendConfirmationSMS(registrationData.mobile);
            await loadRegistrations();
            selectedRegistration = null;
        } catch (err) {
            console.error("Error confirming registration:", err);
            error = "Failed to confirm registration. Please try again.";
        }
    }

    async function cancelConfirmation(id) {
        try {
            await updateDoc(doc(db, 'scholarshipApplications', id), { confirmed: false });
            await loadRegistrations();
            selectedRegistration = null;
        } catch (err) {
            console.error("Error canceling confirmation:", err);
            error = "Failed to cancel confirmation. Please try again.";
        }
    }
</script>
<svelte:head>
  <title>Admin Dashboard - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪</title>
</svelte:head>

{#if loading}
  <div class="flex justify-center items-center h-screen">
    <p class="text-xl">Loading...</p>
  </div>
{:else if error}
  <div class="text-red-500 text-center p-4">
    {error}
  </div>
{:else if isLoggedIn}
  <div class="space-y-6 p-6">
    <h1 class="text-3xl font-bold text-center text-teal-700">Admin Dashboard</h1>

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
          on:click={handleExportCSV}
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Export CSV
        </button>
        <button 
          on:click={handleExportPDF}
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Export PDF
        </button>
        <button 
          on:click={handleLogout}
          class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Logout
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
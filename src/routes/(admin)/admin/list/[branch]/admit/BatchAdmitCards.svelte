<script>
  import { getDocs, query, orderBy, where } from 'firebase/firestore';
  import { offlineCol } from '$lib/yearScope';
  import { onMount } from 'svelte';
  import { getScholarship } from '$lib/siteData';
  import { admitCardOf, admitCardTitle, centerNameForRoll } from '$lib/admitCard';
  import { toCanvas, getFontEmbedCSS } from 'html-to-image';
  import { jsPDF } from 'jspdf';

  // 'allRegistrations' will hold the master list from Firestore
  let allRegistrations = [];
  // 'csvData' is now a reactive variable, derived from the master list and filters
  let csvData = [];
  let error = null;
  export let branch;
  export let branchName;
  export let year;

  // --- NEW: State for serial number range ---
  let serialStart = '';
  let serialEnd = '';
  // --- END NEW ---

  let admitCard = admitCardOf(null);
  $: title = admitCardTitle(year);

  onMount(async () => {
    try {
      admitCard = admitCardOf(await getScholarship(String(year)));
    } catch (err) {
      console.error('Error loading admit card settings:', err);
    }
    try {
      const q = query(
        offlineCol(year),
        where('branch', '==', branch),
        where('roll', '!=', null),
        orderBy('serial', 'desc')
      );
      const querySnapshot = await getDocs(q);
      let registrations = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      // Only confirmed registrations get an admit card
      allRegistrations = registrations.filter((r) => r.confirm === true && r.roll);
    } catch (err) {
      console.error('Error loading registrations:', err);
      // Removed 'throw err;' to allow component to render error message
      error = 'Error loading registrations. Please check the console.'; 
    }
  });

  // --- NEW: Reactive declaration to filter data based on serial range ---
  $: csvData = allRegistrations.filter(card => {
    const serial = parseInt(card.serial, 10);
    if (isNaN(serial)) return false; // Ignore cards with invalid serial numbers

    const start = parseInt(serialStart, 10);
    const end = parseInt(serialEnd, 10);

    // Check if it passes the 'start' filter
    // It passes if serialStart is empty (isNaN(start) is true) OR serial is >= start
    const passesStart = !serialStart || isNaN(start) || serial >= start;
    
    // Check if it passes the 'end' filter
    // It passes if serialEnd is empty (isNaN(end) is true) OR serial is <= end
    const passesEnd = !serialEnd || isNaN(end) || serial <= end;

    return passesStart && passesEnd;
  });
  // --- END NEW ---

  // Two admit cards per A4 page
  $: pages = Array.from({ length: Math.ceil(csvData.length / 2) }, (_, i) =>
    csvData.slice(i * 2, i * 2 + 2)
  );

  let pageEls = [];
  let downloading = false;
  let progress = 0;

  async function downloadPDF() {
    if (downloading || pages.length === 0) return;
    downloading = true;
    progress = 0;
    try {
      await document.fonts.ready;
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      const els = pageEls.slice(0, pages.length);
      // Embed the fonts once instead of re-fetching them for every page
      const fontEmbedCSS = await getFontEmbedCSS(els[0]);
      for (let i = 0; i < els.length; i++) {
        // Radio state is a DOM property, which the clone wouldn't carry over
        els[i].querySelectorAll('input[type="radio"]').forEach((r) => r.toggleAttribute('checked', r.checked));
        // Each page is drawn by the browser itself (SVG foreignObject), so the PDF
        // matches the on-screen layout, and nothing can spill onto the next page
        const canvas = await toCanvas(els[i], {
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          fontEmbedCSS,
          style: { margin: '0', boxShadow: 'none' }
        });
        if (i > 0) pdf.addPage('a4', 'p');
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        canvas.width = canvas.height = 0;
        progress = i + 1;
        // Let the browser repaint the progress between pages
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const range = serialStart || serialEnd ? `-${serialStart || 'start'}-${serialEnd || 'end'}` : '';
      pdf.save(`admit-cards-${branch}-${year}${range}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      downloading = false;
    }
  }
</script>

{#if error}
  <div class="error">
    {error}
  </div>
{/if}
<div class="print:hidden w-full flex justify-center items-center flex-wrap">
  <div class="toggle-container">
    <button
      class="m-8 bg-primary-900 rounded-md text-white px-4 py-2 hover:bg-primary-800 transition-colors shadow-card disabled:opacity-60 disabled:cursor-not-allowed"
      on:click={downloadPDF}
      disabled={downloading || pages.length === 0}
    >
      {#if downloading}
        PDF তৈরি হচ্ছে... ({progress}/{pages.length})
      {:else}
        Download PDF
      {/if}
    </button>
  </div>

  <div class="flex items-center space-x-2 bg-gray-100 p-4 rounded-lg m-4">
    <label for="serialStart" class="font-medium">সিরিয়াল রেঞ্জ:</label>
    <input
      id="serialStart"
      type="number"
      bind:value={serialStart}
      placeholder="শুরু"
      class="border rounded px-2 py-1 w-24"
    />
    <span>-</span>
    <input
      id="serialEnd"
      type="number"
      bind:value={serialEnd}
      placeholder="শেষ"
      class="border rounded px-2 py-1 w-24"
    />
  </div>
  </div>
<div class="print:hidden mb-4">
  - মোট {csvData.length} টি এডমিট কার্ড, {pages.length} টি A4 পেজ (প্রতি পেজে ২ টি এডমিট কার্ড)।<br />
  - PDF তৈরি হওয়া পর্যন্ত এই পেজ বন্ধ করবেন না। কার্ড বেশি হলে কিছুটা সময় লাগতে পারে।<br />
  - ডাউনলোড করা PDF সরাসরি A4 পেজে প্রিন্ট করুন (Scale: 100% / Actual size)।<br />
</div>
<div class="pages">
  {#each pages as pageCards, pageIndex}
    <div class="a4-page" bind:this={pageEls[pageIndex]}>
        {#each pageCards as card}
          <div class="admit-card">

            <div class="bg-white text-sm">
              <div class="bg-primary-800 text-white p-2 text-center mb-3 w-full flex justify-between">
                <div class="flex-1">
                  <p>বৃত্তি রোল</p>
                  <div class="border mx-16 font-bold bg-slate-400">{card.roll}</div>
                </div>
                <div class="flex-1">
                  <h1 class="text-xl font-bold">{title}</h1>
                  <p class="text-sm border-2 rounded-full">প্রবেশপত্র</p>
                </div>
                <div class="flex-1"></div>
              </div>
  
              <div class="w-full">
                <div class="grid grid-cols-4">
                  <div class="mb-2 col-span-2">
                    <p class="text-gray-600">পরীক্ষার্থীর নাম</p>
                    <p class="font-semibold">{card.name}</p>
                  </div>
                  <div class="mb-2">
                    <p class="text-gray-600">পিতার নাম</p>
                    <p class="font-semibold">{card.fatherName}</p>
                  </div>
                  <div class="mb-2">
                    <p class="text-gray-600">মোবাইল</p>
                    <p class="font-semibold">{card.mobile}</p>
                  </div>
                  <div class="mb-2 col-span-2">
                    <p class="text-gray-600">প্রতিষ্ঠানের নাম</p>
                    <p class="font-semibold">{card.institution}</p>
                  </div>
                  <div class="mb-2">
                    <p class="text-gray-600">শ্রেণি</p>
                    <p class="font-semibold">{card.class}</p>
                  </div>
                  <div class="mb-2">
                    <div class="w-1/2">
                      <label class="block text-sm font-medium text-gray-700"></label>
                      <div class="flex space-x-4">
                        <label class="inline-flex items-center">
                          <input
                            type="radio"
                            value="male"
                            checked={card.gender == 'male' ? true : false}
                            required
                            class="form-radio"
                          />
                          <span class="ml-2">ছাত্র</span>
                        </label>
                        <label class="inline-flex items-center">
                          <input
                            type="radio"
                            value="female"
                            checked={card.gender == 'female' ? true : false}
                            required
                            class="form-radio"
                          />
                          <span class="ml-2">ছাত্রী</span>
                        </label>
                      </div>
                    </div>
                    <div class="w-1/2">
                      <label class="block text-sm font-medium text-gray-700"></label>
                      <div class="flex space-x-4">
                        <label class="inline-flex items-center">
                          <input
                            type="radio"
                            value="male"
                            checked={card.institutionType == 'school' ? true : false}
                            required
                            class="form-radio"
                          />
                          <span class="ml-2">স্কুল</span>
                        </label>
                        <label class="inline-flex items-center">
                          <input
                            type="radio"
                            value="female"
                            checked={card.institutionType == 'school' ? false : true}
                            required
                            class="form-radio"
                          />
                          <span class="ml-2">মাদরাসা</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <div class="text-sm border-2 border-primary-800">
                <div class="text-lg font-semibold text-primary-800 flex justify-between">
                  <div>পরীক্ষার কেন্দ্রঃ</div>
                  <div>
                    {centerNameForRoll(admitCard, card.roll)}
                  </div>
                  <div></div>
                </div>
                <div class="w-full bg-primary-800 text-center text-white">পরীক্ষার সময়সূচী</div>
                <div
                  class="grid text-xs divide-x-2 divide-primary-800 text-center"
                  style="grid-template-columns: repeat({admitCard.sessions.length + 1}, minmax(0, 1fr));"
                >
                  <div>
                    {admitCard.date} <br /> {admitCard.day}
                  </div>
                  {#each admitCard.sessions as session}
                    <div class="divide-y-2 divide-primary-800">
                      <div>{session.time}</div>
                      <div>{session.subjects}</div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
            <div class="flex flex-col justify-around bg-white text-sm px-4 pt-2">
              <div>
                <div class="text-center text-lg">পরীক্ষা সংক্রান্ত নিয়মাবলী</div>
                <div>
                  {#each admitCard.rules as rule}
                    - {rule}<br />
                  {/each}
                </div>
              </div>
              <div class="text-primary-800">
                <span>ঠিকানাঃ {card.presentAddress}</span>
              </div>
              <div class="mt-2 flex justify-between">
                <div class=" mx-4 border-2 border-primary-800 pt-2 px-8">
                  <div>
                    <div class="font-semibold">অফিস কর্তৃক পূরণীয়</div>
                    <div>শাখাঃ {branchName} ({card.ward ?? ''})</div>
                    <div>সিরিয়ালঃ {card.serial}</div>
                  </div>
                </div>
                <div class="text-center relative">
                  <img src="/sign.png" alt="" srcset="" class="left-4 h-20 w-30 absolute" />
                  <div class="w-40 h-10 border-b-2 border-gray-400 mt-8"></div>
                  <p class="mt-1">পরিচালকের স্বাক্ষর</p>
                </div>
              </div>
            </div>
          </div>
        {/each}
    </div>
  {/each}
</div>

<style>
  .pages {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8mm;
    padding-bottom: 8mm;
  }
  .a4-page {
    /* Exactly one A4 sheet; each page is captured separately into the PDF */
    width: 210mm;
    height: 297mm;
    box-sizing: border-box;
    overflow: hidden;
    flex-shrink: 0;
    background-color: white;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  }
  .error {
    color: red;
    margin: 10px 0;
    padding: 10px;
    background-color: #fff0f0;
    border-radius: 4px;
  }

  .admit-card {
    /* Half of A4 height, padding included, so two cards always fit */
    height: 148.5mm;
    box-sizing: border-box;
    padding: 4mm 7mm;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>

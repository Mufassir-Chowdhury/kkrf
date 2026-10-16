<script>
  import { onMount } from 'svelte';
  import { getActiveScholarship } from '$lib/siteData';
  import { admitCardOf, admitCardTitle } from '$lib/admitCard';

  let year = null;
  let admitCard = admitCardOf(null);
  let centerNumber = admitCard.centers[admitCard.centers.length - 1]?.number ?? '';

  onMount(async () => {
    const scholarship = await getActiveScholarship();
    year = scholarship?.id || null;
    admitCard = admitCardOf(scholarship);
    centerNumber = admitCard.centers[admitCard.centers.length - 1]?.number ?? '';
  });

  $: centerName = admitCard.centers.find((c) => String(c.number) === String(centerNumber))?.name || '';
</script>

<div class="print:hidden w-full flex justify-center items-center flex-wrap gap-4 my-8">
  <select bind:value={centerNumber} class="border border-gray-300 rounded-md p-3" aria-label="পরীক্ষার কেন্দ্র">
    {#each admitCard.centers as c}
      <option value={c.number}>{c.number} — {c.name}</option>
    {/each}
  </select>
  <button
    class="bg-primary-900 text-white py-3 px-8 rounded-md hover:bg-primary-800 transition-colors text-lg font-semibold shadow-card"
    on:click={() => window.print()}>
    প্রিন্ট করুন
  </button>
</div>
<p class="text-center text-gray-500 print:hidden mb-8">*প্রিন্ট করার সময় ব্যাকগ্রাউন্ড গ্রাফিক্স অপশনটি চালু রাখুন।</p>

  <div class="a4-page">
    <!-- Admit Card 1 -->
    <div class="admit-card">
      <div class="bg-white text-sm">
        <div class="bg-primary-800 text-white p-2 text-center mb-3 w-full flex justify-between">
          <div class="flex-1">
            <p>বৃত্তি রোল</p>
            <div class="border mx-8 font-bold bg-white mt-2 py-4"></div>
          </div>
          <div class="flex-1">
            <h1 class="text-xl font-bold">{year ? admitCardTitle(year) : ''}</h1>
            <p class="text-sm border-2 rounded-full mt-2 pb-2">প্রবেশপত্র</p>
          </div>
          <div class="flex-1"></div>
        </div>

        <div class="w-full px-2">
          <div class="grid grid-cols-5 gap-y-2 gap-x-4">
            <div class="mb-2 col-span-5">
              <p class="text-gray-600">পরীক্ষার্থীর নাম</p>
              <p class="font-semibold border border-primary-300 w-full h-12 rounded-md"></p>
            </div>
            <div class="mb-2 col-span-3">
              <p class="text-gray-600">পিতার নাম</p>
              <p class="font-semibold border border-primary-300 w-full h-12 rounded-md"></p>
            </div>
            <div class="mb-2 col-span-2">
              <p class="text-gray-600">মোবাইল</p>
              <p class="font-semibold border border-primary-300 w-full h-12 rounded-md"></p>
            </div>
            <div class="mb-2 col-span-3">
              <p class="text-gray-600">প্রতিষ্ঠানের নাম</p>
              <p class="font-semibold border border-primary-300 w-full h-12 rounded-md"></p>
            </div>
            <div class="mb-2">
              <p class="text-gray-600">শ্রেণি</p>
              <p class="font-semibold border border-primary-300 w-full h-12 rounded-md"></p>
            </div>
            <div class="mb-2">
              <div class="w-full mb-2">
                <div class="flex space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      value="male"
                      required
                      class="form-radio"
                    />
                    <span class="ml-2">ছাত্র</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      value="female"
                      required
                      class="form-radio"
                    />
                    <span class="ml-2">ছাত্রী</span>
                  </label>
                </div>
              </div>
              <div class="w-full">
                <div class="flex space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      value="school"
                      required
                      class="form-radio"
                    />
                    <span class="ml-2">স্কুল</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      value="madrasa"
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

        <div class="text-sm border-2 border-primary-800 mt-2">
          <div class="text-lg font-semibold text-primary-800 flex justify-between px-2 py-1 pb-2">
            <div>পরীক্ষার কেন্দ্রঃ</div>
            <div>
              {centerName}
            </div>
            <div></div>
          </div>
          <div class="w-full bg-primary-800 text-center text-white py-1 pb-2">পরীক্ষার সময়সূচী</div>
          <div
            class="grid text-xs divide-x-2 divide-primary-800 text-center"
            style="grid-template-columns: repeat({admitCard.sessions.length + 1}, minmax(0, 1fr));"
          >
            <div class="py-2">
              {admitCard.date} <br /> {admitCard.day}
            </div>
            {#each admitCard.sessions as session}
              <div class="divide-y-2 divide-primary-800">
                <div class="py-1">{session.time}</div>
                <div class="py-1">{session.subjects}</div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions Card -->
    <div class="admit-card mt-2">
      <div class="flex flex-col justify-around bg-white text-sm p-4 h-full">
        <div>
          <div class="text-center text-lg font-bold mb-3">পরীক্ষা সংক্রান্ত নিয়মাবলী</div>
          <div class="space-y-1 text-sm">
            {#each admitCard.rules as rule}
              <div>- {rule}</div>
            {/each}
          </div>
        </div>
        <div class="text-primary-800 my-3">
          <span class="font-semibold">ঠিকানাঃ</span> 
                        <p class="font-semibold border border-primary-300 w-full h-12 rounded-md"></p>

        </div>
        <div class="mt-4 flex justify-between items-end">
          <div class="mx-4 border-2 border-primary-800 pt-2 px-8 pb-2">
            <div>
              <div class="font-semibold">অফিস কর্তৃক পূরণীয়</div>
              <div>সিরিয়ালঃ XXXXXX</div>
            </div>
          </div>
          <div class="text-center relative">
            <img src="/sign.png" alt="" class="left-4 h-20 w-30 absolute" />
            <div class="w-40 h-10 border-b-2 border-gray-400 mt-8"></div>
            <p class="mt-1">পরিচালকের স্বাক্ষর</p>
          </div>
        </div>
      </div>
    </div>
  </div>

<style>
  .a4-page {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm;
    margin: 0 auto;
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .admit-card {
    height: 138mm;
    display: flex;
    flex-direction: column;
  }

  @media print {
    .a4-page {
      width: 210mm;
      min-height: 297mm;
      padding: 4mm;
      margin: 0;
    }
    @page {
      size: A4;
      margin: 0;
    }
  }
</style>
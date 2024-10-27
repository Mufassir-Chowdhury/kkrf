<script>
  import { onMount } from 'svelte';
import Papa from 'papaparse';
import { page } from '$app/stores';
let admitCardInfo = null;
let csvData = [];
let thana = {
      1: 'কোতোয়ালী পূর্ব',
      2: 'কোতোয়ালী পশ্চিম',
      3: 'শাহপরান পূর্ব',
      4: 'শাহপরান পশ্চিম',
      5: 'দক্ষিণ সুরমা পূর্ব',
      6: 'দক্ষিণ সুরমা পশ্চিম',
      7: 'বিমানবন্দর',
      8: 'বুরহান উদ্দিন',
      9: 'জালালাবাদ',
      10: 'এমসি কলেজ',
      11: 'মেডিকেল কলেজ',
      12: 'মদন মোহন কলেজ',
      13: 'সরকারি কলেজ',
      14: 'আলিয়া মাদরাসা',
      15: 'পাঠানটুলা জামেয়া',
      16: 'কৃষি বিশ্ববিদ্যালয়',
      17: 'প্রাইভেট বিশ্ববিদ্যালয়',
      18: 'প্রাইভেট মেডিকেল',
      19: 'কলেজ বিভাগ',
      20: 'স্কুল বিভাগ',
      21: 'মিরাবাজার',
      22: 'সিলেট পলিটেকনিক',
      23: 'দক্ষিণ সুরমা কলেজ',
      24: 'শিশুকল্যান',
      25: 'দিশারী',
      26: 'ইংলিশ মিডিয়াম',
      27: 'কোচিং',
      28: 'কওমি পরিষদ',
      31: 'পপি লাইব্রেরি',
      32: 'স্বাধীনতা লাইব্রেরি',
      33: 'ফ্রেন্ডস লাইব্রেরি',
      34: 'প্রভিন্সিয়াল লাইব্রেরি',
      41: 'নিউক্লিয়াস (মদিনা মার্কেট)',
      42: 'নিউক্লিয়াস (লামাবাজার)',
      43: 'নিউক্লিয়াস (শিবগঞ্জ)',
      99: 'অনলাইন',
  }
  onMount(async () => {
    try {
      const csvResponse = await fetch('/Roll.csv');
      const csvText = await csvResponse.text();
      Papa.parse(csvText, {
        header: true,
        complete: (result) => {
          csvData = result.data;
          const roll = Number($page.params.roll);
          const mobile = Number($page.url.searchParams.get("challenge"));
          admitCardInfo = csvData.find((card) => card.Roll == Number(roll) && Number(card.Mobile == mobile));
          console.log('CSV Data:', admitCardInfo);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
    } catch (error) {
      console.error('Error fetching CSV:', error);
    }
  });
</script>
<div class="print:hidden w-full flex justify-center">
  <button class="m-8 bg-black rounded-lg text-white px-4 py-2" on:click={() => window.print()}>
    Print
  </button>
</div>
<div class="text-center print:hidden">*Enable background color while printing</div>

{#if admitCardInfo}
<div>
    <div class="a4-page flex flex-col justify-around px-8">
      <h1 class="text-center text-2xl">Online Copy</h1>
      <div class="flex flex-col">
          <div class="admit-card bg-white  text-sm">
            <div class="bg-blue-400 text-white p-2 text-center mb-3 w-full flex justify-between">
              <div class="flex-1">
                  <p>বৃত্তি রোল</p>
                  <div class="border mx-16 font-bold bg-slate-400">{admitCardInfo.Roll}</div>
              </div>
              <div class="flex-1">
                  <h1 class="text-xl font-bold">কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৪</h1>
                  <p class="text-sm border-2 rounded-full">প্রবেশপত্র</p>
              </div>
              <div class="flex-1"></div>
            </div>
            
            <div class="w-full ">
              <div class="grid grid-cols-4">
                <div class="mb-2 col-span-2">
                  <p class="text-gray-600">পরীক্ষার্থীর নাম</p>
                  <p class="font-semibold">{admitCardInfo.Name}</p>
                </div>
                <div class="mb-2">
                  <p class="text-gray-600">পিতার নাম</p>
                  <p class="font-semibold">{admitCardInfo['Father\'s name']}</p>
                </div>
                <div class="mb-2">
                  <p class="text-gray-600">মোবাইল</p>
                  <p class="font-semibold">0{admitCardInfo.Mobile}</p>
                </div>
                <div class="mb-2 col-span-2">
                  <p class="text-gray-600">প্রতিষ্ঠানের নাম</p>
                  <p class="font-semibold">{admitCardInfo.Institute}</p>
                </div>
                <div class="mb-2">
                  <p class="text-gray-600">শ্রেণি</p>
                  <p class="font-semibold">{admitCardInfo.Class}</p>
                </div>
                <div class="mb-2">
                  <div class="w-1/2">
                      <label class="block text-sm font-medium text-gray-700"></label>
                      <div class="flex space-x-4">
                        <label class="inline-flex items-center">
                          <input type="radio" value="male" checked={admitCardInfo.Gender == "male" ? true : false} required class="form-radio">
                          <span class="ml-2">ছাত্র</span>
                        </label>
                        <label class="inline-flex items-center">
                          <input type="radio" value="female" checked={admitCardInfo.Gender == "female" ? true : false} required class="form-radio">
                          <span class="ml-2">ছাত্রী</span>
                        </label>
                      </div>
                    </div>
                    <div class="w-1/2">
                      <label class="block text-sm font-medium text-gray-700"></label>
                      <div class="flex space-x-4">
                        <label class="inline-flex items-center">
                          <input type="radio" value="male" checked={admitCardInfo['Institute Type'] == "school" ? true : false} required class="form-radio">
                          <span class="ml-2">স্কুল</span>
                        </label>
                        <label class="inline-flex items-center">
                          <input type="radio" value="female" checked={admitCardInfo['Institute Type'] == "school" ? false : true} required class="form-radio">
                          <span class="ml-2">মাদরাসা</span>
                        </label>
                      </div>
                    </div>
                </div>
              </div>
              
            </div>
            
            <div class="text-sm border-2 border-blue-400">
              <div class="text-lg font-semibold text-blue-400 flex justify-between">
                  <div>
                      পরীক্ষার কেন্দ্রঃ 
                  </div>
                  <div>
                      {admitCardInfo.Center}
                  </div>
                  <div></div>
              </div>
              <div class="w-full bg-blue-400 text-center text-white border-b-2 border-t-2 border-blue-400">
                  পরীক্ষার সময়সূচী
              </div>
              <div class="grid grid-cols-3 text-xs divide-x-2 divide-blue-400 text-center ">
                  <div>
                      ২ নভেম্বর, ২০২৪ <br> শনিবার
                  </div>
                  <div class="divide-y-2 divide-blue-400">
                      <div>
                          ৯:৩০-১০:৫০
                      </div>
                      <div>
                          বাংলা ও ইংরেজি
                      </div>
                  </div>
                  <div class="divide-y-2 divide-blue-400">
                      <div>
                          ১১:০০-১২:০০
                      </div>
                      <div>
                          গণিত ও সাধারণ জ্ঞান/সাধারণ বিজ্ঞান
                      </div>
                  </div>
              </div>
            </div>
            
          </div>
      </div>
      <div class="flex flex-col">
          <div class="admit-card flex flex-col justify-around bg-white  text-sm p-4">
            <div>
              <div class="text-center text-lg">
                পরীক্ষা সংক্রান্ত নিয়মাবলী
              </div>
              <div>
                - প্রবেশপত্র ব্যতিত কোন পরীক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে না। <br>
                - প্রত্যেক পরীক্ষার্থী প্রয়োজনীয় ক্যালকুলেটর, কলম ও জ্যামিতি বক্স অবশ্যই সাথে আনতে হবে। এছাড়া অতিরিক্ত কাগজ সাথে রাখা যাবে না<br>
              </div>
            </div>
            <div class="text-blue-400">
              <span>ঠিকানাঃ {admitCardInfo['Present Address']}</span>
            </div>
            <div class="mt-4 flex justify-between">
              <div class=" mx-4 border-2 border-blue-400 pt-2 px-8">
                <div>
                  <div class="font-semibold">অফিস কর্তৃক পূরণীয়</div>
                  <div>থানাঃ {thana[admitCardInfo.Branch]}</div>
                  <div>সিরিয়ালঃ {admitCardInfo.Serial}</div>
                </div>
              </div>
              <div class="text-center relative">
                <img src="/sign.png" alt="" srcset="" class="left-4 h-20 w-30 absolute">
                <div class="w-40 h-10 border-b-2 border-gray-400 mt-8"></div>
                <p class="mt-1">পরিচালকের স্বাক্ষর</p>
              </div>
            </div>
          </div>
      </div>
    </div>
</div>
{:else}
আপনার এডমিট কার্ড পাওয়া যায় নি। সমাধানের জন্য আমাদের সাথে যোগাযোগ করুন।
{/if}
<style>
  .a4-page {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm;
    margin: 0 auto;
    background-color: white;
  }

.admit-card {
      height: 74.25mm; /* Approximately 1/4 of A4 height minus some space for margins */
    }
  @media print {

    .a4-page {
      width: 210mm;
      min-height: 297mm;
      padding: 8mm;
      margin: 0;
    }
    @page {
      size: A4;
      margin: 0;
    }
  }

  /* Add any additional print-specific styles here */
</style>
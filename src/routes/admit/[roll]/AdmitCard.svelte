<script>
  import { onMount } from 'svelte';
  import { encodeRoll, decodeHash } from '$lib/hash';

  import { collection, getDocs, query, where } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { page } from '$app/stores';

  let admitCardInfo = null;
  let loading = true;
  let error = null;

  

  const center = {
    1: 'শাহজালাল জামেয়া ইসলামিয়া স্কুল এন্ড কলেজ, মিরাবাজার',
    2: 'শাহজালাল জামেয়া ইসলামিয়া কামিল মাদরাসা, পাঠানটুলা',
    3: 'আল আমিন জামেয়া উচ্চ বিদ্যালয়, মেজরটিলা',
  };
  onMount(async () => {
    try {
      const hash = $page.params.roll; // Now expecting hash instead of roll
      
      if (!hash) {
        error = "হ্যাশ কোড প্রদান করা হয়নি।";
        loading = false;
        return;
      }

      // Decode hash to get roll number
      const roll = decodeHash(hash);
      
      if (!roll) {
        error = "অবৈধ হ্যাশ কোড।";
        loading = false;
        return;
      }

      // Query Firestore using where clause
      const q = query(
        collection(db, 'offline-2025'),
        where('roll', '==', roll)
      );
      
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        admitCardInfo = { id: docSnap.id, ...docSnap.data() };
      } else {
        error = "এই রোল নম্বরের জন্য প্রবেশপত্র পাওয়া যায়নি।";
      }
      
      loading = false;
    } catch (err) {
      console.error('Error fetching admit card:', err);
      error = "প্রবেশপত্র লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
      loading = false;
    }
  });

  // Expose encode function for testing (remove in production or use in a separate admin tool)
  // Example usage in browser console: window.encodeRoll('190001')
  if (typeof window !== 'undefined') {
    window.encodeRoll = encodeRoll;
    window.decodeHash = decodeHash;
  }
</script>

<div class="print:hidden w-full flex justify-center my-8">
  <button class="bg-black text-white py-3 px-8 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 text-lg font-semibold shadow-lg" on:click={() => window.print()}>
    প্রিন্ট করুন
  </button>
</div>
<p class="text-center text-gray-500 print:hidden mb-8">*প্রিন্ট করার সময় ব্যাকগ্রাউন্ড গ্রাফিক্স অপশনটি চালু রাখুন।</p>

{#if loading}
  <div class="text-center p-12">
    <p class="text-lg text-blue-700">লোড হচ্ছে...</p>
  </div>
{:else if error}
  <div class="text-center p-12 bg-red-50 border-l-4 border-red-400">
    <p class="text-lg text-red-700">{error}</p>
    <p class="mt-4">অনুগ্রহ করে সঠিক তথ্য দিয়ে আবার চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন।</p>
  </div>
{:else if admitCardInfo}
  <div class="a4-page">
    <!-- Admit Card 1 -->
    <div class="admit-card">
      <div class="bg-white text-sm">
        <div class="bg-blue-400 text-white p-2 text-center mb-3 w-full flex justify-between">
          <div class="flex-1">
            <p>বৃত্তি রোল</p>
            <div class="border mx-16 font-bold bg-slate-400">{admitCardInfo.roll}</div>
          </div>
          <div class="flex-1">
            <h1 class="text-xl font-bold">কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৫</h1>
            <p class="text-sm border-2 rounded-full">প্রবেশপত্র</p>
          </div>
          <div class="flex-1"></div>
        </div>

        <div class="w-full px-2">
          <div class="grid grid-cols-4 gap-2">
            <div class="mb-2 col-span-2">
              <p class="text-gray-600">পরীক্ষার্থীর নাম</p>
              <p class="font-semibold">{admitCardInfo.name}</p>
            </div>
            <div class="mb-2">
              <p class="text-gray-600">পিতার নাম</p>
              <p class="font-semibold">{admitCardInfo.fatherName}</p>
            </div>
            <div class="mb-2">
              <p class="text-gray-600">মোবাইল</p>
              <p class="font-semibold">{admitCardInfo.mobile}</p>
            </div>
            <div class="mb-2 col-span-2">
              <p class="text-gray-600">প্রতিষ্ঠানের নাম</p>
              <p class="font-semibold">{admitCardInfo.institution}</p>
            </div>
            <div class="mb-2">
              <p class="text-gray-600">শ্রেণি</p>
              <p class="font-semibold">{admitCardInfo.class}</p>
            </div>
            <div class="mb-2">
              <div class="w-full mb-2">
                <div class="flex space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      value="male"
                      checked={admitCardInfo.gender == 'male' ? true : false}
                      required
                      class="form-radio"
                    />
                    <span class="ml-2">ছাত্র</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      value="female"
                      checked={admitCardInfo.gender == 'female' ? true : false}
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
                      checked={admitCardInfo.institutionType == 'school' ? true : false}
                      required
                      class="form-radio"
                    />
                    <span class="ml-2">স্কুল</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      value="madrasa"
                      checked={admitCardInfo.institutionType == 'school' ? false : true}
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

        <div class="text-sm border-2 border-blue-400 mt-2">
          <div class="text-lg font-semibold text-blue-400 flex justify-between px-2 py-1">
            <div>পরীক্ষার কেন্দ্রঃ</div>
            <div>
              {center[admitCardInfo.roll[0]]}
            </div>
            <div></div>
          </div>
          <div class="w-full bg-blue-400 text-center text-white py-1">পরীক্ষার সময়সূচী</div>
          <div class="grid grid-cols-3 text-xs divide-x-2 divide-blue-400 text-center">
            <div class="py-2">
              ১ নভেম্বর, ২০২৫ <br /> শনিবার
            </div>
            <div class="divide-y-2 divide-blue-400">
              <div class="py-1">১০:০০-১১:০০</div>
              <div class="py-1">বাংলা ও ইংরেজি</div>
            </div>
            <div class="divide-y-2 divide-blue-400">
              <div class="py-1">১১:১০-১২:১০</div>
              <div class="py-1">গণিত ও সাধারণ জ্ঞান/সাধারণ বিজ্ঞান</div>
            </div>
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
            <div>- প্রবেশপত্র ব্যতিত কোন পরীক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে না।</div>
            <div>- প্রত্যেক পরীক্ষার্থী প্রয়োজনীয় ক্যালকুলেটর, কলম ও জ্যামিতি বক্স অবশ্যই সাথে আনতে হবে। এছাড়া অতিরিক্ত কাগজ সাথে রাখা যাবে না।</div>
            <div>- পরীক্ষার হলে মোবাইল ফোন ও ইলেকট্রনিক ডিভাইস আনা সম্পূর্ণ নিষিদ্ধ।</div>
            <div>- পরীক্ষা শুরুর ১৫ মিনিট পূর্বে আসন গ্রহণ করতে হবে।</div>
            <div>- উত্তরপত্রে রোল নম্বর ও অন্যান্য তথ্য সঠিকভাবে পূরণ করতে হবে।</div>
          </div>
        </div>
        <div class="text-blue-400 my-3">
          <span class="font-semibold">ঠিকানাঃ</span> {admitCardInfo.presentAddress}
        </div>
        <div class="mt-4 flex justify-between items-end">
          <div class="mx-4 border-2 border-blue-400 pt-2 px-8 pb-2">
            <div>
              <div class="font-semibold">অফিস কর্তৃক পূরণীয়</div>
              <div>সিরিয়ালঃ {admitCardInfo.serial}</div>
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
{/if}

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
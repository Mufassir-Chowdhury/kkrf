<script>
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
  
    let mounted = false;
  
    onMount(() => {
      mounted = true;
    });
  
    const examRules = [
      "৪র্থ, ৫ম, ৬ষ্ঠ, ৭ম, ৮ম, ৯ম ও ১০ম শ্রেণির ছাত্র-ছাত্রী (স্কুল-মাদরাসা) বৃত্তি পরীক্ষায় অংশগ্রহণ করতে পারবে।",
      "সিলেট বিভাগের যে কোন স্কুল-মাদরাসার ছাত্র-ছাত্রী পরীক্ষায় অংশগ্রহণ করতে পারবে।",
      "৬ষ্ঠ থেকে ১০ম শ্রেণির জন্য (MCQ পদ্ধতিতে) বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান বিষয়ে (প্রত্যেক বিষয়ে ৫০ নম্বর করে) সর্বমোট ২০০ নম্বরের পরীক্ষা অনুষ্ঠিত হবে।",
      "৪র্থ ও ৫ম শ্রেণির জন্য (MCQ পদ্ধতিতে) বাংলা, ইংরেজি, গণিত ও সাধারণ বিজ্ঞান বিষয়ে (প্রত্যেক বিষয়ে ৫০ নম্বর করে) সর্বমোট ২০০ নম্বরের পরীক্ষা অনুষ্ঠিত হবে।",
      "পরীক্ষার তারিখ: ০২ নভেম্বর ২০২৪, শনিবার (সম্ভাব্য)।",
      "রেজিস্ট্রেশন ফরম সংগ্রহ ও জমাদানের সময়সীমা ০৬ সেপ্টেম্বর থেকে ১৫ অক্টোবর'২৪।",
      "প্রয়োজনে পরীক্ষার তারিখ পরিবর্তন হতে পারে।",
      "ট্যালেন্টপুল, সাধারণ ও বিশেষ এই তিনটি গ্রেডে বৃত্তিপ্রাপ্ত ছাত্র-ছাত্রীদের এককালীন শিক্ষা ব্যয় বাবদ নগদ অর্থ, সনদপত্র ও আকর্ষণীয় পুরষ্কার প্রদান করা হবে।",
      "৪র্থ থেকে ১০ম শ্রেণি পর্যন্ত সকল রেজিস্ট্রেশন ফি ২০০/- (দুইশত টাকা)।"
    ];

    const offices = [
      {
        name: "পপি লাইব্রেরি",
        address: "রাজা ম্যানশন, জিন্দাবাজার",
        phone: "০১৭৫২৮৩১১৮৪"
      },
      {
        name: "স্বাধীনতা লাইব্রেরি",
        address: "শাহজালাল জামেয়ার পাশে, মদিনা মার্কেট",
        phone: "০১৭৫২৮৩১১৮৪"
      },
      {
        name: "সৌম্য এন্টারপ্রাইজ",
        address: "ব্লু-বার্ড জুনিয়র স্কুলের বিপরীতে, মিরের ময়দান",
        phone: "০১৯৭৩৮৮১৪৯৮"
      },
      {
        name: "ইফরাজ সাইন প্রিন্টার্স",
        address: "পাইলট স্কুলের পেছনের গেইট, নিউ মার্কেট, লালদিঘীরপাড়",
        phone: "০১৩০৬৩১৮৭৭৩"
      },
      {
        name: "প্রভিন্সিয়াল লাইব্রেরি",
        address: "আহমদ ম্যানশন, জিন্দাবাজার",
        phone: "০১৭৫২৮৩১১৮৪"
      },
      {
        name: "মনোরম লাইব্রেরি",
        address: "ইবনে সিনার পাশে, রিকাবীবাজার",
        phone: "০১৯০৮৩০৩৮২৬"
      },
      {
        name: "ফ্রেন্ডস লাইব্রেরি",
        address: "আম্বরখানা গার্লস এর বিপরীতে, হাউজিং স্টেট",
        phone: "০১৭৫২৮৩১১৮৪"
      }
    ]
  </script>
  
  <svelte:head>
    <title>মেধাবৃত্তি পরীক্ষা ২০২৪ - কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
  </svelte:head>
  
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-center text-teal-700">
      কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪
    </h1>
    
    <div class="bg-gradient-to-r from-teal-500 to-amber-500 text-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-4 text-center">৪র্থ-১০ম শ্রেণী, স্কুল এবং মাদরাসা</h2>
      <p class="text-lg text-center font-semibold">
        সিলেট বিভাগের যে কোন স্কুল-মাদরাসার ছাত্র-ছাত্রী পরীক্ষায় অংশগ্রহণ করতে পারবে। 
      </p>
    </div>
  
    {#if mounted}
        <div in:fly="{{ y: 50, duration: 500, delay: 200 }}" class="bg-amber-100 p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-teal-700 mb-4">বৃত্তি প্রদান</h3>
        <p class="text-lg font-bold text-center text-red-600">
          বৃত্তি প্রাপ্তদের মাঝে ৬,০০,০০০ (ছয় লক্ষ) টাকার বৃত্তি প্রদান করা হবে।
        </p>
      </div>
      <div in:fly="{{ y: 50, duration: 500 }}" class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-teal-700 mb-4">বৃত্তি সম্পর্কিত তথ্য</h3>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          {#each examRules as rule}
            <li>{rule}</li>
          {/each}
        </ul>
      </div>
  
      
  
      <div in:fly="{{ y: 50, duration: 500, delay: 400 }}" class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-teal-700 mb-4">বিশেষ দ্রষ্টব্য</h3>
        <p class="text-gray-700 mb-4">
          সাধারণ জ্ঞানের জন্য (জানুয়ারি-আগস্ট'২৪) কিশোরকণ্ঠ এবং বিশেষ সংকলন "অন্বেষণ" সংগ্রহ করতে হবে।
        </p>
      </div>
      <div in:fly="{{ y: 50, duration: 500, delay: 1000 }}" class="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 class="text-xl font-semibold text-teal-700 mb-4">পরীক্ষার সিলেবাস</h3>
        <a href="/medhabritti-2024/syllabus" class="bg-amber-500 text-white py-2 px-4 rounded-md hover:bg-amber-600 transition-colors">
          সিলেবাস দেখুন
        </a>
      </div>
  
      <div in:fly="{{ y: 50, duration: 500, delay: 600 }}" class="bg-teal-100 p-6 rounded-lg shadow-md text-center">
        <h3 class="text-xl font-semibold text-teal-700 mb-4">রেজিস্ট্রেশন করুন</h3>
        <a href="/britti_registration" class="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors">
          অনলাইনে রেজিস্ট্রেশন করুন
        </a>
        <p class="mt-2 text-sm text-gray-600">
          অথবা স্কুল প্রতিনিধির সাথে যোগাযোগ করুন।
        </p>
      </div>
      <div in:fly="{{ y: 50, duration: 500, delay: 600 }}" class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-teal-700 mb-4 text-center">অফলাইনে ফর্ম প্রাপ্তি ও জমা দেওয়ার ঠিকানা</h3>
        
        {#each offices as office}
          <div class="py-4 border-b">
            <h4 class="text-lg font-semibold text-teal-700">{office.name}</h4>
            <p class="text-gray-700 mb-2">
              {office.address}
            </p>
            <p class="text-gray-700">
              ফোন: {office.phone}
            </p>
          </div>
        {/each}
      </div>
  
      <div in:fly="{{ y: 50, duration: 500, delay: 800 }}" class="bg-amber-50 p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-teal-700 mb-4">যোগাযোগ</h3>
        <p class="text-gray-700 mb-2">
          অফিস: ইউনিভার্সাল কলেজ, ১১২ ইবকো হাউজ, পূর্ব চৌহাট্টা, সিলেট।
        </p>
        <p class="text-gray-700 mb-2">
          ফোন: ০১৭৫২-৮৩১১৮৪, ০১৭০১-৪৫৯৮৮১, ০১৭৭১-১৪৪৩০৮
        </p>
        <p class="text-gray-700">
          অফিস টাইম: বিকাল ৫:০০ থেকে রাত ৮:০০ পর্যন্ত
        </p>
      </div>
    {/if}
  
    <div class="text-sm text-gray-600 text-center">
      আয়োজনে: কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর<br>
      বিস্তারিত তথ্যের জন্য: <a href="http://www.kkrfsylhet.org" class="text-teal-600 hover:underline">www.kkrfsylhet.org</a>
    </div>
  </div>
  
  <style>
    /* Any additional styles can be added here */
  </style>
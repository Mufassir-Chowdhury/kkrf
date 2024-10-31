<script>
    import { page } from '$app/stores';
    let center = $page.params.center;

    let center_name = {
        "alia": "সিলেট সরকারি আলিয়া মাদরাসা, চৌহাট্টা",
        "ptj": "শাহজালাল জামেয়া ইসলামিয়া কামিল মাদরাসা, পাঠানটুলা",
        "alamin": "আল-আমিন জামেয়া ইসলামিয়া উচ্চ বিদ্যালয়, মেজরটিলা"
    }
</script>

<svelte:head>
    <title>মেধাবৃত্তি পরীক্ষা ২০২৪ - কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
</svelte:head>


<div class="space-y-8">
    <h1 class="text-3xl font-bold text-center text-teal-700">
      কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪
    </h1>
    <h3 class="text-xl font-bold text-center text-teal-700">
        সেন্টার - {center_name[center]}
      </h3>
    
    <div class="bg-gradient-to-r from-teal-500 to-amber-500 text-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-4 text-center">পরীক্ষার তারিখ</h2>
      <p class="text-lg text-center font-semibold">
        ২ নভেম্বর, ২০২৪ (শনিবার) 
      </p>
    </div>
      
    <div in:fly="{{ y: 50, duration: 500 }}" class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-teal-700 mb-4">সীট প্লান</h3>
        <img src="/{center}-seatplan.jpg" alt="{center} Seat Plan" class="w-full">
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
  
    <div class="text-sm text-gray-600 text-center">
      আয়োজনে: কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর<br>
      বিস্তারিত তথ্যের জন্য: <a href="http://www.kkrfsylhet.org" class="text-teal-600 hover:underline">www.kkrfsylhet.org</a>
    </div>
  </div>
  
  <style>
    /* Any additional styles can be added here */
  </style>
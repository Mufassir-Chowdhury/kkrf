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
    <title>সীট প্লান - {center_name[center]}</title>
</svelte:head>

<div class="space-y-12">
    <section class="text-center pt-8">
        <h1 class="text-4xl md:text-5xl font-extrabold text-primary-800 mb-4">কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪</h1>
        <h2 class="text-2xl md:text-3xl font-bold text-secondary-700">সেন্টার - {center_name[center]}</h2>
    </section>

    <section class="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 md:p-12 rounded-2xl shadow-xl text-center">
        <h2 class="text-3xl font-bold mb-4">পরীক্ষার তারিখ</h2>
        <p class="text-4xl font-extrabold tracking-tight">২ নভেম্বর, ২০২৪</p>
        <p class="text-xl text-primary-100">(শনিবার)</p>
    </section>
      
    <section class="bg-white rounded-2xl shadow-xl p-4 md:p-6">
        <h3 class="text-3xl font-bold text-primary-700 mb-6 text-center">সীট প্লান</h3>
        <div class="overflow-hidden rounded-lg shadow-md">
            <img src="/{center}.jpg" alt="{center} Seat Plan" class="w-full h-auto object-contain">
        </div>
    </section>
      
    <section class="text-center">
        <h2 class="text-2xl font-bold text-primary-700 mb-4">যোগাযোগ</h2>
        <div class="text-lg text-gray-600">
          <p>অফিস: ইউনিভার্সাল কলেজ, ১১২ ইবকো হাউজ, পূর্ব চৌহাট্টা, সিলেট।</p>
          <p>ফোন: ০১৭৫২-৮৩১১৮৪, ০১৭০১-৪৫৯৮৮১, ০১৭৭১-১৪৪৩০৮</p>
          <p>অফিস টাইম: বিকাল ৫:০০ থেকে রাত ৮:০০ পর্যন্ত</p>
        </div>
    </section>
  
    <div class="text-sm text-gray-500 text-center py-8 border-t">
      আয়োজনে: কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর<br>
      বিস্তারিত তথ্যের জন্য: <a href="http://www.kkrfsylhet.org" class="text-primary-600 hover:underline">www.kkrfsylhet.org</a>
    </div>
</div>
<script>
    import { page } from '$app/stores';
    let center = $page.params.center;

    let center_name = {
        "mirabazar": "শাহজালাল জামেয়া ইসলামিয়া স্কুল এন্ড কলেজ, মিরাবাজার",
        "ptj": "শাহজালাল জামেয়া ইসলামিয়া কামিল মাদরাসা, পাঠানটুলা",
        "alamin": "আল-আমিন জামেয়া ইসলামিয়া উচ্চ বিদ্যালয়, মেজরটিলা"
    }
</script>

<svelte:head>
    <title>সীট প্লান - {center_name[center]}</title>
</svelte:head>

<div class="space-y-12">
    <section class="text-center pt-8">
        <h1 class="text-4xl md:text-5xl font-extrabold text-primary-800 mb-4">কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</h1>
        <h2 class="text-2xl md:text-3xl font-bold text-secondary-700">সেন্টার - {center_name[center]}</h2>
    </section>

    <section class="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 md:p-12 rounded-2xl shadow-xl text-center">
        <h2 class="text-3xl font-bold mb-4">পরীক্ষার তারিখ</h2>
        <p class="text-4xl font-extrabold tracking-tight">১ নভেম্বর, ২০২৫</p>
        <p class="text-xl text-primary-100">(শনিবার)</p>
    </section>
      
    <section class="bg-white rounded-2xl shadow-xl p-4 md:p-6">
        <h3 class="text-3xl font-bold text-primary-700 mb-6 text-center">সীট প্লান</h3>
        <div class="overflow-hidden rounded-lg shadow-md">
            <img src="/{center}.jpg" alt="{center} Seat Plan" class="w-full h-auto object-contain">
        </div>
        <div class="overflow-hidden rounded-lg shadow-md">
            <img src="/{center}-2.jpg" alt="{center} Seat Plan" class="w-full h-auto object-contain">
        </div>
    </section>
      
    <div class="bg-amber-50 p-6 rounded-lg shadow-md">
			<h4 class="text-xl font-semibold text-teal-700 mb-4">যোগাযোগের ঠিকানা:</h4>
			<ul class="space-y-2 text-gray-700">
				<li>০১৩০০২০৮১৮৮ (তৌহিদুল ইসলাম)</li>
				<li>০১৭৮২৮৪৭৪৩৯ (রেজাউল করিম)</li>
				<li>০১৭৭৯০৯৮৬৪৫ (ফাহাদ হুসাইন)</li>
				<li>০১৩০৬৩২১০৫২ (আবুল হাসান রিয়াদ)</li>
			</ul>
		</div>
  
    <div class="text-sm text-gray-500 text-center py-8 border-t">
      আয়োজনে: কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর<br>
      বিস্তারিত তথ্যের জন্য: <a href="http://www.kkrfsylhet.org" class="text-primary-600 hover:underline">www.kkrfsylhet.org</a>
    </div>
</div>
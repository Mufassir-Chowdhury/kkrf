<script>
    const examRules = [
      "৪র্থ, ৫ম, ৬ষ্ঠ, ৭ম, ৮ম, ৯ম ও ১০ম শ্রেণির ছাত্র-ছাত্রী (স্কুল-মাদরাসা) বৃত্তি পরীক্ষায় অংশগ্রহণ করতে পারবে।",
      "সিলেট বিভাগের যে কোন স্কুল-মাদরাসার ছাত্র-ছাত্রী পরীক্ষায় অংশগ্রহণ করতে পারবে।",
      "৬ষ্ঠ থেকে ১০ম শ্রেণির জন্য (MCQ পদ্ধতিতে) বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান বিষয়ে (প্রত্যেক বিষয়ে ৫০ নম্বর করে) সর্বমোট ২০০ নম্বরের পরীক্ষা অনুষ্ঠিত হবে।",
      "৪র্থ ও ৫ম শ্রেণির জন্য (MCQ পদ্ধতিতে) বাংলা, ইংরেজি, গণিত ও সাধারণ বিজ্ঞান বিষয়ে (প্রত্যেক বিষয়ে ৫০ নম্বর করে) সর্বমোট ২০০ নম্বরের পরীক্ষা অনুষ্ঠিত হবে।",
      "পরীক্ষার তারিখ: ০১ নভেম্বর ২০২৫, শনিবার (সম্ভাব্য)।",
      "রেজিস্ট্রেশন ফরম সংগ্রহ ও জমাদানের সময়সীমা ১ আগস্ট থেকে ১৫ অক্টোবর'২৫।",
      "প্রয়োজনে পরীক্ষার তারিখ পরিবর্তন হতে পারে।",
      "ট্যালেন্টপুল, সাধারণ ও বিশেষ এই তিনটি গ্রেডে বৃত্তিপ্রাপ্ত ছাত্র-ছাত্রীদের এককালীন শিক্ষা ব্যয় বাবদ নগদ অর্থ, সনদপত্র ও আকর্ষণীয় পুরষ্কার প্রদান করা হবে।",
      "৪র্থ থেকে ১০ম শ্রেণি পর্যন্ত সকল রেজিস্ট্রেশন ফি ২০০/- (দুইশত টাকা)।"
    ];
</script>

<svelte:head>
  <title>মেধাবৃত্তি পরীক্ষা ২০২৫ - কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
</svelte:head>

<div class="space-y-16">
  <section class="text-center pt-8">
    <h1 class="text-4xl md:text-5xl font-extrabold text-primary-800 mb-4">কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</h1>
  </section>

  <section class="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white p-8 md:p-12 rounded-2xl shadow-xl text-center">
      <h2 class="text-3xl font-bold mb-4">পরীক্ষার তারিখ</h2>
      <p class="text-4xl font-extrabold tracking-tight">
        ১ নভেম্বর, ২০২৫
      </p>
      <p class="text-xl text-secondary-100">(শনিবার)</p>
  </section>

  <section class="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
    <h2 class="text-3xl font-bold text-primary-700 mb-6">এডমিট কার্ড ডাউনলোড করুন</h2>
    <a href="/admit" class="bg-primary-600 text-white py-3 px-8 rounded-full hover:bg-primary-700 transition-colors inline-block text-lg font-semibold shadow-md">
      ডাউনলোড
    </a>
    <p class="mt-4 text-gray-600">
      অথবা আপনার স্কুল প্রতিনিধির সাথে যোগাযোগ করুন।
    </p>
  </section>

  <section class="bg-white rounded-2xl shadow-xl p-8 md:p-12">
    <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">সীট প্লান দেখুন</h2>
    <div class="grid md:grid-cols-3 gap-8">
        <a href="/britti_info/mirabazar" class="block text-center bg-primary-50 hover:bg-primary-100 transition-colors p-8 rounded-lg shadow-md">
            <h3 class="text-2xl font-bold text-primary-800">শাহজালাল জামেয়া ইসলামিয়া স্কুল এন্ড কলেজ, মিরাবাজার</h3>
        </a>
        <a href="/britti_info/ptj" class="block text-center bg-primary-50 hover:bg-primary-100 transition-colors p-8 rounded-lg shadow-md">
            <h3 class="text-2xl font-bold text-primary-800">শাহজালাল জামেয়া ইসলামিয়া কামিল মাদরাসা, পাঠানটুলা</h3>
        </a>
        <a href="/britti_info/alamin" class="block text-center bg-primary-50 hover:bg-primary-100 transition-colors p-8 rounded-lg shadow-md">
            <h3 class="text-2xl font-bold text-primary-800">আল-আমীন জামেয়া স্কুল এন্ড কলেজ, মেজরটিলা</h3>
        </a>
    </div>
  </section>

  <section class="bg-white rounded-2xl shadow-xl p-8 md:p-12">
    <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">বৃত্তি সম্পর্কিত তথ্য</h2>
    <ul class="space-y-4">
      {#each examRules as rule}
        <li class="flex items-start space-x-4">
          <span class="text-primary-500 mt-1 text-xl">✓</span>
          <span class="text-lg text-gray-700">{rule}</span>
        </li>
      {/each}
    </ul>
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

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
        phone: "০১৩০০২০৮১৮৮"
      },
      {
        name: "ঢাকা বুক ডিপো এন্ড স্টেশনারী",
        address: "১নং ঈসমাইল টাওয়ার, ইসলামী ব্যাংকের বিপরীতে, লালদিঘীরপার, সিলেট।",
        phone: "০১৭৮২৮৪৭৪৩৯"
      },
      {
        name: "প্রভিন্সিয়াল লাইব্রেরি",
        address: "আহমদ ম্যানশন, জিন্দাবাজার",
        phone: "০১৭৫২৮৩১১৮৪"
      },
      {
        name: "মনোরম লাইব্রেরি",
        address: "ইবনে সিনার পাশে, রিকাবীবাজার",
        phone: "০১৭৭৯০৯৮৬৪৫"
      },
      {
        name: "ফ্রেন্ডস লাইব্রেরি",
        address: "আম্বরখানা গার্লস এর বিপরীতে, হাউজিং স্টেট",
        phone: "০১৭৫২৮৩১১৮৪"
      }
    ]
</script>

<svelte:head>
  <title>মেধাবৃত্তি পরীক্ষা ২০২৫ - কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
</svelte:head>

<div class="space-y-16">
  <section class="text-center pt-8">
    <h1 class="text-4xl md:text-5xl font-extrabold text-primary-800 mb-4">কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</h1>
    <p class="text-xl md:text-2xl text-secondary-700">৪র্থ-১০ম শ্রেণী, স্কুল এবং মাদরাসা</p>
  </section>

  <!-- <section class="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
    <h2 class="text-3xl font-bold text-primary-700 mb-6">সীটপ্লান এবং এডমিট কার্ড</h2>
    <a href="/britti_info" class="bg-secondary-500 text-white py-3 px-8 rounded-full hover:bg-secondary-600 transition-colors inline-block text-lg font-semibold shadow-md">
      এখনই দেখুন
    </a>
  </section> -->

  <section class="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 md:p-12 rounded-2xl shadow-xl text-center">
      <h2 class="text-3xl font-bold mb-4">বৃত্তি প্রদান</h2>
      <p class="text-4xl font-extrabold tracking-tight">
        ৬,৫০,০০০/=
      </p>
      <p class="text-xl text-primary-100">টাকার নগদ অর্থ, সনদপত্র ও আকর্ষণীয় পুরষ্কার</p>
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

  <section class="bg-secondary-50 border-l-4 border-secondary-400 p-8 rounded-r-lg">
      <h3 class="text-2xl font-semibold text-secondary-800 mb-4">বিশেষ দ্রষ্টব্য</h3>
      <p class="text-lg text-secondary-700">
        সাধারণ জ্ঞানের জন্য (জানুয়ারি - জুলাই'২৫) কিশোরকণ্ঠ এবং বিশেষ সংকলন "অন্বেষণ" সংগ্রহ করতে হবে।
      </p>
  </section>

  <section class="text-center">
      <h2 class="text-3xl font-bold text-primary-700 mb-6">পরীক্ষার সিলেবাস</h2>
      <a href="/medhabritti-2025/syllabus" class="bg-primary-600 text-white py-3 px-8 rounded-full hover:bg-primary-700 transition-colors inline-block text-lg font-semibold shadow-md">
        সিলেবাস দেখুন
      </a>
  </section>

  <!-- <section class="bg-gradient-to-r from-teal-500 to-green-500 text-white p-8 md:p-12 rounded-2xl shadow-xl text-center">
    <h2 class="text-3xl font-bold mb-4">এখনই রেজিস্ট্রেশন করুন!</h2>
    <a href="/britti_registration" class="bg-white text-primary-600 py-3 px-8 rounded-full hover:bg-primary-50 transition-colors inline-block text-lg font-semibold shadow-md">
      অনলাইন রেজিস্ট্রেশন
    </a>
    <p class="mt-4 text-primary-100">
      অথবা আপনার স্কুল প্রতিনিধির সাথে যোগাযোগ করুন।
    </p>
  </section> -->

  <section class="bg-white rounded-2xl shadow-xl p-8 md:p-12">
    <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">অফলাইনে ফর্ম প্রাপ্তি ও জমা দেওয়ার ঠিকানা</h2>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each offices as office}
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-xl font-bold text-primary-800">{office.name}</h3>
          <p class="text-gray-600 mt-2">{office.address}</p>
          <p class="text-secondary-600 font-medium mt-2">ফোন: {office.phone}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="text-center">
    <h2 class="text-2xl font-bold text-primary-700 mb-4">যোগাযোগ</h2>
    <div class="text-lg text-gray-600">
      <p>অফিস: রশিদ ভবন (৩য় তলা), রিকাবী বাজার, সিলেট।</p>
      <p>ফোন: ০১৭৫২-৮৩১১৮৪, ০১৯৭৩-৮৮১৪৯৮, ০১৭৭১-১৪৪৩০৮</p>
      <p>অফিস টাইম: বিকাল ৫:০০ থেকে রাত ৮:০০ পর্যন্ত</p>
    </div>
  </section>

  <div class="text-sm text-gray-500 text-center py-8 border-t">
    আয়োজনে: কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর<br>
    বিস্তারিত তথ্যের জন্য: <a href="http://www.kkrfsylhet.org" class="text-primary-600 hover:underline">www.kkrfsylhet.org</a>
  </div>
</div>

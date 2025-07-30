<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  
  let activeAccordion = null;
  let currentIndex = 0;
  let interval;

  onMount(() => {
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % carouselItems.length;
    }, 5000); // Change slide every 5 seconds
  });
 
  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  const carouselItems = [
    { id: 1, image: "britti-2023.jpg", alt: "কিশোরকণ্ঠ পাঠক ফোরাম কার্যক্রম ১", caption: "কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৩" },
    { id: 2, image: "kk-2024.jpg", alt: "কিশোরকণ্ঠ পাঠক ফোরাম কার্যক্রম ২", caption: "শিক্ষা সফর ২০২৩" },
    { id: 3, image: "/placeholder-3.jpg", alt: "কিশোরকণ্ঠ পাঠক ফোরাম কার্যক্রম ৩", caption: "বৃক্ষরোপণ কর্মসূচি" },
  ];

  const members = [
    { id: 1, name: "আফসার উদ্দীন কামরান", role: "পরিচালক", image: "kamran.png", phone: "০১৭৪৩৮৮৭৭০৭" },
    { id: 2, name: "নাবিল মাহমুদ নিলয়", role: "সহকারী পরিচালক", image: "niloy.jpg", phone: "০১৭০১৪৫৯৮৮১" },
    { id: 3, name: "মুফাসসির আহমদ চৌধুরী", role: "সহকারী পরিচালক", image: "mufassir.jpg", phone: "০১৭৭১১৪৪৩০৮" },
  ];

  const activities = [
    {
      id: 'education',
      title: 'শিক্ষা কার্যক্রম',
      items: [
        'ফ্রি কোচিং ক্লাস',
        'দরিদ্র মেধাবী ছাত্রদের বৃত্তি প্রদান',
        'শিক্ষা সফর'
      ]
    },
    {
      id: 'cultural',
      title: 'সাংস্কৃতিক কার্যক্রম',
      items: [
        'বার্ষিক সাংস্কৃতিক অনুষ্ঠান',
        'বিতর্ক ও রচনা প্রতিযোগিতা',
        'কিশোরকণ্ঠ পাঠ'
      ]
    },
    {
      id: 'social',
      title: 'সামাজিক কার্যক্রম',
      items: [
        'বৃক্ষরোপণ',
        'স্কুল আঙ্গিনা পরিষ্কার অভিযান',
        'সচেতনতামূলক কর্মসূচি'
      ]
    }
  ];

  function toggleAccordion(id) {
    activeAccordion = activeAccordion === id ? null : id;
  }
</script>

<svelte:head>
  <title>কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর - হোম</title>
</svelte:head>

<div class="space-y-16">
  <section class="text-center pt-8">
    <h1 class="text-4xl md:text-5xl font-extrabold text-primary-800 mb-4">কিশোরকণ্ঠ পাঠক ফোরাম</h1>
    <p class="text-xl md:text-2xl text-secondary-700">সিলেট মহানগর</p>
  </section>

  <section class="relative w-full max-w-4xl mx-auto h-96 rounded-2xl shadow-2xl overflow-hidden">
    {#each carouselItems as item, index}
      <div
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style="opacity: {index === currentIndex ? 1 : 0};"
      >
        <img src={item.image} alt={item.alt} class="w-full h-full object-cover" />
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
          <h3 class="text-2xl font-bold text-white">{item.caption}</h3>
        </div>
      </div>
    {/each}
  </section>

  <section class="bg-white rounded-2xl shadow-xl p-8 md:p-12">
    <h2 class="text-3xl font-bold text-primary-700 mb-6 text-center">আমাদের সম্পর্কে</h2>
    <p class="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto text-center">
      কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর ১৯৮৪ সালে প্রতিষ্ঠিত একটি স্বেচ্ছাসেবী সংগঠন। আমরা শিক্ষা ও সংস্কৃতির উন্নয়নে নিবেদিত। আমাদের লক্ষ্য হলো যুব সমাজকে জ্ঞান, দক্ষতা এবং মূল্যবোধে সমৃদ্ধ করে তোলা।
    </p>
  </section>

  <section>
    <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">আমাদের কার্যক্রম</h2>
    <div class="space-y-4 max-w-3xl mx-auto">
      {#each activities as activity}
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            class="w-full text-left p-5 focus:outline-none flex justify-between items-center transition-colors hover:bg-primary-50"
            on:click={() => toggleAccordion(activity.id)}
          >
            <span class="text-xl font-semibold text-primary-800">{activity.title}</span>
            <span class="transform transition-transform duration-300 text-primary-600" class:rotate-180={activeAccordion === activity.id}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </span>
          </button>
          {#if activeAccordion === activity.id}
            <div class="p-6 bg-primary-50/50 border-t border-primary-100" transition:fly={{ y: -10, duration: 200 }}>
              <ul class="list-disc list-inside space-y-3 text-gray-700">
                {#each activity.items as item}
                  <li>{item}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">কমিটি</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each members as member}
        <div class="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:-translate-y-2 transition-transform duration-300">
          <img src={member.image} alt={member.name} class="w-32 h-32 rounded-full mx-auto mb-6 shadow-md border-4 border-white" />
          <h3 class="text-2xl font-semibold text-primary-800">{member.name}</h3>
          <p class="text-secondary-600 font-medium">{member.role}</p>
          <p class="text-gray-500 mt-2">{member.phone}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8 md:p-12 rounded-2xl shadow-xl">
    <div class="text-center">
      <h3 class="text-3xl font-bold mb-4">আসন্ন কার্যক্রম</h3>
      <p class="text-lg text-primary-100 mb-6 max-w-2xl mx-auto">
        আমাদের বার্ষিক বৃত্তি কার্যক্রম শুরু হতে যাচ্ছে। আগ্রহী শিক্ষার্থীদের জন্য নিবন্ধন খোলা রয়েছে।
      </p>
      <a href="/medhabritti-2024" class="bg-white text-primary-600 py-3 px-8 rounded-full hover:bg-primary-50 transition-colors inline-block text-lg font-semibold shadow-md">
        বৃত্তি সম্পর্কে জানুন
      </a>
    </div>
    <div class="grid md:grid-cols-2 gap-8 mt-12 text-center">
        <div class="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
            <h3 class="text-xl font-semibold text-white mb-4">কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৪ এর ফলাফল দেখুন</h3>
            <a href="/results" class="bg-secondary-500 text-white py-2 px-6 rounded-lg hover:bg-secondary-600 transition-colors font-semibold">
              ফলাফল
            </a>
        </div>
        <div class="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
            <h3 class="text-xl font-semibold text-white mb-4">সীটপ্লান এবং এডমিট কার্ড দেখুন</h3>
            <a href="/britti_info" class="bg-secondary-500 text-white py-2 px-6 rounded-lg hover:bg-secondary-600 transition-colors font-semibold">
              সীটপ্লান এবং এডমিট কার্ড
            </a>
        </div>
    </div>
  </section>

  <section>
    <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">যোগাযোগ করুন</h2>
    <div class="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto">
      <p class="text-lg text-gray-700 mb-4">
        <strong>ঠিকানা:</strong> ইউনিভার্স্যাল কলেজ, ১১২ ইবকো হাউজ, পূর্ব চৌহাট্টা, সিলেট।
      </p>
      <p class="text-lg text-gray-700 mb-4">
        <strong>ফোন:</strong> ০১৭৫২-৮৩১১৮৪
      </p>
      <p class="text-lg text-gray-700">
        <strong>অফিস সময়:</strong> বিকাল ৫:০০ থেকে রাত ৮:০০ ঘটিকা
      </p>
    </div>
  </section>
</div>

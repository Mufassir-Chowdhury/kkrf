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
    { id: 1, image: "britti-2025.jpeg", alt: "কিশোরকণ্ঠ পাঠক ফোরাম কার্যক্রম ১", caption: "কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৫" },
    // { id: 2, image: "kk-2024.jpg", alt: "কিশোরকণ্ঠ পাঠক ফোরাম কার্যক্রম ২", caption: "শিক্ষা সফর ২০২৩" },
    // { id: 3, image: "/placeholder-3.jpg", alt: "কিশোরকণ্ঠ পাঠক ফোরাম কার্যক্রম ৩", caption: "বৃক্ষরোপণ কর্মসূচি" },
  ];

  const members = [
    // { id: 1, name: "নাবিল মাহমুদ নিলয়", role: "পরিচালক", image: "niloy.png", phone: "০১৭০১৪৫৯৮৮১" },
    { id: 1, name: "আহসান হাবীব", role: "পরিচালক", image: "habib.png", phone: "০১৯৭৩৮৮১৪৯৮" },
    { id: 2, name: "শহিদুল ইসলাম ফেরদৌস", role: "সহকারী পরিচালক", image: "ferdous.png", phone: ""},
    // { id: 3, name: "মুফাসসির আহমদ চৌধুরী", role: "সহকারী পরিচালক", image: "mufassir.jpg", phone: "০১৭৭১১৪৪৩০৮" },
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

<div class="space-y-20">
  <section class="text-center pt-4">
    <span class="section-eyebrow">প্রতিষ্ঠাকাল ১৯৮৪</span>
    <h1 class="text-4xl md:text-5xl font-extrabold text-primary-900 mb-3 tracking-tight">কিশোরকণ্ঠ পাঠক ফোরাম</h1>
    <p class="text-lg md:text-xl text-gray-500">সিলেট মহানগর</p>
  </section>

  <section class="relative w-full max-w-4xl mx-auto h-96 rounded-xl shadow-card-lg overflow-hidden border border-primary-100">
    {#each carouselItems as item, index}
      <div
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style="opacity: {index === currentIndex ? 1 : 0};"
      >
        <img src={item.image} alt={item.alt} class="w-full h-full object-cover" />
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-950/80 to-transparent p-8">
          <h3 class="text-2xl font-bold text-white">{item.caption}</h3>
        </div>
      </div>
    {/each}
  </section>

  <section class="card">
    <h2 class="section-title mb-6 text-center">আমাদের সম্পর্কে</h2>
    <p class="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto text-center">
      কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর ১৯৮৪ সালে প্রতিষ্ঠিত একটি স্বেচ্ছাসেবী সংগঠন। আমরা শিক্ষা ও সংস্কৃতির উন্নয়নে নিবেদিত। আমাদের লক্ষ্য হলো যুব সমাজকে জ্ঞান, দক্ষতা এবং মূল্যবোধে সমৃদ্ধ করে তোলা।
    </p>
  </section>

  <section>
    <h2 class="section-title mb-8 text-center">আমাদের কার্যক্রম</h2>
    <div class="space-y-3 max-w-3xl mx-auto">
      {#each activities as activity}
        <div class="bg-white rounded-lg shadow-card border border-primary-100/60 overflow-hidden">
          <button
            class="w-full text-left p-5 focus:outline-none flex justify-between items-center transition-colors hover:bg-primary-50"
            on:click={() => toggleAccordion(activity.id)}
          >
            <span class="text-lg font-semibold text-primary-900">{activity.title}</span>
            <span class="transform transition-transform duration-300 text-secondary-600" class:rotate-180={activeAccordion === activity.id}>
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
    <h2 class="section-title mb-8 text-center">কমিটি</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each members as member}
        <div class="card text-center p-8">
          <img src={member.image} alt={member.name} class="w-28 h-28 rounded-full mx-auto mb-5 shadow-card border-4 border-white ring-1 ring-primary-100" />
          <h3 class="text-xl font-semibold text-primary-900">{member.name}</h3>
          <p class="text-secondary-600 font-medium text-sm mt-1 tracking-wide uppercase">{member.role}</p>
          <!-- <p class="text-gray-500 mt-2">{member.phone}</p> -->
        </div>
      {/each}
    </div>
  </section>

  <section class="bg-primary-900 text-white p-8 md:p-12 rounded-xl shadow-card-lg">
    <div class="text-center">
      <span class="inline-block text-xs md:text-sm font-semibold tracking-widest uppercase text-secondary-400 mb-3">আসন্ন কার্যক্রম</span>
      <h3 class="text-2xl md:text-3xl font-bold mb-4">মেধাবৃত্তি কার্যক্রম</h3>
      <p class="text-lg text-primary-200 mb-6 max-w-2xl mx-auto">
        আমাদের বার্ষিক বৃত্তি কার্যক্রম শুরু হতে যাচ্ছে। আগ্রহী শিক্ষার্থীদের জন্য নিবন্ধন খোলা রয়েছে।
      </p>
      <a href="/medhabritti-2025" class="btn-secondary">
        বৃত্তি সম্পর্কে জানুন
      </a>
    </div>
    <!-- <div class="grid md:grid-cols-2 gap-8 mt-12 text-center">
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
    </div> -->
  </section>

  <section>
    <h2 class="section-title mb-8 text-center">যোগাযোগ করুন</h2>
    <div class="card max-w-3xl mx-auto">
      <p class="text-lg text-gray-700 mb-4">
        <strong class="text-primary-900">ঠিকানা:</strong> রশিদ ভবন (৩য় তলা), রিকাবী বাজার, সিলেট।
      </p>
      <p class="text-lg text-gray-700 mb-4">
        <strong class="text-primary-900">ফোন:</strong> ০১৭৫২-৮৩১১৮৪
      </p>
      <p class="text-lg text-gray-700">
        <strong class="text-primary-900">অফিস সময়:</strong> বিকাল ৫:০০ থেকে রাত ৮:০০ ঘটিকা
      </p>
    </div>
  </section>
</div>

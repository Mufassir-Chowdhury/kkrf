<!-- <script>
  import { fade } from 'svelte/transition';
</script>

<svelte:head>
  <title>কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
</svelte:head>

<div class="space-y-8">
  <h1 class="text-4xl font-bold text-center text-teal-600">কিশোরকণ্ঠ পাঠক ফোরাম</h1>
  <h2 class="text-2xl font-semibold text-center text-amber-600">সিলেট মহানগর</h2>
  
  <div class="text-center">
    <h3 class="text-xl font-semibold mb-4 text-gray-800">আমাদের কার্যক্রম</h3>
    <ul class="list-disc list-inside text-left max-w-md mx-auto text-gray-600">
      <li>মেধা, দেশপ্রেম ও চারিত্রিক মূল্যবোধ সৃষ্টি</li>
      <li>ফ্রি কোচিং ক্লাস, দরিদ্র মেধাবী ছাত্রদেরকে বৃত্তি ও আর্থিক সহায়তা প্রদান</li>
      <li>দেয়ালিকা ও ফোল্ডার স্টিকার, ক্লাস রুটিন, ক্যালেন্ডার এবং ঈদ কার্ড প্রকাশ</li>
      <li>আন্তঃস্কুল ক্রিকেট ও ফুটবল টুর্নামেন্ট, বৃক্ষরোপন, স্কুল আঙ্গিনা পরিষ্কার অভিযান, অলিম্পিয়াড এর আয়োজন</li>
      <li>জেএসসি, জেডিসি কৃতি এবং এসএসসি ও দাখিল জিপিএ-৫ প্রাপ্তদের সংবর্ধনা</li>
      <li>কিশোরকণ্ঠ পাঠ, সাধারণ জ্ঞানের আসর, বিতর্ক ও রচনা প্রতিযোগিতা</li>
      <li>শিক্ষা সফর, সামষ্টিক ভোজ ও পাঠচক্রের আয়োজন</li>
    </ul>
  </div>
  
  <div class="bg-teal-50 p-6 rounded-lg">
    <h3 class="text-xl font-semibold mb-4 text-center text-teal-700">আসন্ন কার্যক্রম</h3>
    <p class="text-gray-700 text-center">
      আমাদের বার্ষিক বৃত্তি কার্যক্রম শুরু হতে যাচ্ছে। আগ্রহী শিক্ষার্থীদের জন্য নিবন্ধন খোলা রয়েছে।
    </p>
  </div>

  <div class="text-center">
    <a href="/medhabritti-2024" class="bg-amber-600 text-white py-3 px-6 rounded-full hover:bg-amber-700 transition-colors inline-block text-lg font-semibold">
      বৃত্তি সম্পর্কে জানুন
    </a>
  </div>
</div> -->

<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  
  let mounted = false;
  let activeAccordion = null;
  let currentIndex = 0;
  let interval;

  onMount(() => {
    mounted = true;
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % items.length;
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

<div class="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50">
  <header class="bg-teal-600 text-white py-4">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-center">কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</h1>
    </div>
  </header>

  <main class="container mx-auto px-4 py-8">
    <section class="mb-12">
      <div class="relative overflow-hidden rounded-lg" style="height: 400px;">
        {#each carouselItems as item, index}
          <div
            class="absolute inset-0 transition-opacity duration-1000"
            style="opacity: {index === currentIndex ? 1 : 0};"
          >
            <img src={item.image} alt={item.alt} class="w-full h-full object-cover" />
            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <p class="text-lg font-semibold">{item.caption}</p>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section class="mb-12 bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-teal-700 mb-4">আমাদের সম্পর্কে</h2>
      <p class="text-gray-700">
        কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর ১৯৮৪ সালে প্রতিষ্ঠিত একটি স্বেচ্ছাসেবী সংগঠন। আমরা শিক্ষা ও সংস্কৃতির উন্নয়নে নিবেদিত। আমাদের লক্ষ্য হলো যুব সমাজকে জ্ঞান, দক্ষতা এবং মূল্যবোধে সমৃদ্ধ করে তোলা।
      </p>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-bold text-teal-700 mb-4">আমাদের কার্যক্রম</h2>
      <div class="space-y-2">
        {#each activities as activity}
          <div class="bg-white rounded-lg shadow">
            <button
              class="w-full text-left p-4 focus:outline-none flex justify-between items-center"
              on:click={() => toggleAccordion(activity.id)}
            >
              <span class="font-semibold">{activity.title}</span>
              <span class="transform transition-transform duration-200" class:rotate-180={activeAccordion === activity.id}>▼</span>
            </button>
            {#if activeAccordion === activity.id}
              <div class="p-4 bg-gray-50" transition:fly="{{ y: -20, duration: 300 }}">
                <ul class="list-disc list-inside space-y-2">
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

    <section class="mb-12">
      <h2 class="text-2xl font-bold text-teal-700 mb-4">কমিটি</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each members as member}
          <div class="bg-white rounded-lg shadow-md p-4 text-center">
            <img src={member.image} alt={member.name} class="w-32 h-32 rounded-full mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-teal-700">{member.name}</h3>
            <p class="text-gray-600">{member.role}</p>
            <p class="text-gray-600">{member.phone}</p>
          </div>
        {/each}
      </div>
    </section>

    <section class="mb-12 bg-teal-50 p-6 rounded-lg">
      <h3 class="text-xl font-semibold mb-4 text-center text-teal-700">আসন্ন কার্যক্রম</h3>
      <p class="text-gray-700 text-center mb-4">
        আমাদের বার্ষিক বৃত্তি কার্যক্রম শুরু হতে যাচ্ছে। আগ্রহী শিক্ষার্থীদের জন্য নিবন্ধন খোলা রয়েছে।
      </p>
      <div class="text-center">
        <a href="/medhabritti-2024" class="bg-amber-600 text-white py-3 px-6 rounded-full hover:bg-amber-700 transition-colors inline-block text-lg font-semibold">
          বৃত্তি সম্পর্কে জানুন
        </a>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md text-center mt-10">
        <h3 class="text-xl font-semibold text-teal-700 mb-4">সীটপ্লান এবং এডমিট কার্ড দেখুন</h3>
        <a href="/britti_info" class="bg-amber-500 text-white py-2 px-4 rounded-md hover:bg-amber-600 transition-colors">
          সীটপ্লান এবং এডমিট কার্ড
        </a>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-bold text-teal-700 mb-4">যোগাযোগ করুন</h2>
      <div class="bg-white rounded-lg shadow-md p-6">
        <p class="text-gray-700 mb-2">
          <strong>ঠিকানা:</strong> ইউনিভার্স্যাল কলেজ, ১১২ ইবকো হাউজ, পূর্ব চৌহাট্টা, সিলেট।
        </p>
        <p class="text-gray-700 mb-2">
          <strong>ফোন:</strong> ০১৭৫২-৮৩১১৮৪
        </p>
        <p class="text-gamma-700">
          <strong>অফিস সময়:</strong> বিকাল ৫:০০ থেকে রাত ৮:০০ ঘটিকা
        </p>
      </div>
    </section>
  </main>

</div>

<style>
  /* You can add any additional styles here */
</style>
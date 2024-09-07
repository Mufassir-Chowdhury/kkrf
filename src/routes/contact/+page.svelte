<script>
  
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
  
    let mounted = false;
  
    onMount(() => {
      mounted = true;
    });
  </script>

<svelte:head>
    <title>যোগাযোগ - কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
  </svelte:head>
<main class="space-y-8 bg-gradient-to-br from-teal-50 to-amber-50 min-h-screen">
    <h1 class="text-3xl font-bold text-center text-teal-700">
       কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর
    </h1>
  
    <div class="bg-gradient-to-r from-teal-500 to-amber-500 text-white p-6 rounded-lg shadow-md">
      <h3 class="text-2xl font-bold mb-4 text-center">প্রধান কার্যালয়</h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div in:fly="{{ y: 50, duration: 500 }}" class="bg-white bg-opacity-20 p-4 rounded-lg">
          <p class="text-lg font-semibold mb-2">ঠিকানাঃ</p>
          <p class="text-xl font-bold">কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর<br>ইউনিভার্স্যাল কলেজ, ১১২ ইবকো হাউজ, পূর্ব চৌহাট্টা, সিলেট।</p>
        </div>
        <div in:fly="{{ y: 50, duration: 500, delay: 200 }}" class="bg-white bg-opacity-20 p-4 rounded-lg">
          <p class="text-lg font-semibold mb-2">যোগাযোগের জন্য ফোন নাম্বার:</p>
          <p class="text-3xl font-bold">০১৭৫২-৮৩১১৮৪</p>
          <p class="text-lg">ইমেইল: info@kkrfsylhet.org</p>
        </div>
      </div>
      <div in:fly="{{ y: 50, duration: 500, delay: 400 }}" class="mt-4 text-center">
        <p class="text-lg">যোগাযোগের সময়: বিকাল ৫:০০ থেকে রাত ৮:০০ ঘটিকা</p>
      </div>
    </div>
  
    <h3 class="text-2xl font-bold text-center text-teal-800 mb-6">যোগাযোগ করুন</h3>
  
    <div class="space-y-4 text-center">
      <p class="text-lg">ইমেইল পাঠানঃ</p>
      <a href="mailto:info@kkrfsylhet.org" class=" bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-md shadow-md inline-block">
        info@kkrfsylhet.org
      </a>
    </div>
  
    <div class="mt-8 space-y-4">
      <div class="bg-amber-50 p-6 rounded-lg shadow-md">
        <h4 class="text-xl font-semibold text-teal-700 mb-4">যোগাযোগের নম্বর:</h4>
        <ul class="space-y-2 text-gray-700">
            <li>০১৯৭৩৮৮১৪৯৮ (আহসান হাবীব)</li>
            <li>০১৯০৮৩০৩৮২৬ (রফিকুল ইসলাম)</li>
            <li>০১৮৭৭৪৩৮৫৪৮ (ছফির উদ্দীন)</li>
            <li>০১৩০৬৩২১০৫২ (আবুল হাসান রিয়াদ)</li>
        </ul>
      </div>
  
      <div class="text-sm text-gray-600 text-center">
        বিস্তারিত তথ্যের জন্য: <a href="http://www.kkrfsylhet.org" class="text-teal-600 hover:underline">www.kkrfsylhet.org</a>
      </div>
    </div>
  </main>
  

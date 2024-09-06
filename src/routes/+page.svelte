<!-- src/routes/+page.svelte -->
<script>
    import { fade } from 'svelte/transition';
  </script>
  
  <svelte:head>
    <title>কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
  </svelte:head>
  
  <div class="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 flex flex-col justify-center items-center p-4">
    <main class="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full" transition:fade>
      <h1 class="text-4xl font-bold text-center mb-6 text-green-600">কিশোরকণ্ঠ পাঠক ফোরাম</h1>
      <h2 class="text-2xl font-semibold text-center mb-8 text-blue-600">সিলেট মহানগর</h2>
      
      <!-- <p class="text-gray-700 text-center mb-8 text-lg">
        যুব প্রজন্মের জন্য একটি শিক্ষামূলক ও সাংস্কৃতিক প্লাটফর্ম
      </p> -->
      
      <div class="mb-12 text-center">
        <h3 class="text-xl font-semibold mb-4 text-gray-800">আমাদের লক্ষ্য</h3>
        <ul class="list-disc list-inside text-left max-w-md mx-auto text-gray-600">
          <li>পাঠ্যাভ্যাস গড়ে তোলা</li>
          <li>সৃজনশীলতা উৎসাহিত করা</li>
          <li>সাংস্কৃতিক চেতনা বিকশিত করা</li>
          <li>নেতৃত্ব দক্ষতা বাড়ানো</li>
        </ul>
      </div>
      
      <div class="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 class="text-xl font-semibold mb-4 text-center text-blue-700">আসন্ন কার্যক্রম</h3>
        <p class="text-gray-700 text-center">
          আমাদের বার্ষিক বৃত্তি কার্যক্রম শুরু হতে যাচ্ছে। আগ্রহী শিক্ষার্থীদের জন্য নিবন্ধন খোলা রয়েছে।
        </p>
      </div>
  
      <div class="mt-8 text-center">
        <a href="/britti_registration" class="bg-green-600 text-white py-3 px-6 rounded-full hover:bg-green-700 transition-colors inline-block text-lg font-semibold">
          বৃত্তি নিবন্ধন করুন
        </a>
      </div>
    </main>
    
    <footer class="mt-8 text-center text-gray-600">
      <p>&copy; 2024 কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর। সর্বস্বত্ব সংরক্ষিত।</p>
    </footer>
  </div>
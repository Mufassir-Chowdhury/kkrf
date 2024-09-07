<script>
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
  
    let mounted = false;
  
    onMount(() => {
      mounted = true;
    });
  
    const syllabusData = [
      {
        class: "দশম শ্রেণি (স্কুল/মাদরাসা)",
        subjects: [
          {
            name: "বাংলা",
            topics: [
              "গদ্যঃ ১. শিক্ষা ও মনুষ্যত্ব, ২. মানুষ মুহাম্মদ সা., ৩. বই পড়া",
              "পদ্যঃ ১. পল্লী জননী, ২. কপতাক্ষ নদ, ৩. তোমাকে পাওয়ার জন্য হে স্বাধীনতা",
              "ব্যকরণঃ সন্ধি, সমাস, কারক ও বিভক্তি, প্রত্যয়, বাচ্য"
            ]
          },
          {
            name: "English",
            topics: [
              "১ম ও ২য় পত্রঃ পুরো সিলেবাস - বোর্ড পরীক্ষার আলোকে"
            ]
          },
          {
            name: "গণিত",
            topics: [
              "১. বীজগণিতঃ অধ্যায় - ২, ৪, ১৩",
              "২. জ্যামিতিঃ অধ্যায় - ৮",
              "৩. ত্রিকোণমিতিঃ অধ্যায় - ১০",
              "৪. পরিমিতিঃ অধ্যায় - ১৬",
              "৫. পরিসংখ্যানঃ অধ্যায় - ১৭"
            ]
          }
        ]
      },
      // Add data for other classes (নবম, অষ্টম, etc.) following the same structure
    ];
  </script>
  
  <svelte:head>
    <title>মেধাবৃত্তি পরীক্ষা ২০২৪ সিলেবাস - কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
  </svelte:head>
  
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-center text-teal-700">
      মেধাবৃত্তি পরীক্ষা ২০২৪ সিলেবাস
    </h1>
  
    {#if mounted}
      {#each syllabusData as classData, index}
        <div in:fly="{{ y: 50, duration: 500, delay: index * 100 }}" class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold text-teal-600 mb-4">{classData.class}</h2>
          {#each classData.subjects as subject}
            <div class="mb-4">
              <h3 class="text-xl font-medium text-amber-600">{subject.name}</h3>
              <ul class="list-disc list-inside pl-4 text-gray-700">
                {#each subject.topics as topic}
                  <li>{topic}</li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      {/each}
  
      <div in:fly="{{ y: 50, duration: 500, delay: syllabusData.length * 100 }}" class="bg-amber-50 p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold text-teal-700 mb-4">বিশেষ দ্রষ্টব্য</h3>
        <p class="text-gray-700">
          সাধারণ জ্ঞানের জন্য (জানুয়ারি-আগস্ট'২৪) কিশোরকণ্ঠ এবং বিশেষ সংকলন "অন্বেষণ" সংগ্রহ করতে হবে।
        </p>
      </div>
    {/if}
  </div>
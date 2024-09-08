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
          "গদ্যঃ ১. শিক্ষা ও মনুষ্যত্ব, ২. মানুষ মুহাম্মদ সা., ৩. বই পড়া",
          "পদ্যঃ ১. পল্লী জননী, ২. কপতাক্ষ নদ, ৩. তোমাকে পাওয়ার জন্য হে স্বাধীনতা",
          "ব্যকরণঃ সন্ধি, সমাস, কারক ও বিভক্তি, প্রত্যয়, বাচ্য"
        ]
      },
      {
        name: "English",
        topics: [
          "১ম ও ২য় পত্রঃ পুরো সিলেবাস - বোর্ড পরীক্ষার আলোকে"
        ]
      },
      {
        name: "গণিত",
        topics: [
          "১. বীজগণিতঃ অধ্যায় - ২, ৪, ১৩",
          "২. জ্যামিতিঃ অধ্যায় - ৮",
          "৩. ত্রিকোণমিতিঃ অধ্যায় - ১০",
          "৪. পরিমিতিঃ অধ্যায় - ১৬",
          "৫. পরিসংখ্যানঃ অধ্যায় - ১৭"
        ]
      }
    ]
  },
  {
    class: "নবম শ্রেণি (স্কুল/মাদরাসা)",
    subjects: [
      {
        name: "বাংলা",
        topics: [
          "২য় অধ্যায়: প্রমিত ভাষা ব্যবহার করি",
          "৪র্থ অধ্যায়: ব্যাকরণ মেনে লিখতে শিখি",
          "৬ষ্ঠ অধ্যায়: সাহিত্য পড়ি সাহিত্য লিখি (কবিতা)"
        ]
      },
      {
        name: "English",
        topics: [
          "Chapter : 2, 4, 5, 9,10, 12",
          "Grammar : Preposition, Voice change, Articles",
          "Changing sentences, Right form of verbs."
        ]
      },
      {
        name: "গণিত",
        topics: [
          "১. প্রাত্যহিক জীবনে সেট",
          "২. অনুক্রম ও ধারা",
          "৩. সূচক ও লগারিদমের ধারণা",
          "৪. পরিমাপে ত্রিকোণমিতি",
          "৫. সূচক ও যৌগিক ঘনবস্তু পরিমাপ"
        ]
      }
    ]
  },
  {
    class: "অষ্টম শ্রেণি (স্কুল/মাদরাসা)",
    subjects: [
      {
        name: "বাংলা",
        topics: [
          "২য় অধ্যায়: প্রমিত বলি প্রমিত লিখি",
          "৪র্থ অধ্যায়: শব্দ বুঝি বাক্য লিখি",
          "৬ষ্ঠ অধ্যায়: সাহিত্য পড়ি সাহিত্য লিখি (কবিতা, প্রবন্ধ)"
        ]
      },
      {
        name: "English",
        topics: [
          "Unit- 2, 4, 5, 6, 7, 11",
          "Grammar : Narration /speech, Transformation of sentences, Sentence Connectors, Right form of verbs, preposition, phrase and clause"
        ]
      },
      {
        name: "গণিত",
        topics: [
          "১. বাইনারী সংখ্যা পদ্ধতি",
          "২. দৈনন্দিন কাজে বাস্তব সংখ্যা",
          "৩. অবস্থান মানচিত্রে স্থানাঙ্ক জ্যামিতি",
          "৪. ক্ষুদ্র সঞ্চয়ে ভবিষ্যৎ গড়ি",
          "৫. বৃত্তের খুঁটিনাটি"
        ]
      }
    ]
  },
  {
    class: "সপ্তম শ্রেণি (স্কুল/মাদরাসা)",
    subjects: [
      {
        name: "বাংলা",
        topics: [
          "২য় অধ্যায়: প্রমিত ভাষায় কথা বলি",
          "৩য় অধ্যায়: অর্থ বুঝে বাক্য লিখি",
          "৫ম অধ্যায়: বুঝে পড়ি লিখতে শিখি"
        ]
      },
      {
        name: "English",
        topics: [
          "Unit : 4,7,8,11,12,14,16",
          "Grammar : Degree, active and passive, preposition, conjunction, transformation of sentence"
        ]
      },
      {
        name: "গণিত",
        topics: [
          "১. সূচকের গল্প ও বীজগাণিতিক রাশির সূচক",
          "২. ভগ্নাংশের ল.সা.গু ও গ.সা.গু",
          "৩. বাইনারী সংখ্যার গল্প",
          "৪. নানারকম আকৃতি মাপি",
          "৫. চলো বৃত্ত চিনি"
        ]
      }
    ]
  },
  {
    class: "ষষ্ঠ শ্রেণি (স্কুল/মাদরাসা)",
    subjects: [
      {
        name: "বাংলা",
        topics: [
          "২য় অধ্যায়: প্রমিত ভাষা শিখি",
          "৩য় অধ্যায়: অর্থ বুঝে বাক্য লিখি",
          "৬ষ্ঠ অধ্যায়: সাহিত্য পড়ি লিখতে শিখি (কবিতা, প্রবন্ধ)"
        ]
      },
      {
        name: "English",
        topics: [
          "Chapter : 3, 7, 9,12,14,18",
          "Grammar : Degree, active and passive, preposition, conjunction, transformation of sentence"
        ]
      },
      {
        name: "গণিত",
        topics: [
          "১. পূর্ণ সংখ্যার জগৎ",
          "২. ভগ্নাংশের খেলা",
          "৩. ঐকিক নিয়ম, শতকরা এবং অনুপাত",
          "৪. বীজগাণিতিক রাশির জগৎ",
          "৫. জ্যামিতিক আকৃতির গল্প",
          "৬. দৈর্ঘ্য মাপি"
        ]
      }
    ]
  },
  {
    class: "পঞ্চম শ্রেণি (স্কুল/মাদরাসা)",
    subjects: [
      {
        name: "বাংলা",
        topics: [
          "গদ্য : ১. বিদায় হজ্জ ২. এই দেশ এই মানুষ ৩. দেশে এলাম নায়াগ্রা",
          "পদ্য : ১. সংকল্প ২. শিক্ষাগুরুর মর্যাদা ৩. স্বদেশ ।"
        ]
      },
      {
        name: "English",
        topics: [
          "1. Unit- 6, 9, 10, 14, 20, 24",
          "Grammar: Parts of speech, Article, preposition, Tenses, phrase and Clause"
        ]
      },
      {
        name: "গণিত",
        topics: [
          "১. ভগ্নাংশ (৬ষ্ঠ ও ৭ম অধ্যায়)",
          "২. পরিমাপ (একাদশ অধ্যায়)",
          "৩. জ্যামিতি (১০ম অধ্যায়)",
          "৪. শতকরা (৯ম অধ্যায়)",
          "৫. চার প্রক্রিয়া সম্পর্কিত সমস্যাবলী (৩য় অধ্যায়)"
        ]
      },
      {
        name: "বিজ্ঞান",
        topics: [
          "১. পদার্থ ও শক্তি",
          "২. মহাবিশ্ব",
          "৩. সুস্থ জীবনের জন্য খাদ্য",
          "৪. আমাদের জীবনে প্রযুক্তি",
          "৫. জলবায়ু পরিবর্তন",
          "৬. আমাদের জীবনে তথ্য"
        ]
      }
    ]
  },
  {
    class: "চতুর্থ শ্রেণি (স্কুল/মাদরাসা)",
    subjects: [
      {
        name: "বাংলা",
        topics: [
          "গদ্য : ১. বাংলাদেশের প্রকৃতি ২. খলিফা হযরত উমর (রা.) ৩. পাহাড়পুর",
          "পদ্য : ১. বীর পুরুষ ২. মা ৩. কাজলা দিদি"
        ]
      },
      {
        name: "English",
        topics: [
          "1. Unit- 3,15,16,21,23,28,31,34,35,37,40,42",
          "2. Verb to be, Past Tense, Present Continuous Tense"
        ]
      },
      {
        name: "গণিত",
        topics: [
          "১. গুণিতক ও গুণনীয়ক",
          "২. সাধারণ ভগ্নাংশ",
          "৩. দশমিক ভগ্নাংশ",
          "৪. গাণিতিক প্রতীক",
          "৫. ত্রিভুজ",
          "৬. পরিমাপ"
        ]
      },
      {
        name: "বিজ্ঞান",
        topics: [
          "১. উদ্ভিদ ও প্রাণী",
          "২. পদার্থ",
          "৩. মহাবিশ্ব",
          "৪. আমার জীবনে প্রযুক্তি",
          "৫. আবহাওয়া ও জলবায়ু",
          "৬. স্বাস্থ্যবিধি"
        ]
      }
    ]
  }
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
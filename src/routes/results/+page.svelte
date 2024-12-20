<!-- src/routes/results/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { fade, slide } from 'svelte/transition';
  
    import Papa from 'papaparse';
    
    let resultsData = [];
    let expandedSections = new Set();
    
    const classes = ['৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম'];
    const categories = ['Talentpool', 'General', 'Special'];
  
    onMount(async () => {
      try {
        const response = await fetch('/Results.csv');
        const csvText = await response.text();
        
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true
        });
        
        resultsData = parsed.data;
      } catch (error) {
        console.error('Error loading results:', error);
      }
    });
  
    function toggleSection(classLevel) {
      if (expandedSections.has(classLevel)) {
        expandedSections.delete(classLevel);
      } else {
        expandedSections.add(classLevel);
      }
      expandedSections = expandedSections; // trigger reactivity
    }
  
    function getResultsByClassAndCategory(classLevel, category) {
      return resultsData.filter(result => 
        result.Class === classLevel && 
        result.Category === category
      );
    }
  </script>
  
  <svelte:head>
    <title>ফলাফল - কিশোরকণ্ঠ পাঠক ফোরাম</title>
  </svelte:head>
  
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center text-teal-700 mb-8">মেধাবৃত্তি পরীক্ষার ফলাফল - ২০২৪</h1>
  
    <div class="bg-white rounded-lg shadow-lg p-6">
      {#each classes as classLevel}
        <div class="mb-4 border rounded-lg overflow-hidden">
          <button
            class="w-full px-6 py-4 text-left bg-teal-50 hover:bg-teal-100 transition-colors flex justify-between items-center"
            on:click={() => toggleSection(classLevel)}
          >
            <div>
              <span class="text-xl font-semibold text-teal-800">{classLevel} শ্রেণি</span>
              <span class="text-sm text-gray-600 ml-2">
                (মোট: {resultsData.filter(r => r.Class === classLevel).length} জন)
              </span>
            </div>
            <span class="transform transition-transform duration-200" class:rotate-180={expandedSections.has(classLevel)}>
              ▼
            </span>
          </button>
  
          {#if expandedSections.has(classLevel)}
            <div transition:slide="{{ duration: 300 }}" class="divide-y">
              {#each categories as category}
                <div class="p-4 bg-white">
                  <h3 class="text-lg font-semibold text-amber-700 mb-3">
                    {category}
                    <span class="text-sm font-normal text-gray-600 ml-2">
                      ({getResultsByClassAndCategory(classLevel, category).length} জন)
                    </span>
                  </h3>
                  
                  {#if getResultsByClassAndCategory(classLevel, category).length === 0}
                    <p class="text-gray-500 italic text-center py-4">
                      এই বিভাগে কোন ফলাফল প্রকাশিত হয়নি
                    </p>
                  {:else}
                    <div class="overflow-x-auto">
                      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 p-4">
                        {#each getResultsByClassAndCategory(classLevel, category) as result}
                          <div class="bg-gray-50 p-3 text-center rounded-lg shadow-sm">
                            {result.ROLL}
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  
  
  </div>
  
  <style>
    /* Any additional custom styles can go here */
  </style>
<script>
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
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

<div class="max-w-7xl mx-auto px-4 py-12">
  <section class="text-center mb-12">
    <h1 class="text-4xl md:text-5xl font-extrabold text-primary-800 mb-4">মেধাবৃত্তি পরীক্ষার ফলাফল - ২০২৫</h1>
  </section>

  <div class="space-y-4">
    {#each classes as classLevel}
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
        <button
          class="w-full px-6 py-5 text-left bg-white hover:bg-primary-50/50 transition-colors flex justify-between items-center"
          on:click={() => toggleSection(classLevel)}
        >
          <div>
            <span class="text-2xl font-bold text-primary-700">{classLevel} শ্রেণি</span>
            <span class="text-base text-gray-500 ml-3">
              (মোট: {resultsData.filter(r => r.Class === classLevel).length} জন)
            </span>
          </div>
          <span class="transform transition-transform duration-300 text-primary-600" class:rotate-180={expandedSections.has(classLevel)}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </span>
        </button>

        {#if expandedSections.has(classLevel)}
          <div transition:slide={{ duration: 300 }} class="divide-y divide-gray-100 border-t border-gray-100">
            {#each categories as category}
              <div class="p-6">
                <h3 class="text-xl font-semibold text-secondary-600 mb-4">
                  {category}
                  <span class="text-base font-normal text-gray-500 ml-2">
                    ({getResultsByClassAndCategory(classLevel, category).length} জন)
                  </span>
                </h3>
                
                {#if getResultsByClassAndCategory(classLevel, category).length === 0}
                  <p class="text-gray-500 italic text-center py-6">
                    এই বিভাগে কোন ফলাফল প্রকাশিত হয়নি
                  </p>
                {:else}
                  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {#each getResultsByClassAndCategory(classLevel, category) as result}
                      <div class="bg-primary-50 text-primary-800 font-semibold p-3 text-center rounded-lg shadow-sm text-lg">
                        {result.ROLL}
                      </div>
                    {/each}
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

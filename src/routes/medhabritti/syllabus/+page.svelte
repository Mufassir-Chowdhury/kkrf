<script>
	import { onMount } from 'svelte';
	import { getActiveScholarship } from '$lib/siteData';

	let loading = true;
	let scholarship = null;

	onMount(async () => {
		scholarship = await getActiveScholarship();
		loading = false;
	});
</script>

<svelte:head>
	<title>মেধাবৃত্তি পরীক্ষা {scholarship?.year ?? ''} সিলেবাস - কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
</svelte:head>

{#if loading}
	<div class="text-center py-24 text-gray-400">লোড হচ্ছে...</div>
{:else if !scholarship || !(scholarship.syllabus || []).length}
	<div class="card text-center py-16">
		<h1 class="section-title mb-2">সিলেবাস পাওয়া যায়নি</h1>
		<p class="text-gray-500">
			<a href="/medhabritti" class="text-primary-700 hover:underline">মেধাবৃত্তি পাতায় ফিরে যান</a>
		</p>
	</div>
{:else}
	<div class="space-y-12">
		<section class="text-center pt-4">
			<span class="section-eyebrow">সিলেবাস</span>
			<h1 class="text-4xl md:text-5xl font-extrabold text-primary-900 mb-4 tracking-tight">
				মেধাবৃত্তি পরীক্ষা {scholarship.year} সিলেবাস
			</h1>
		</section>

		{#if scholarship.specialNote}
			<section class="bg-secondary-50 border-l-4 border-secondary-400 p-8 rounded-r-lg">
				<h3 class="text-xl font-semibold text-secondary-800 mb-4">বিশেষ দ্রষ্টব্য</h3>
				<p class="text-lg text-secondary-700">{scholarship.specialNote}</p>
			</section>
		{/if}

		<div class="space-y-8">
			{#each scholarship.syllabus as classData}
				<section class="bg-white rounded-xl shadow-card border border-primary-100/60 overflow-hidden">
					<h2 class="text-xl font-bold text-white bg-primary-900 p-6">{classData.class}</h2>
					<div class="p-6 md:p-8 grid gap-8">
						{#each classData.subjects as subject}
							<div class="border-b pb-6 last:border-b-0 last:pb-0">
								<h3 class="text-2xl font-bold text-secondary-600 mb-4">{subject.name}</h3>
								<ul class="list-disc list-inside space-y-2 text-gray-700 text-lg">
									{#each subject.topics as topic}
										<li>{topic}</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</div>
{/if}

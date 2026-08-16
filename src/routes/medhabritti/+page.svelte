<script>
	import { onMount } from 'svelte';
	import { getActiveScholarship, getSiteInfo } from '$lib/siteData';

	let loading = true;
	let scholarship = null;
	let siteInfo = null;

	onMount(async () => {
		[scholarship, siteInfo] = await Promise.all([getActiveScholarship(), getSiteInfo()]);
		loading = false;
	});
</script>

<svelte:head>
	<title>মেধাবৃত্তি পরীক্ষা {scholarship?.year ?? ''} - কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
</svelte:head>

{#if loading}
	<div class="text-center py-24 text-gray-400">লোড হচ্ছে...</div>
{:else if !scholarship}
	<div class="card text-center py-16">
		<h1 class="section-title mb-2">এই মুহূর্তে কোনো সক্রিয় বৃত্তি পরীক্ষা নেই</h1>
		<p class="text-gray-500">নতুন তথ্যের জন্য পরে আবার দেখুন অথবা আমাদের সাথে যোগাযোগ করুন।</p>
	</div>
{:else}
	<div class="space-y-16">
		<section class="text-center pt-4">
			<span class="section-eyebrow">মেধাবৃত্তি পরীক্ষা</span>
			<h1 class="text-4xl md:text-5xl font-extrabold text-primary-900 mb-3 tracking-tight">
				কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা {scholarship.year}
			</h1>
			<p class="text-lg md:text-xl text-gray-500">৪র্থ-১০ম শ্রেণী, স্কুল এবং মাদরাসা</p>
		</section>

		{#if scholarship.prizeAmount}
			<section class="bg-primary-900 text-white p-8 md:p-12 rounded-xl shadow-card-lg text-center">
				<span class="inline-block text-xs md:text-sm font-semibold tracking-widest uppercase text-secondary-400 mb-3">
					বৃত্তি প্রদান
				</span>
				<p class="text-4xl font-extrabold tracking-tight">{scholarship.prizeAmount}</p>
				{#if scholarship.prizeNote}
					<p class="text-xl text-primary-200">{scholarship.prizeNote}</p>
				{/if}
			</section>
		{/if}

		{#if (scholarship.examRules || []).length}
			<section class="card">
				<h2 class="section-title mb-8 text-center">বৃত্তি সম্পর্কিত তথ্য</h2>
				<ul class="space-y-4">
					{#each scholarship.examRules as rule}
						<li class="flex items-start space-x-4">
							<span class="text-secondary-600 mt-1 text-xl">✓</span>
							<span class="text-lg text-gray-700">{rule}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if scholarship.specialNote}
			<section class="bg-secondary-50 border-l-4 border-secondary-400 p-8 rounded-r-lg">
				<h3 class="text-xl font-semibold text-secondary-800 mb-4">বিশেষ দ্রষ্টব্য</h3>
				<p class="text-lg text-secondary-700">{scholarship.specialNote}</p>
			</section>
		{/if}

		{#if (scholarship.syllabus || []).length}
			<section class="text-center">
				<h2 class="section-title mb-6">পরীক্ষার সিলেবাস</h2>
				<a href="/medhabritti/syllabus" class="btn-primary">সিলেবাস দেখুন</a>
			</section>
		{/if}

		<section class="bg-secondary-600 text-white p-8 md:p-12 rounded-xl shadow-card-lg text-center">
			<h2 class="text-3xl font-bold mb-4">
				{scholarship.registrationOpen ? 'এখনই রেজিস্ট্রেশন করুন!' : 'এই মুহূর্তে রেজিস্ট্রেশন বন্ধ আছে'}
			</h2>
			{#if scholarship.registrationOpen}
				<a href="/britti_registration" class="bg-white text-primary-800 py-3 px-8 rounded-md hover:bg-primary-50 transition-colors inline-block text-lg font-semibold shadow-card">
					অনলাইন রেজিস্ট্রেশন
				</a>
				<p class="mt-4 text-secondary-100">অথবা আপনার স্কুল প্রতিনিধির সাথে যোগাযোগ করুন।</p>
			{:else}
				<p class="text-secondary-100">রেজিস্ট্রেশন খোলার সাথে সাথে এখানে জানানো হবে।</p>
			{/if}
		</section>

		{#if (scholarship.offices || []).length}
			<section class="card">
				<h2 class="section-title mb-8 text-center">অফলাইনে ফর্ম প্রাপ্তি ও জমা দেওয়ার ঠিকানা</h2>
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each scholarship.offices as office}
						<div class="border border-gray-200 rounded-lg p-6">
							<h3 class="text-lg font-bold text-primary-900">{office.name}</h3>
							<p class="text-gray-600 mt-2">{office.address}</p>
							{#if office.phone}
								<p class="text-secondary-600 font-medium mt-2">ফোন: {office.phone}</p>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#if siteInfo}
			<section class="text-center">
				<h2 class="text-2xl font-bold text-primary-900 mb-4">যোগাযোগ</h2>
				<div class="text-lg text-gray-600">
					<p>অফিস: {siteInfo.address}</p>
					<p>ফোন: {siteInfo.phone}</p>
					<p>অফিস টাইম: {siteInfo.officeTime}</p>
				</div>
			</section>
		{/if}

		<div class="text-sm text-gray-500 text-center py-8 border-t border-gray-200">
			আয়োজনে: কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর<br />
			বিস্তারিত তথ্যের জন্য: <a href="http://www.kkrfsylhet.org" class="text-primary-700 hover:underline">www.kkrfsylhet.org</a>
		</div>
	</div>
{/if}

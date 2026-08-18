<script>
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { migrateLegacyYear } from '$lib/migrateLegacyYear';
	import { deleteLegacyYear } from '$lib/deleteLegacyYear';
	import { getScholarship, saveScholarship, SEED_2025 } from '$lib/siteData';

	let sourceYear = '2025';
	let running = false;
	let logLines = [];
	let report = null;

	let seedingDoc = false;
	let seedResult = null;

	let deleteYear = '';
	let deleteConfirmText = '';
	let deleting = false;
	let deleteLogLines = [];
	let deleteReport = null;

	async function handleSeed2025Doc() {
		if (
			!confirm(
				'"2025" সালের scholarships ডকুমেন্ট তৈরি করতে চান (স্ট্যাটিক পেজের পুরনো তথ্য দিয়ে)? এটি বর্তমান সক্রিয় বৃত্তি পরিবর্তন করবে না।'
			)
		) {
			return;
		}
		seedingDoc = true;
		seedResult = null;
		try {
			const existing = await getScholarship('2025');
			if (existing) {
				seedResult = 'ইতিমধ্যে "scholarships/2025" ডকুমেন্ট বিদ্যমান, কিছু করা হয়নি।';
			} else {
				await saveScholarship('2025', SEED_2025);
				seedResult = '"scholarships/2025" ডকুমেন্ট তৈরি করা হয়েছে।';
			}
		} catch (err) {
			console.error('Error seeding scholarships/2025:', err);
			seedResult = `ত্রুটি: ${err.message || err}`;
		} finally {
			seedingDoc = false;
		}
	}

	function log(msg) {
		logLines = [...logLines, msg];
	}

	async function handleRun() {
		const year = sourceYear.trim();
		if (!year) {
			alert('অনুগ্রহ করে একটি বছর লিখুন।');
			return;
		}
		if (
			!confirm(
				`"${year}" সালের পুরনো ডেটা (scholarshipApplications-${year}, offline-${year}, refund-${year}, _cache) নতুন স্ট্রাকচারে (scholarships/${year}/...) কপি করতে চান? পুরনো ডেটা মুছে ফেলা হবে না।`
			)
		) {
			return;
		}

		running = true;
		logLines = [];
		report = null;
		try {
			report = await migrateLegacyYear(year, log);
		} catch (err) {
			console.error('Migration failed:', err);
			log(`ERROR: ${err.message || err}`);
		} finally {
			running = false;
		}
	}

	function deleteLog(msg) {
		deleteLogLines = [...deleteLogLines, msg];
	}

	async function handleDelete() {
		const year = deleteYear.trim();
		if (!year) {
			alert('অনুগ্রহ করে একটি বছর লিখুন।');
			return;
		}
		if (deleteConfirmText.trim() !== year) {
			alert(`নিশ্চিত করতে নিচের বক্সে ঠিক "${year}" লিখুন।`);
			return;
		}
		if (
			!confirm(
				`"${year}" সালের পুরনো ডেটা (scholarshipApplications-${year}, offline-${year}, refund-${year}, _cache) স্থায়ীভাবে মুছে ফেলতে চান? এটি ফিরিয়ে আনা যাবে না। শুধুমাত্র নতুন স্ট্রাকচারে ডেটা যাচাই করা থাকলেই মোছা হবে।`
			)
		) {
			return;
		}

		deleting = true;
		deleteLogLines = [];
		deleteReport = null;
		try {
			deleteReport = await deleteLegacyYear(year, deleteLog);
		} catch (err) {
			console.error('Cleanup failed:', err);
			deleteLog(`ERROR: ${err.message || err}`);
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Data Migration - Admin Dashboard</title>
</svelte:head>

<BreadCrumb
	links={[
		{ url: '/admin', label: 'Home' },
		{ url: '#', label: 'Data Migration' }
	]}
/>

<div class="space-y-6 mt-6">
	<div class="card">
		<h2 class="section-title mb-1">লিগ্যাসি ডেটা মাইগ্রেশন</h2>
		<p class="text-gray-500 text-sm mb-4">
			পুরনো <code>-YYYY</code> সাফিক্স যুক্ত কালেকশন এবং <code>_cache</code> ডকুমেন্টগুলো নতুন
			<code>scholarships/&#123;year&#125;/...</code> সাবকালেকশন স্ট্রাকচারে কপি করে। এটি বারবার চালানো
			যাবে (ওভাররাইট করবে, ডুপ্লিকেট তৈরি করবে না) এবং পুরনো ডেটা মুছে ফেলবে না।
		</p>
		<div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
			<div>
				<label for="sourceYear" class="block text-sm font-medium text-gray-700 mb-1"
					>সোর্স বছর</label
				>
				<input
					id="sourceYear"
					type="text"
					bind:value={sourceYear}
					class="border border-gray-300 rounded-md p-2 w-40 focus:ring-primary-500 focus:border-primary-500"
					placeholder="2025"
				/>
			</div>
			<button on:click={handleRun} disabled={running} class="btn-primary disabled:opacity-50">
				{running ? 'মাইগ্রেশন চলছে...' : 'মাইগ্রেশন শুরু করুন'}
			</button>
		</div>
	</div>

	<div class="card">
		<h2 class="section-title mb-1">২০২৫ সালের স্কলারশিপ ডকুমেন্ট তৈরি করুন</h2>
		<p class="text-gray-500 text-sm mb-4">
			২০২৫ সালের তথ্য (পরীক্ষার তারিখ, ফি, সিলেবাস ইত্যাদি) আগে <code>scholarships</code> কালেকশন
			চালু হওয়ার আগেই স্ট্যাটিক পেজে ছিল, তাই কোনো <code>scholarships/2025</code> ডকুমেন্ট তৈরি হয়নি
			— ফলে মাইগ্রেট করা ডেটা এডমিন প্যানেলের ইয়ার সুইচারে দেখা যাচ্ছে না। এই বাটনটি স্ট্যাটিক পেজের
			পুরনো তথ্য দিয়ে সেই ডকুমেন্টটি তৈরি করবে (বন্ধ অবস্থায়), বর্তমান সক্রিয় বৃত্তি পরিবর্তন করবে
			না।
		</p>
		<button
			on:click={handleSeed2025Doc}
			disabled={seedingDoc}
			class="btn-primary disabled:opacity-50"
		>
			{seedingDoc ? 'তৈরি হচ্ছে...' : '"scholarships/2025" ডকুমেন্ট তৈরি করুন'}
		</button>
		{#if seedResult}
			<p class="text-sm text-gray-600 mt-3">{seedResult}</p>
		{/if}
	</div>

	{#if logLines.length}
		<div class="card">
			<h3 class="font-semibold text-gray-900 mb-2">লগ</h3>
			<pre
				class="bg-gray-900 text-gray-100 text-xs rounded-md p-4 overflow-x-auto whitespace-pre-wrap">{logLines.join(
					'\n'
				)}</pre>
		</div>
	{/if}

	{#if report}
		<div class="card">
			<h3 class="font-semibold text-gray-900 mb-2">
				ফলাফল — {report.verified ? '✅ যাচাই সফল' : '⚠️ যাচাই ব্যর্থ, লগ দেখুন'}
			</h3>
			<pre class="text-xs bg-gray-50 rounded-md p-4 overflow-x-auto">{JSON.stringify(
					report,
					null,
					2
				)}</pre>
		</div>
	{/if}

	<div class="card border-2 border-red-200">
		<h2 class="section-title mb-1 text-red-700">
			পুরনো ডেটা মুছে ফেলুন (Step 8 — স্থায়ী, ফিরিয়ে আনা যাবে না)
		</h2>
		<p class="text-gray-500 text-sm mb-4">
			<code>scholarshipApplications-YYYY</code>, <code>offline-YYYY</code>, <code>refund-YYYY</code>
			এবং
			<code>_cache</code> কালেকশনগুলো স্থায়ীভাবে মুছে ফেলে। শুধুমাত্র মাইগ্রেশন যাচাই করা থাকলেই
			(নতুন
			<code>scholarships/&#123;year&#125;/...</code> এ কমপক্ষে সমান সংখ্যক ডকুমেন্ট থাকলে) মুছবে — নাহলে
			সেই কালেকশনটি এড়িয়ে যাবে। শুধুমাত্র সম্পূর্ণ End-to-End যাচাই শেষ হলে এবং নিশ্চিত হওয়ার পরেই
			এটি চালান।
		</p>
		<div class="flex flex-col gap-4">
			<div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
				<div>
					<label for="deleteYear" class="block text-sm font-medium text-gray-700 mb-1">বছর</label>
					<input
						id="deleteYear"
						type="text"
						bind:value={deleteYear}
						class="border border-gray-300 rounded-md p-2 w-40 focus:ring-red-500 focus:border-red-500"
						placeholder="2025"
					/>
				</div>
				<div>
					<label for="deleteConfirmText" class="block text-sm font-medium text-gray-700 mb-1">
						নিশ্চিত করতে বছরটি আবার লিখুন
					</label>
					<input
						id="deleteConfirmText"
						type="text"
						bind:value={deleteConfirmText}
						class="border border-gray-300 rounded-md p-2 w-40 focus:ring-red-500 focus:border-red-500"
						placeholder="2025"
					/>
				</div>
				<button
					on:click={handleDelete}
					disabled={deleting}
					class="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
				>
					{deleting ? 'মুছে ফেলা হচ্ছে...' : 'স্থায়ীভাবে মুছে ফেলুন'}
				</button>
			</div>
		</div>

		{#if deleteLogLines.length}
			<pre
				class="bg-gray-900 text-gray-100 text-xs rounded-md p-4 mt-4 overflow-x-auto whitespace-pre-wrap">{deleteLogLines.join(
					'\n'
				)}</pre>
		{/if}

		{#if deleteReport}
			<div class="mt-4">
				<h3 class="font-semibold text-gray-900 mb-2">ফলাফল</h3>
				<pre class="text-xs bg-gray-50 rounded-md p-4 overflow-x-auto">{JSON.stringify(
						deleteReport,
						null,
						2
					)}</pre>
			</div>
		{/if}
	</div>
</div>

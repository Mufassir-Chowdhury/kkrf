<script>
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { migrateLegacyYear } from '$lib/migrateLegacyYear';

	let sourceYear = '2025';
	let running = false;
	let logLines = [];
	let report = null;

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
			<code>scholarships/&#123;year&#125;/...</code> সাবকালেকশন স্ট্রাকচারে কপি করে। এটি বারবার চালানো যাবে
			(ওভাররাইট করবে, ডুপ্লিকেট তৈরি করবে না) এবং পুরনো ডেটা মুছে ফেলবে না।
		</p>
		<div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
			<div>
				<label for="sourceYear" class="block text-sm font-medium text-gray-700 mb-1">সোর্স বছর</label>
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

	{#if logLines.length}
		<div class="card">
			<h3 class="font-semibold text-gray-900 mb-2">লগ</h3>
			<pre class="bg-gray-900 text-gray-100 text-xs rounded-md p-4 overflow-x-auto whitespace-pre-wrap">{logLines.join(
					'\n'
				)}</pre>
		</div>
	{/if}

	{#if report}
		<div class="card">
			<h3 class="font-semibold text-gray-900 mb-2">
				ফলাফল — {report.verified ? '✅ যাচাই সফল' : '⚠️ যাচাই ব্যর্থ, লগ দেখুন'}
			</h3>
			<pre class="text-xs bg-gray-50 rounded-md p-4 overflow-x-auto">{JSON.stringify(report, null, 2)}</pre>
		</div>
	{/if}
</div>

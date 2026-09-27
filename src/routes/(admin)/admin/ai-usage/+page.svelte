<script>
	import { onMount } from 'svelte';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import {
		AI_MODELS,
		quotaClock,
		nextQuotaReset,
		recentQuotaDays,
		loadUsageDays,
		loadAiLimits,
		saveAiLimits
	} from '$lib/aiUsage';

	const HISTORY_DAYS = 7;

	let loading = true;
	let saving = false;
	let error = '';
	let days = [];
	let limits = {};
	let loadedAt = null;

	onMount(load);

	async function load() {
		loading = true;
		error = '';
		try {
			const [usage, savedLimits] = await Promise.all([
				loadUsageDays(recentQuotaDays(HISTORY_DAYS)),
				loadAiLimits()
			]);
			days = usage;
			limits = Object.fromEntries(
				AI_MODELS.map((m) => [m, { rpm: '', tpm: '', rpd: '', ...savedLimits[m] }])
			);
			loadedAt = new Date();
		} catch (err) {
			console.error('Error loading AI usage:', err);
			error = 'ব্যবহারের তথ্য লোড করা যায়নি।';
		}
		loading = false;
	}

	async function handleSave() {
		saving = true;
		try {
			const cleaned = Object.fromEntries(
				AI_MODELS.map((m) => [
					m,
					Object.fromEntries(
						['rpm', 'tpm', 'rpd'].map((k) => [k, limits[m][k] === '' || limits[m][k] == null ? null : Number(limits[m][k])])
					)
				])
			);
			await saveAiLimits(cleaned);
			alert('লিমিট সংরক্ষণ করা হয়েছে।');
		} catch (err) {
			console.error('Error saving AI limits:', err);
			alert('সংরক্ষণ করতে সমস্যা হয়েছে।');
		} finally {
			saving = false;
		}
	}

	const fmt = (n) => (n == null || Number.isNaN(n) ? '—' : Math.round(n).toLocaleString('en-US'));
	const pct = (used, limit) => (limit ? Math.min(100, (used / limit) * 100) : 0);
	const barColor = (p) => (p >= 90 ? 'bg-red-500' : p >= 70 ? 'bg-yellow-500' : 'bg-green-500');

	function modelStats(day, model, lim) {
		const u = day?.models?.[model] ?? {};
		const requests = u.requests ?? 0;
		const minutes = Object.values(u.minutes ?? {});
		const avgTokens = requests ? (u.totalTokens ?? 0) / requests : null;
		const peakRpm = minutes.length ? Math.max(...minutes) : 0;
		const currentRpm = u.minutes?.[quotaClock().minute] ?? 0;
		// Forms/min is capped by whichever is tighter: RPM, or TPM ÷ tokens per form.
		const byTpm = lim?.tpm && avgTokens ? Math.floor(lim.tpm / avgTokens) : null;
		const formsPerMin = [lim?.rpm || null, byTpm].filter((x) => x != null);
		return {
			requests,
			errors: u.errors ?? 0,
			rateLimited: u.rateLimited ?? 0,
			promptTokens: u.promptTokens ?? 0,
			outputTokens: u.outputTokens ?? 0,
			totalTokens: u.totalTokens ?? 0,
			avgTokens,
			peakRpm,
			currentRpm,
			peakTpm: avgTokens ? peakRpm * avgTokens : 0,
			remaining: lim?.rpd ? Math.max(0, lim.rpd - requests) : null,
			formsPerMin: formsPerMin.length ? Math.min(...formsPerMin) : null
		};
	}

	function dayTotals(day) {
		const ms = Object.values(day.models ?? {});
		const sum = (k) => ms.reduce((a, m) => a + (m[k] ?? 0), 0);
		return { requests: sum('requests'), tokens: sum('totalTokens'), errors: sum('errors'), rateLimited: sum('rateLimited') };
	}

	$: today = days[0];
	$: stats = Object.fromEntries(AI_MODELS.map((m) => [m, modelStats(today, m, limits[m])]));
	$: remainingToday = AI_MODELS.every((m) => stats[m]?.remaining != null)
		? AI_MODELS.reduce((a, m) => a + stats[m].remaining, 0)
		: null;
	// Most recent quota Google reported on a 429, per model.
	$: detected = days
		.slice()
		.reverse()
		.reduce((acc, d) => {
			for (const [m, q] of Object.entries(d.detectedLimits ?? {})) acc[m] = { ...acc[m], ...q };
			return acc;
		}, {});
	$: lastRateLimit = days.find((d) => d.lastRateLimit)?.lastRateLimit;
	$: resetAt = loadedAt ? nextQuotaReset(loadedAt) : null;
</script>

<svelte:head>
	<title>AI ব্যবহার - Admin Dashboard</title>
</svelte:head>

<BreadCrumb
	links={[
		{ url: '/admin', label: 'Home' },
		{ url: '#', label: 'AI ব্যবহার' }
	]}
/>

{#if loading}
	<div class="text-center py-12 text-gray-500">Loading...</div>
{:else if error}
	<p class="text-center text-red-600 py-12">{error}</p>
{:else}
	<div class="space-y-8 mt-6">
		<div class="card space-y-4">
			<div class="flex flex-wrap justify-between items-start gap-4">
				<div>
					<span class="section-eyebrow">ফরম স্ক্যান · Gemini</span>
					<h2 class="section-title">AI ব্যবহার ও লিমিট</h2>
					<p class="text-gray-500 text-sm mt-1">
						প্রতিটি স্ক্যান = ১টি রিকোয়েস্ট। দৈনিক কোটা রিসেট হয় Pacific সময় রাত ১২টায়
						{#if resetAt}(পরবর্তী রিসেট: <span class="font-semibold">{resetAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>, আপনার সময়ে){/if}।
						এই হিসাব শুধু এই ওয়েবসাইট থেকে করা স্ক্যানের — একই API key অন্য কোথাও ব্যবহার হলে তা এখানে দেখাবে না।
					</p>
				</div>
				<button
					on:click={load}
					class="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5"
				>
					↻ রিফ্রেশ
				</button>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div class="rounded-md bg-gray-50 p-4">
					<p class="text-xs text-gray-500">আজকের স্ক্যান</p>
					<p class="text-2xl font-bold text-primary-900">{fmt(dayTotals(today).requests)}</p>
				</div>
				<div class="rounded-md bg-gray-50 p-4">
					<p class="text-xs text-gray-500">আজকের টোকেন</p>
					<p class="text-2xl font-bold text-primary-900">{fmt(dayTotals(today).tokens)}</p>
				</div>
				<div class="rounded-md bg-gray-50 p-4">
					<p class="text-xs text-gray-500">আজ আরও যত স্ক্যান করা যাবে</p>
					<p class="text-2xl font-bold text-primary-900">{remainingToday == null ? '—' : fmt(remainingToday)}</p>
					{#if remainingToday == null}<p class="text-xs text-gray-400">নিচে RPD লিমিট দিন</p>{/if}
				</div>
				<div class="rounded-md bg-gray-50 p-4">
					<p class="text-xs text-gray-500">ব্যর্থ / রেট লিমিটেড</p>
					<p class="text-2xl font-bold text-primary-900">{fmt(dayTotals(today).errors)} / {fmt(dayTotals(today).rateLimited)}</p>
				</div>
			</div>

			{#if lastRateLimit}
				<div class="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
					<p class="font-semibold">
						সর্বশেষ রেট লিমিট: {lastRateLimit.model} — {lastRateLimit.at?.toDate?.().toLocaleString('en-GB') ?? ''}
					</p>
					<p class="text-xs mt-1 break-words">{lastRateLimit.message}</p>
				</div>
			{/if}
		</div>

		{#each AI_MODELS as model, i}
			{@const s = stats[model]}
			{@const lim = limits[model]}
			<div class="card space-y-4">
				<div>
					<span class="section-eyebrow">{i === 0 ? 'প্রধান মডেল' : 'বিকল্প মডেল (প্রধানটি ব্যস্ত/লিমিটে পৌঁছালে)'}</span>
					<h3 class="text-lg font-semibold text-primary-900">{model}</h3>
				</div>

				<div class="space-y-3 text-sm">
					<div>
						<div class="flex justify-between"><span>আজকের রিকোয়েস্ট (RPD)</span><span>{fmt(s.requests)} / {fmt(lim.rpd || null)}</span></div>
						{#if lim.rpd}
							<div class="h-2 bg-gray-200 rounded"><div class="h-2 rounded {barColor(pct(s.requests, lim.rpd))}" style="width: {pct(s.requests, lim.rpd)}%"></div></div>
						{/if}
					</div>
					<div>
						<div class="flex justify-between"><span>আজকের সর্বোচ্চ রিকোয়েস্ট/মিনিট (RPM)</span><span>{fmt(s.peakRpm)} / {fmt(lim.rpm || null)}</span></div>
						{#if lim.rpm}
							<div class="h-2 bg-gray-200 rounded"><div class="h-2 rounded {barColor(pct(s.peakRpm, lim.rpm))}" style="width: {pct(s.peakRpm, lim.rpm)}%"></div></div>
						{/if}
					</div>
					<div>
						<div class="flex justify-between"><span>আজকের সর্বোচ্চ টোকেন/মিনিট (TPM, আনুমানিক)</span><span>{fmt(s.peakTpm)} / {fmt(lim.tpm || null)}</span></div>
						{#if lim.tpm}
							<div class="h-2 bg-gray-200 rounded"><div class="h-2 rounded {barColor(pct(s.peakTpm, lim.tpm))}" style="width: {pct(s.peakTpm, lim.tpm)}%"></div></div>
						{/if}
					</div>
				</div>

				<dl class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
					<div><dt class="text-gray-500 text-xs">প্রতি ফরমে গড় টোকেন</dt><dd class="font-semibold">{fmt(s.avgTokens)}</dd></div>
					<div><dt class="text-gray-500 text-xs">ইনপুট / আউটপুট টোকেন</dt><dd class="font-semibold">{fmt(s.promptTokens)} / {fmt(s.outputTokens)}</dd></div>
					<div><dt class="text-gray-500 text-xs">আজ বাকি স্ক্যান</dt><dd class="font-semibold">{fmt(s.remaining)}</dd></div>
					<div><dt class="text-gray-500 text-xs">সর্বোচ্চ স্ক্যান/মিনিট</dt><dd class="font-semibold">{fmt(s.formsPerMin)}</dd></div>
				</dl>

				{#if detected[model]}
					<div class="text-xs text-gray-600 bg-gray-50 rounded-md p-3">
						<p class="font-semibold mb-1">Google-এর জানানো লিমিট (429 এরর থেকে):</p>
						{#each Object.entries(detected[model]) as [quotaId, value]}
							<p>{quotaId}: <span class="font-semibold">{fmt(value)}</span></p>
						{/each}
					</div>
				{/if}
			</div>
		{/each}

		<div class="card space-y-4">
			<div>
				<span class="section-eyebrow">সেটিংস</span>
				<h3 class="text-lg font-semibold text-primary-900">লিমিট</h3>
				<p class="text-gray-500 text-sm mt-1">
					Google এই লিমিটগুলো API দিয়ে জানায় না। <a href="https://aistudio.google.com/rate-limit" target="_blank" rel="noopener" class="text-primary-700 underline">AI Studio → Rate limit</a>
					পাতা থেকে প্রতিটি মডেলের RPM, TPM ও RPD দেখে এখানে লিখুন। লিমিটে পৌঁছালে Google যা জানায় তা উপরে আপনাআপনি দেখাবে।
				</p>
			</div>
			<div class="space-y-2">
				<div class="hidden sm:grid grid-cols-[1fr_7rem_7rem_7rem] gap-2 text-xs font-semibold text-gray-500 uppercase">
					<span>মডেল</span><span>RPM</span><span>TPM</span><span>RPD</span>
				</div>
				{#each AI_MODELS as model}
					<div class="grid grid-cols-3 sm:grid-cols-[1fr_7rem_7rem_7rem] gap-2 items-center">
						<span class="col-span-3 sm:col-span-1 text-sm font-medium">{model}</span>
						{#each ['rpm', 'tpm', 'rpd'] as key}
							<input
								type="number"
								min="0"
								bind:value={limits[model][key]}
								placeholder={key.toUpperCase()}
								class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
							/>
						{/each}
					</div>
				{/each}
			</div>
			<div class="flex justify-end">
				<button on:click={handleSave} disabled={saving} class="btn-primary disabled:opacity-50">
					{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
				</button>
			</div>
		</div>

		<div class="card space-y-3">
			<h3 class="text-lg font-semibold text-primary-900">গত {HISTORY_DAYS} দিন</h3>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="text-left text-xs text-gray-500 uppercase">
							<th class="py-2 pr-4">দিন (Pacific)</th>
							<th class="py-2 pr-4">স্ক্যান</th>
							<th class="py-2 pr-4">টোকেন</th>
							<th class="py-2 pr-4">ব্যর্থ</th>
							<th class="py-2">রেট লিমিটেড</th>
						</tr>
					</thead>
					<tbody>
						{#each days as day}
							{@const t = dayTotals(day)}
							<tr class="border-t border-gray-100">
								<td class="py-2 pr-4">{day.day}</td>
								<td class="py-2 pr-4">{fmt(t.requests)}</td>
								<td class="py-2 pr-4">{fmt(t.tokens)}</td>
								<td class="py-2 pr-4">{fmt(t.errors)}</td>
								<td class="py-2">{fmt(t.rateLimited)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}

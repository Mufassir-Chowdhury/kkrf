<script>
	import { onMount } from 'svelte';
	import { query, where, getCountFromServer } from 'firebase/firestore';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { selectedYear, loadAdminYear, offlineCol } from '$lib/yearScope';
	import {
		getBranches,
		saveBranches,
		cloneDefaultBranches,
		ONLINE_BRANCH_CODE
	} from '$lib/branches';

	let year = null;
	let loading = true;
	let saving = false;
	let branches = [];
	let errors = [];

	onMount(() => {
		loadAdminYear();
	});

	$: if ($selectedYear && $selectedYear !== year) {
		year = $selectedYear;
		load();
	}

	async function load() {
		loading = true;
		errors = [];
		branches = (await getBranches(year)).map((b) => ({ ...b }));
		loading = false;
	}

	function addBranch() {
		branches = [...branches, { code: '', name: '' }];
	}

	async function removeBranch(index) {
		const b = branches[index];
		const code = (b.code || '').trim();
		if (code === ONLINE_BRANCH_CODE) {
			alert(`কোড ${ONLINE_BRANCH_CODE} (অনলাইন) মুছে ফেলা যাবে না — অনলাইন থেকে অফলাইনে ট্রান্সফার করা রেজিস্ট্রেশন এই শাখায় যায়।`);
			return;
		}
		if (code) {
			let count = 0;
			try {
				const snap = await getCountFromServer(query(offlineCol(year), where('branch', '==', code)));
				count = snap.data().count;
			} catch (err) {
				console.error('Error counting branch registrations:', err);
			}
			const msg = count
				? `"${b.name || code}" শাখায় ${year} সালে ${count}টি রেজিস্ট্রেশন আছে। তালিকা থেকে সরালেও রেজিস্ট্রেশনগুলো মুছবে না, তবে শাখার তালিকায় দেখাবে না। সরাতে চান?`
				: `"${b.name || code}" শাখাটি তালিকা থেকে সরাতে চান?`;
			if (!confirm(msg)) return;
		}
		branches = branches.filter((_, i) => i !== index);
	}

	function move(index, delta) {
		const target = index + delta;
		if (target < 0 || target >= branches.length) return;
		const next = [...branches];
		[next[index], next[target]] = [next[target], next[index]];
		branches = next;
	}

	function resetToDefault() {
		if (!confirm('ডিফল্ট শাখার তালিকা লোড করতে চান? (সংরক্ষণ না করা পর্যন্ত কিছু পরিবর্তন হবে না)')) return;
		branches = cloneDefaultBranches();
	}

	function validate(list) {
		const errs = [];
		const seen = new Set();
		list.forEach((b, i) => {
			const row = i + 1;
			if (!/^\d+$/.test(b.code)) errs.push(`সারি ${row}: কোড শুধুমাত্র ইংরেজি সংখ্যা হতে হবে।`);
			else if (seen.has(b.code)) errs.push(`সারি ${row}: কোড ${b.code} একাধিকবার আছে।`);
			seen.add(b.code);
			if (!b.name) errs.push(`সারি ${row}: শাখার নাম লিখুন।`);
		});
		if (!seen.has(ONLINE_BRANCH_CODE)) {
			errs.push(`কোড ${ONLINE_BRANCH_CODE} (অনলাইন) তালিকায় থাকতে হবে।`);
		}
		return errs;
	}

	async function handleSave() {
		const cleaned = branches
			.map((b) => ({ code: (b.code || '').trim(), name: (b.name || '').trim() }))
			.filter((b) => b.code || b.name);

		errors = validate(cleaned);
		if (errors.length) return;

		saving = true;
		try {
			await saveBranches(year, cleaned);
			branches = cleaned;
			alert(`${year} সালের শাখার তালিকা সংরক্ষণ করা হয়েছে।`);
		} catch (err) {
			console.error('Error saving branches:', err);
			alert('সংরক্ষণ করতে সমস্যা হয়েছে।');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>শাখার তালিকা - Admin Dashboard</title>
</svelte:head>

<BreadCrumb
	links={[
		{ url: '/admin', label: 'Home' },
		{ url: '#', label: 'শাখার তালিকা' }
	]}
/>

{#if loading}
	<div class="text-center py-12 text-gray-500">Loading...</div>
{:else}
	<div class="space-y-8 mt-6">
		<div class="card space-y-6">
			<div class="flex flex-wrap justify-between items-start gap-4">
				<div>
					<span class="section-eyebrow">সেটিংস · {year}</span>
					<h2 class="section-title">শাখার তালিকা</h2>
					<p class="text-gray-500 text-sm mt-1">
						অফলাইন রেজিস্ট্রেশনের শাখাগুলো (/offline পাতা ও অ্যাডমিন রেজিস্ট্রেশন তালিকা)। প্রতিটি বছরের
						তালিকা আলাদা — উপরের বছর পরিবর্তন করে অন্য বছরের তালিকা সম্পাদনা করুন। কোড দিয়ে সিরিয়াল শুরু
						হয় (যেমন কোড 5 → 5001)।
					</p>
				</div>
				<button
					on:click={resetToDefault}
					class="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5"
				>
					ডিফল্ট তালিকা
				</button>
			</div>

			<div class="space-y-2">
				<div class="hidden sm:grid grid-cols-[6rem_1fr_auto] gap-2 text-xs font-semibold text-gray-500 uppercase">
					<span>কোড</span>
					<span>শাখার নাম</span>
					<span class="w-24"></span>
				</div>
				{#each branches as branch, i}
					<div class="grid grid-cols-[6rem_1fr_auto] gap-2 items-center">
						<input
							type="text"
							inputmode="numeric"
							bind:value={branch.code}
							placeholder="কোড"
							class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
						/>
						<input
							type="text"
							bind:value={branch.name}
							placeholder="শাখার নাম"
							class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
						/>
						<div class="flex items-center w-24 justify-end">
							<button
								on:click={() => move(i, -1)}
								disabled={i === 0}
								class="text-gray-500 hover:text-gray-900 px-1.5 py-2 disabled:opacity-30"
								title="উপরে"
							>
								↑
							</button>
							<button
								on:click={() => move(i, 1)}
								disabled={i === branches.length - 1}
								class="text-gray-500 hover:text-gray-900 px-1.5 py-2 disabled:opacity-30"
								title="নিচে"
							>
								↓
							</button>
							<button
								on:click={() => removeBranch(i)}
								class="text-red-500 hover:text-red-700 text-sm px-2 py-2"
								title="মুছে ফেলুন"
							>
								✕
							</button>
						</div>
					</div>
				{/each}
				{#if !branches.length}
					<p class="text-sm text-gray-400">কোনো শাখা যোগ করা হয়নি।</p>
				{/if}
				<button on:click={addBranch} class="text-sm font-medium text-primary-700 hover:text-primary-900">
					+ শাখা যোগ করুন
				</button>
			</div>

			{#if errors.length}
				<ul class="text-sm text-red-600 space-y-1">
					{#each errors as err}
						<li>{err}</li>
					{/each}
				</ul>
			{/if}

			<div class="flex justify-end">
				<button on:click={handleSave} disabled={saving} class="btn-primary disabled:opacity-50">
					{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
				</button>
			</div>
		</div>
	</div>
{/if}

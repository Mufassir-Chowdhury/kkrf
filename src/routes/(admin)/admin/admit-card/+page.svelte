<script>
	import { onMount } from 'svelte';
	import { selectedYear, loadAdminYear } from '$lib/yearScope';
	import { getScholarship } from '$lib/siteData';
	import { admitCardOf } from '$lib/admitCard';

	// One-off admit cards are not saved anywhere: the form just opens the
	// printable /admit/blank page with its fields filled from the query string.

	const classOptions = [
		{ value: '৪র্থ', label: '৪র্থ শ্রেণি' },
		{ value: '৫ম', label: '৫ম শ্রেণি' },
		{ value: '৬ষ্ঠ', label: '৬ষ্ঠ শ্রেণি' },
		{ value: '৭ম', label: '৭ম শ্রেণি' },
		{ value: '৮ম', label: '৮ম শ্রেণি' },
		{ value: '৯ম', label: '৯ম শ্রেণি' },
		{ value: '১০ম', label: '১০ম শ্রেণি' }
	];

	const emptyForm = () => ({
		roll: '',
		serial: '',
		name: '',
		fatherName: '',
		mobile: '',
		institution: '',
		class: '',
		gender: '',
		institutionType: '',
		presentAddress: '',
		center: ''
	});

	let form = emptyForm();
	let year = null;
	let centers = admitCardOf(null).centers;

	onMount(async () => {
		year = await loadAdminYear();
	});

	// Follow the header year switcher so the card shows that year's centers/schedule.
	$: if ($selectedYear) year = $selectedYear;
	$: if (year) loadCenters(year);

	async function loadCenters(y) {
		centers = admitCardOf(await getScholarship(String(y))).centers;
	}

	function cardUrl(values) {
		const params = new URLSearchParams();
		if (year) params.set('year', String(year));
		for (const [key, value] of Object.entries(values)) {
			if (String(value).trim()) params.set(key, String(value).trim());
		}
		return `/admit/blank?${params}`;
	}

	function openCard() {
		window.open(cardUrl(form), '_blank');
	}

	const input = 'mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2';
</script>

<svelte:head>
	<title>Admit Cards - Admin</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<span class="section-eyebrow">প্রবেশপত্র</span>
			<h2 class="section-title">Admit Cards</h2>
		</div>
		<a
			href={cardUrl({})}
			target="_blank"
			rel="noopener"
			class="bg-secondary-600 text-white py-2 px-6 rounded-md hover:bg-secondary-700 transition-colors font-semibold shadow-card"
		>
			Blank Admit Card
		</a>
	</div>

	<form on:submit|preventDefault={openCard} class="card p-6 space-y-6 max-w-3xl">
		<div>
			<h3 class="text-lg font-semibold text-primary-900">One-off Admit Card</h3>
			<p class="text-gray-500 text-sm">
				Fill in what you need and leave the rest empty — empty fields stay blank on the card. Nothing is saved.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="roll" class="block text-sm font-medium text-gray-700">রোল</label>
				<input id="roll" bind:value={form.roll} class={input} inputmode="numeric" />
			</div>
			<div>
				<label for="serial" class="block text-sm font-medium text-gray-700">সিরিয়াল</label>
				<input id="serial" bind:value={form.serial} class={input} />
			</div>
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700">পরীক্ষার্থীর নাম</label>
				<input id="name" bind:value={form.name} class={input} />
			</div>
			<div>
				<label for="fatherName" class="block text-sm font-medium text-gray-700">পিতার নাম</label>
				<input id="fatherName" bind:value={form.fatherName} class={input} />
			</div>
			<div>
				<label for="mobile" class="block text-sm font-medium text-gray-700">মোবাইল</label>
				<input id="mobile" bind:value={form.mobile} class={input} inputmode="tel" />
			</div>
			<div>
				<label for="class" class="block text-sm font-medium text-gray-700">শ্রেণি</label>
				<select id="class" bind:value={form.class} class={input}>
					<option value="">—</option>
					{#each classOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
			<div class="md:col-span-2">
				<label for="institution" class="block text-sm font-medium text-gray-700">প্রতিষ্ঠানের নাম</label>
				<input id="institution" bind:value={form.institution} class={input} />
			</div>
			<div class="md:col-span-2">
				<label for="presentAddress" class="block text-sm font-medium text-gray-700">ঠিকানা</label>
				<input id="presentAddress" bind:value={form.presentAddress} class={input} />
			</div>
			<div class="md:col-span-2">
				<label for="center" class="block text-sm font-medium text-gray-700">পরীক্ষার কেন্দ্র</label>
				<select id="center" bind:value={form.center} class={input}>
					<option value="">রোল অনুযায়ী (রোলের প্রথম অঙ্ক)</option>
					{#each centers as c}
						<option value={c.number}>{c.number} — {c.name}</option>
					{/each}
				</select>
			</div>
			<div class="flex flex-wrap gap-4">
				<label class="inline-flex items-center">
					<input type="radio" bind:group={form.gender} value="male" class="form-radio" />
					<span class="ml-2">ছাত্র</span>
				</label>
				<label class="inline-flex items-center">
					<input type="radio" bind:group={form.gender} value="female" class="form-radio" />
					<span class="ml-2">ছাত্রী</span>
				</label>
			</div>
			<div class="flex flex-wrap gap-4">
				<label class="inline-flex items-center">
					<input type="radio" bind:group={form.institutionType} value="school" class="form-radio" />
					<span class="ml-2">স্কুল</span>
				</label>
				<label class="inline-flex items-center">
					<input type="radio" bind:group={form.institutionType} value="madrasa" class="form-radio" />
					<span class="ml-2">মাদরাসা</span>
				</label>
			</div>
		</div>

		<div class="flex flex-wrap gap-3">
			<button
				type="submit"
				class="bg-primary-900 text-white py-2 px-6 rounded-md hover:bg-primary-800 transition-colors font-semibold shadow-card"
			>
				Open Admit Card
			</button>
			<button
				type="button"
				on:click={() => (form = emptyForm())}
				class="py-2 px-6 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-semibold"
			>
				Clear
			</button>
		</div>
	</form>
</div>

<script>
	import { createEventDispatcher } from 'svelte';
	import { compressImage } from '$lib/compressImage';
	import { extractForm } from '$lib/gemini';

	const dispatch = createEventDispatcher();

	let input;
	let scanning = false;
	let error = '';

	async function handleFile(e) {
		const file = e.target.files?.[0];
		e.target.value = ''; // allow re-selecting the same photo
		if (!file) return;

		scanning = true;
		error = '';
		try {
			const { data } = await extractForm(await compressImage(file));
			dispatch('result', data);
		} catch (err) {
			console.error('Scan failed:', err);
			const busy = err.status === 429 || err.status === 503;
			error = busy ? 'AI সার্ভার ব্যস্ত, একটু পরে আবার চেষ্টা করুন।' : 'ফরম পড়া যায়নি, আবার চেষ্টা করুন।';
		}
		scanning = false;
	}
</script>

<div class="text-center space-y-2">
	<input bind:this={input} type="file" accept="image/*" capture="environment" class="hidden" on:change={handleFile} />
	<button
		type="button"
		on:click={() => input.click()}
		disabled={scanning}
		class="bg-secondary-700 text-white py-2.5 px-6 rounded-md hover:bg-secondary-800 transition-colors font-semibold shadow-card disabled:bg-gray-400"
	>
		{scanning ? 'ফরম পড়া হচ্ছে...' : '📷 ফরম স্ক্যান করুন'}
	</button>
	{#if error}
		<p class="text-red-500 text-sm">{error}</p>
	{/if}
</div>

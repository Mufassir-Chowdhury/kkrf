<script>
	import { onMount } from 'svelte';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { getSiteInfo, saveSiteInfo, DEFAULT_SITE_INFO } from '$lib/siteData';

	let loading = true;
	let saving = false;
	let siteInfo = { ...DEFAULT_SITE_INFO };

	onMount(async () => {
		loading = true;
		try {
			siteInfo = await getSiteInfo();
		} catch (err) {
			console.error('Error loading site info:', err);
		} finally {
			loading = false;
		}
	});

	function addContactPerson() {
		siteInfo.contactPersons = [...(siteInfo.contactPersons || []), { name: '', phone: '' }];
	}
	function removeContactPerson(index) {
		siteInfo.contactPersons = siteInfo.contactPersons.filter((_, i) => i !== index);
	}

	async function handleSaveSiteInfo() {
		saving = true;
		try {
			const payload = {
				...siteInfo,
				contactPersons: (siteInfo.contactPersons || []).filter((p) => p.name || p.phone)
			};
			await saveSiteInfo(payload);
			alert('তথ্য সংরক্ষণ করা হয়েছে।');
		} catch (err) {
			console.error('Error saving site info:', err);
			alert('তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>প্রতিষ্ঠানের তথ্য - Admin Dashboard</title>
</svelte:head>

<BreadCrumb
	links={[
		{ url: '/admin', label: 'Home' },
		{ url: '#', label: 'প্রতিষ্ঠানের তথ্য' }
	]}
/>

{#if loading}
	<div class="text-center py-12 text-gray-500">Loading...</div>
{:else}
	<div class="space-y-8 mt-6">
		<div class="card space-y-6">
			<div>
				<span class="section-eyebrow">সেটিংস</span>
				<h2 class="section-title">প্রতিষ্ঠানের তথ্য</h2>
				<p class="text-gray-500 text-sm mt-1">
					এই তথ্য পুরো ওয়েবসাইট জুড়ে (ফুটার, যোগাযোগ পাতা, হোমপেজ) ব্যবহৃত হয়।
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-1">অফিসের ঠিকানা</label>
					<input
						type="text"
						bind:value={siteInfo.address}
						class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">প্রধান ফোন নাম্বার</label>
					<input
						type="text"
						bind:value={siteInfo.phone}
						class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
					<input
						type="text"
						bind:value={siteInfo.email}
						class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
					/>
				</div>
				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-1">অফিস সময়</label>
					<input
						type="text"
						bind:value={siteInfo.officeTime}
						class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
					<input
						type="text"
						bind:value={siteInfo.facebook}
						class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
					<input
						type="text"
						bind:value={siteInfo.instagram}
						class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
					/>
				</div>
			</div>

			<div>
				<div class="flex justify-between items-center mb-2">
					<label class="block text-sm font-medium text-gray-700">যোগাযোগের ব্যক্তিবর্গ</label>
					<button
						on:click={addContactPerson}
						class="text-sm font-medium text-primary-700 hover:text-primary-900"
					>
						+ যোগ করুন
					</button>
				</div>
				<div class="space-y-3">
					{#each siteInfo.contactPersons || [] as person, i}
						<div class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-start">
							<input
								type="text"
								bind:value={person.name}
								placeholder="নাম"
								class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
							/>
							<input
								type="text"
								bind:value={person.phone}
								placeholder="ফোন নাম্বার"
								class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
							/>
							<button
								on:click={() => removeContactPerson(i)}
								class="text-red-500 hover:text-red-700 text-sm px-2 py-2"
								title="মুছে ফেলুন"
							>
								✕
							</button>
						</div>
					{/each}
					{#if !(siteInfo.contactPersons || []).length}
						<p class="text-sm text-gray-400">কোনো যোগাযোগের ব্যক্তি যোগ করা হয়নি।</p>
					{/if}
				</div>
			</div>

			<div class="flex justify-end">
				<button on:click={handleSaveSiteInfo} disabled={saving} class="btn-primary disabled:opacity-50">
					{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
				</button>
			</div>
		</div>
	</div>
{/if}

<script>
	import { onMount } from 'svelte';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import {
		getGeneralSettings,
		setActiveScholarshipId,
		getScholarship,
		getAllScholarships,
		saveScholarship,
		setRegistrationOpen,
		getSiteInfo,
		saveSiteInfo,
		EMPTY_SCHOLARSHIP,
		DEFAULT_SITE_INFO
	} from '$lib/siteData';

	// Full 2025 dataset, used only to pre-fill the very first scholarship ever created
	// (i.e. when Firestore has nothing yet). After that, "clone from current" is used instead.
	const SEED_2025 = {
		year: '2025',
		registrationOpen: false,
		examDate: '০১ নভেম্বর ২০২৫',
		examDateNote: 'শনিবার (সম্ভাব্য)',
		regDeadline: "রেজিস্ট্রেশন ফরম সংগ্রহ ও জমাদানের সময়সীমা ১ আগস্ট থেকে ১৫ অক্টোবর'২৫।",
		prizeAmount: '৬,৫০,০০০/=',
		prizeNote: 'টাকার নগদ অর্থ, সনদপত্র ও আকর্ষণীয় পুরষ্কার',
		regFee: '২০০',
		bkashNumber: '01771144308',
		specialNote: 'সাধারণ জ্ঞানের জন্য (জানুয়ারি - জুলাই\'২৫) কিশোরকণ্ঠ এবং বিশেষ সংকলন "অন্বেষণ" সংগ্রহ করতে হবে।',
		examRules: [
			'৪র্থ, ৫ম, ৬ষ্ঠ, ৭ম, ৮ম, ৯ম ও ১০ম শ্রেণির ছাত্র-ছাত্রী (স্কুল-মাদরাসা) বৃত্তি পরীক্ষায় অংশগ্রহণ করতে পারবে।',
			'সিলেট বিভাগের যে কোন স্কুল-মাদরাসার ছাত্র-ছাত্রী পরীক্ষায় অংশগ্রহণ করতে পারবে।',
			'৬ষ্ঠ থেকে ১০ম শ্রেণির জন্য (MCQ পদ্ধতিতে) বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান বিষয়ে (প্রত্যেক বিষয়ে ৫০ নম্বর করে) সর্বমোট ২০০ নম্বরের পরীক্ষা অনুষ্ঠিত হবে।',
			'৪র্থ ও ৫ম শ্রেণির জন্য (MCQ পদ্ধতিতে) বাংলা, ইংরেজি, গণিত ও সাধারণ বিজ্ঞান বিষয়ে (প্রত্যেক বিষয়ে ৫০ নম্বর করে) সর্বমোট ২০০ নম্বরের পরীক্ষা অনুষ্ঠিত হবে।',
			'প্রয়োজনে পরীক্ষার তারিখ পরিবর্তন হতে পারে।',
			'ট্যালেন্টপুল, সাধারণ ও বিশেষ এই তিনটি গ্রেডে বৃত্তিপ্রাপ্ত ছাত্র-ছাত্রীদের এককালীন শিক্ষা ব্যয় বাবদ নগদ অর্থ, সনদপত্র ও আকর্ষণীয় পুরষ্কার প্রদান করা হবে।',
			'৪র্থ থেকে ১০ম শ্রেণি পর্যন্ত সকল রেজিস্ট্রেশন ফি ২০০/- (দুইশত টাকা)।'
		],
		offices: [
			{ name: 'পপি লাইব্রেরি', address: 'রাজা ম্যানশন, জিন্দাবাজার', phone: '০১৭৫২৮৩১১৮৪' },
			{ name: 'স্বাধীনতা লাইব্রেরি', address: 'শাহজালাল জামেয়ার পাশে, মদিনা মার্কেট', phone: '০১৭৫২৮৩১১৮৪' },
			{ name: 'সৌম্য এন্টারপ্রাইজ', address: 'ব্লু-বার্ড জুনিয়র স্কুলের বিপরীতে, মিরের ময়দান', phone: '০১৩০০২০৮১৮৮' },
			{ name: 'ঢাকা বুক ডিপো এন্ড স্টেশনারী', address: '১নং ঈসমাইল টাওয়ার, ইসলামী ব্যাংকের বিপরীতে, লালদিঘীরপার, সিলেট।', phone: '০১৭৮২৮৪৭৪৩৯' },
			{ name: 'প্রভিন্সিয়াল লাইব্রেরি', address: 'আহমদ ম্যানশন, জিন্দাবাজার', phone: '০১৭৫২৮৩১১৮৪' },
			{ name: 'মনোরম লাইব্রেরি', address: 'ইবনে সিনার পাশে, রিকাবীবাজার', phone: '০১৭৭৯০৯৮৬৪৫' },
			{ name: 'ফ্রেন্ডস লাইব্রেরি', address: 'আম্বরখানা গার্লস এর বিপরীতে, হাউজিং স্টেট', phone: '০১৭৫২৮৩১১৮৪' }
		],
		syllabus: [
			{
				class: 'দশম শ্রেণি (স্কুল/মাদরাসা)',
				subjects: [
					{ name: 'বাংলা', topics: ['গদ্যঃ ১. শিক্ষা ও মনুষ্যত্ব, ২. মানুষ মুহাম্মদ সা., ৩. প্রবাস বন্ধু'] },
					{ name: 'English', topics: ['Unit: 7-8, 11, 13, 16'] },
					{ name: 'গণিত', topics: ['১. বীজগণিতঃ অধ্যায় - ২, ৩, ১১'] }
				]
			}
		]
	};

	let loading = true;
	let saving = false;
	let generalSettings = { activeScholarshipId: null };
	let activeScholarship = null;
	let allScholarships = [];
	let siteInfo = { ...DEFAULT_SITE_INFO };

	// Form state (structured copies, edited then saved explicitly)
	let form = { ...EMPTY_SCHOLARSHIP };
	let examRulesText = '';
	let syllabusText = '[]';
	let syllabusError = '';

	// New year form
	let newYear = '';
	let cloneFromActive = true;

	function toYearString(y) {
		return String(y).trim();
	}

	function loadFormFromScholarship(s) {
		form = { ...EMPTY_SCHOLARSHIP, ...s };
		examRulesText = (form.examRules || []).join('\n');
		syllabusText = JSON.stringify(form.syllabus || [], null, 2);
		syllabusError = '';
	}

	async function loadAll() {
		loading = true;
		try {
			generalSettings = await getGeneralSettings();
			activeScholarship = generalSettings.activeScholarshipId
				? await getScholarship(generalSettings.activeScholarshipId)
				: null;
			allScholarships = await getAllScholarships();
			siteInfo = await getSiteInfo();

			if (activeScholarship) {
				loadFormFromScholarship(activeScholarship);
			}

			const nextYear = new Date().getFullYear() + (allScholarships.length ? 1 : 0);
			newYear = toYearString(
				activeScholarship ? Number(activeScholarship.year || activeScholarship.id) + 1 : nextYear
			);
		} catch (err) {
			console.error('Error loading scholarship settings:', err);
		} finally {
			loading = false;
		}
	}

	onMount(loadAll);

	async function handleCreateScholarship() {
		const year = toYearString(newYear);
		if (!year) {
			alert('অনুগ্রহ করে একটি বছর লিখুন।');
			return;
		}
		if (allScholarships.some((s) => s.id === year)) {
			alert('এই বছরের একটি বৃত্তি ইতিমধ্যে বিদ্যমান।');
			return;
		}

		let base;
		if (cloneFromActive && activeScholarship) {
			base = { ...activeScholarship };
		} else if (allScholarships.length === 0) {
			base = { ...SEED_2025 };
		} else {
			base = { ...EMPTY_SCHOLARSHIP };
		}

		const newData = {
			...base,
			year,
			registrationOpen: false // new years always start closed until admin opens them
		};
		delete newData.id;

		if (
			!confirm(
				`"${year}" সালের নতুন বৃত্তি পরীক্ষা তৈরি করতে চান? এটি সাথে সাথে ওয়েবসাইটের সক্রিয় বৃত্তি হয়ে যাবে।`
			)
		) {
			return;
		}

		saving = true;
		try {
			await saveScholarship(year, newData);
			await setActiveScholarshipId(year);
			await loadAll();
			alert(`"${year}" সালের বৃত্তি পরীক্ষা তৈরি হয়েছে এবং সক্রিয় করা হয়েছে।`);
		} catch (err) {
			console.error('Error creating scholarship:', err);
			alert('নতুন বৃত্তি তৈরি করতে সমস্যা হয়েছে।');
		} finally {
			saving = false;
		}
	}

	async function handleToggleRegistration() {
		if (!activeScholarship) return;
		const newValue = !form.registrationOpen;
		try {
			await setRegistrationOpen(activeScholarship.id, newValue);
			form.registrationOpen = newValue;
			activeScholarship.registrationOpen = newValue;
			allScholarships = allScholarships.map((s) =>
				s.id === activeScholarship.id ? { ...s, registrationOpen: newValue } : s
			);
		} catch (err) {
			console.error('Error toggling registration:', err);
			alert('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।');
		}
	}

	function addOffice() {
		form.offices = [...(form.offices || []), { name: '', address: '', phone: '' }];
	}
	function removeOffice(index) {
		form.offices = form.offices.filter((_, i) => i !== index);
	}

	async function handleSaveScholarship() {
		if (!activeScholarship) return;

		let parsedSyllabus;
		try {
			parsedSyllabus = JSON.parse(syllabusText);
			syllabusError = '';
		} catch (err) {
			syllabusError = 'সিলেবাস JSON সঠিক নয়। অনুগ্রহ করে ফরম্যাট যাচাই করুন।';
			return;
		}

		const payload = {
			...form,
			examRules: examRulesText
				.split('\n')
				.map((r) => r.trim())
				.filter(Boolean),
			offices: (form.offices || []).filter((o) => o.name || o.address || o.phone),
			syllabus: parsedSyllabus
		};
		delete payload.id;

		saving = true;
		try {
			await saveScholarship(activeScholarship.id, payload);
			await loadAll();
			alert('সংরক্ষণ করা হয়েছে।');
		} catch (err) {
			console.error('Error saving scholarship:', err);
			alert('সংরক্ষণ করতে সমস্যা হয়েছে।');
		} finally {
			saving = false;
		}
	}

	async function handleSetActive(id) {
		if (!confirm(`"${id}" সালের বৃত্তিকে সক্রিয় করতে চান?`)) return;
		try {
			await setActiveScholarshipId(id);
			await loadAll();
		} catch (err) {
			console.error('Error switching active scholarship:', err);
			alert('সক্রিয় বৃত্তি পরিবর্তন করতে সমস্যা হয়েছে।');
		}
	}

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
	<title>Scholarship Settings - Admin Dashboard</title>
</svelte:head>

<BreadCrumb
	links={[
		{ url: '/admin', label: 'Home' },
		{ url: '#', label: 'Scholarship Settings' }
	]}
/>

{#if loading}
	<div class="text-center py-12 text-gray-500">Loading...</div>
{:else}
	<div class="space-y-8 mt-6">
		<!-- Start New Scholarship Year -->
		<div class="card">
			<h2 class="section-title mb-1">নতুন বৃত্তি পরীক্ষা শুরু করুন</h2>
			<p class="text-gray-500 text-sm mb-4">
				একটি নতুন বছরের জন্য বৃত্তি পরীক্ষা তৈরি করুন। এটি স্বয়ংক্রিয়ভাবে ওয়েবসাইটের সক্রিয় বৃত্তি হয়ে যাবে।
			</p>
			<div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
				<div>
					<label for="newYear" class="block text-sm font-medium text-gray-700 mb-1">বছর</label>
					<input
						id="newYear"
						type="text"
						bind:value={newYear}
						class="border border-gray-300 rounded-md p-2 w-40 focus:ring-primary-500 focus:border-primary-500"
						placeholder="২০২৬"
					/>
				</div>
				<label class="inline-flex items-center gap-2 text-sm text-gray-700 mb-2 sm:mb-2.5">
					<input
						type="checkbox"
						bind:checked={cloneFromActive}
						disabled={!activeScholarship}
						class="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
					/>
					বর্তমান সক্রিয় বৃত্তি থেকে তথ্য কপি করুন (নিয়মাবলী, ঠিকানা, সিলেবাস)
				</label>
				<button
					on:click={handleCreateScholarship}
					disabled={saving}
					class="btn-primary disabled:opacity-50"
				>
					নতুন বৃত্তি তৈরি করুন
				</button>
			</div>
		</div>

		{#if activeScholarship}
			<!-- Active Scholarship Editor -->
			<div class="card space-y-6">
				<div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
					<div>
						<span class="section-eyebrow">সক্রিয় বৃত্তি</span>
						<h2 class="section-title">কিশোরকণ্ঠ মেধাবৃত্তি - {activeScholarship.year}</h2>
					</div>

					<button
						on:click={handleToggleRegistration}
						class="flex items-center gap-3 px-4 py-2 rounded-md border {form.registrationOpen
							? 'border-primary-300 bg-primary-50'
							: 'border-gray-300 bg-gray-50'} transition-colors"
					>
						<span
							class="relative inline-block w-11 h-6 rounded-full transition-colors {form.registrationOpen
								? 'bg-primary-700'
								: 'bg-gray-300'}"
						>
							<span
								class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform {form.registrationOpen
									? 'translate-x-5'
									: ''}"
							></span>
						</span>
						<span class="text-sm font-semibold {form.registrationOpen ? 'text-primary-800' : 'text-gray-600'}">
							রেজিস্ট্রেশন {form.registrationOpen ? 'খোলা আছে' : 'বন্ধ আছে'}
						</span>
					</button>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">পরীক্ষার তারিখ</label>
						<input
							type="text"
							bind:value={form.examDate}
							class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
							placeholder="০১ নভেম্বর ২০২৬"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">তারিখ সংক্রান্ত নোট</label>
						<input
							type="text"
							bind:value={form.examDateNote}
							class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
							placeholder="শনিবার (সম্ভাব্য)"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">বৃত্তির পরিমাণ</label>
						<input
							type="text"
							bind:value={form.prizeAmount}
							class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
							placeholder="৬,৫০,০০০/="
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">বৃত্তি সংক্রান্ত নোট</label>
						<input
							type="text"
							bind:value={form.prizeNote}
							class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">রেজিস্ট্রেশন ফি (টাকা)</label>
						<input
							type="text"
							bind:value={form.regFee}
							class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
							placeholder="২০০"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">বিকাশ নাম্বার (Personal)</label>
						<input
							type="text"
							bind:value={form.bkashNumber}
							class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
							placeholder="01XXXXXXXXX"
						/>
					</div>
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-700 mb-1">রেজিস্ট্রেশনের সময়সীমা</label>
						<input
							type="text"
							bind:value={form.regDeadline}
							class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
						/>
					</div>
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-700 mb-1">বিশেষ দ্রষ্টব্য</label>
						<textarea
							bind:value={form.specialNote}
							rows="2"
							class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
						></textarea>
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						বৃত্তি সম্পর্কিত তথ্য (প্রতি লাইনে একটি নিয়ম)
					</label>
					<textarea
						bind:value={examRulesText}
						rows="6"
						class="w-full border border-gray-300 rounded-md p-2 font-mono text-sm focus:ring-primary-500 focus:border-primary-500"
					></textarea>
				</div>

				<div>
					<div class="flex justify-between items-center mb-2">
						<label class="block text-sm font-medium text-gray-700">ফর্ম প্রাপ্তি ও জমা দেওয়ার ঠিকানা</label>
						<button
							on:click={addOffice}
							class="text-sm font-medium text-primary-700 hover:text-primary-900"
						>
							+ ঠিকানা যোগ করুন
						</button>
					</div>
					<div class="space-y-3">
						{#each form.offices || [] as office, i}
							<div class="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_1fr_auto] gap-2 items-start">
								<input
									type="text"
									bind:value={office.name}
									placeholder="প্রতিষ্ঠানের নাম"
									class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
								/>
								<input
									type="text"
									bind:value={office.address}
									placeholder="ঠিকানা"
									class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
								/>
								<input
									type="text"
									bind:value={office.phone}
									placeholder="ফোন"
									class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
								/>
								<button
									on:click={() => removeOffice(i)}
									class="text-red-500 hover:text-red-700 text-sm px-2 py-2"
									title="মুছে ফেলুন"
								>
									✕
								</button>
							</div>
						{/each}
						{#if !(form.offices || []).length}
							<p class="text-sm text-gray-400">কোনো ঠিকানা যোগ করা হয়নি।</p>
						{/if}
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						সিলেবাস (JSON ফরম্যাট)
					</label>
					<p class="text-xs text-gray-400 mb-2">
						ফরম্যাট: [{'{'}"class": "৪র্থ শ্রেণি", "subjects": [{'{'}"name": "বাংলা", "topics":
						["..."]{'}'}]{'}'}]
					</p>
					<textarea
						bind:value={syllabusText}
						rows="10"
						class="w-full border border-gray-300 rounded-md p-2 font-mono text-xs focus:ring-primary-500 focus:border-primary-500"
					></textarea>
					{#if syllabusError}
						<p class="text-red-600 text-sm mt-1">{syllabusError}</p>
					{/if}
				</div>

				<div class="flex justify-end">
					<button on:click={handleSaveScholarship} disabled={saving} class="btn-primary disabled:opacity-50">
						{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
					</button>
				</div>
			</div>
		{:else}
			<div class="card text-center text-gray-500">
				এখনো কোনো সক্রিয় বৃত্তি পরীক্ষা নেই। উপরের ফর্ম দিয়ে প্রথম বৃত্তি পরীক্ষা তৈরি করুন।
			</div>
		{/if}

		{#if allScholarships.length > 1}
			<div class="card">
				<h2 class="section-title mb-4">পূর্ববর্তী বৃত্তি পরীক্ষাসমূহ</h2>
				<div class="overflow-x-auto">
					<table class="w-full text-sm text-left">
						<thead class="text-xs text-gray-500 uppercase border-b">
							<tr>
								<th class="py-2 pr-4">বছর</th>
								<th class="py-2 pr-4">রেজিস্ট্রেশন</th>
								<th class="py-2 pr-4"></th>
							</tr>
						</thead>
						<tbody>
							{#each allScholarships as s}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-medium text-gray-900">{s.year}</td>
									<td class="py-2 pr-4">
										<span class={s.registrationOpen ? 'text-green-600' : 'text-gray-400'}>
											{s.registrationOpen ? 'খোলা' : 'বন্ধ'}
										</span>
									</td>
									<td class="py-2 pr-4 text-right">
										{#if generalSettings.activeScholarshipId === s.id}
											<span class="text-xs font-semibold text-primary-700 uppercase">সক্রিয়</span>
										{:else}
											<button
												on:click={() => handleSetActive(s.id)}
												class="text-sm font-medium text-primary-700 hover:text-primary-900"
											>
												সক্রিয় করুন
											</button>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Organization Info -->
		<div class="card space-y-6">
			<h2 class="section-title">প্রতিষ্ঠানের তথ্য</h2>
			<p class="text-gray-500 text-sm -mt-4">
				এই তথ্য পুরো ওয়েবসাইট জুড়ে (ফুটার, যোগাযোগ পাতা, হোমপেজ) ব্যবহৃত হয়।
			</p>

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

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
		EMPTY_SCHOLARSHIP,
		SEED_2025
	} from '$lib/siteData';
	import { cloneDefaultBranches } from '$lib/branches';
	import { admitCardOf } from '$lib/admitCard';

	let loading = true;
	let saving = false;
	let generalSettings = { activeScholarshipId: null };
	let activeScholarship = null;
	let allScholarships = [];

	// Form state (structured copies, edited then saved explicitly)
	let form = { ...EMPTY_SCHOLARSHIP };
	let examRulesText = '';
	let admitCard = admitCardOf(null);
	let admitRulesText = '';

	// New year form
	let newYear = '';
	let cloneFromActive = true;

	// The editor tabs need an active scholarship; "years" is always available.
	const TABS = [
		{ id: 'general', label: 'সাধারণ তথ্য', needsActive: true },
		{ id: 'offices', label: 'ঠিকানা', needsActive: true },
		{ id: 'syllabus', label: 'সিলেবাস', needsActive: true },
		{ id: 'admit', label: 'প্রবেশপত্র', needsActive: true },
		{ id: 'years', label: 'বৃত্তি বছরসমূহ', needsActive: false }
	];
	let activeTab = 'general';
	$: visibleTabs = TABS.filter((t) => !t.needsActive || activeScholarship);
	$: if (!loading && !visibleTabs.some((t) => t.id === activeTab)) activeTab = 'years';

	function toYearString(y) {
		return String(y).trim();
	}

	function loadFormFromScholarship(s) {
		form = { ...EMPTY_SCHOLARSHIP, ...s };
		examRulesText = (form.examRules || []).join('\n');
		admitCard = JSON.parse(JSON.stringify(admitCardOf(s)));
		admitRulesText = admitCard.rules.join('\n');
		form.syllabus = (form.syllabus || []).map((c) => ({
			class: c.class || '',
			subjects: (c.subjects || []).map((sub) => ({
				name: sub.name || '',
				topics: sub.topics || []
			}))
		}));
	}

	async function loadAll() {
		loading = true;
		try {
			generalSettings = await getGeneralSettings();
			activeScholarship = generalSettings.activeScholarshipId
				? await getScholarship(generalSettings.activeScholarshipId)
				: null;
			allScholarships = await getAllScholarships();

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
		if (!Array.isArray(newData.branches) || newData.branches.length === 0) {
			newData.branches = cloneDefaultBranches();
		}

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
			activeTab = 'general';
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

	function addSyllabusClass() {
		form.syllabus = [...(form.syllabus || []), { class: '', subjects: [] }];
	}
	function removeSyllabusClass(classIndex) {
		if (!confirm('এই শ্রেণিটি এবং এর সকল বিষয় মুছে ফেলতে চান?')) return;
		form.syllabus = form.syllabus.filter((_, i) => i !== classIndex);
	}
	function addSubject(classIndex) {
		form.syllabus[classIndex].subjects = [
			...(form.syllabus[classIndex].subjects || []),
			{ name: '', topics: [''] }
		];
		form.syllabus = form.syllabus;
	}
	function removeSubject(classIndex, subjectIndex) {
		form.syllabus[classIndex].subjects = form.syllabus[classIndex].subjects.filter(
			(_, i) => i !== subjectIndex
		);
		form.syllabus = form.syllabus;
	}
	function updateTopics(classIndex, subjectIndex, text) {
		form.syllabus[classIndex].subjects[subjectIndex].topics = text.split('\n');
		form.syllabus = form.syllabus;
	}

	function addCenter() {
		const used = new Set(admitCard.centers.map((c) => String(c.number)));
		const next = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].find((n) => !used.has(n)) || '';
		admitCard.centers = [...admitCard.centers, { number: next, name: '' }];
	}
	function removeCenter(index) {
		admitCard.centers = admitCard.centers.filter((_, i) => i !== index);
	}
	function addSession() {
		admitCard.sessions = [...admitCard.sessions, { time: '', subjects: '' }];
	}
	function removeSession(index) {
		admitCard.sessions = admitCard.sessions.filter((_, i) => i !== index);
	}

	// Returns the cleaned admit card settings, or null (after alerting) if invalid.
	function buildAdmitCard() {
		const centers = admitCard.centers
			.map((c) => ({ number: String(c.number ?? '').trim(), name: (c.name || '').trim() }))
			.filter((c) => c.number || c.name);
		if (centers.length === 0) {
			alert('অন্তত একটি পরীক্ষা কেন্দ্র যোগ করুন।');
			return null;
		}
		// The center number is the first digit of every roll, so it must be a single digit 1-9.
		if (centers.some((c) => !/^[1-9]$/.test(c.number))) {
			alert('কেন্দ্র নম্বর অবশ্যই ১ থেকে ৯ এর মধ্যে একটি অংক (1-9) হতে হবে।');
			return null;
		}
		if (new Set(centers.map((c) => c.number)).size !== centers.length) {
			alert('একই কেন্দ্র নম্বর একাধিকবার ব্যবহার করা যাবে না।');
			return null;
		}
		if (centers.some((c) => !c.name)) {
			alert('প্রতিটি কেন্দ্রের নাম লিখুন।');
			return null;
		}
		return {
			centers,
			date: (admitCard.date || '').trim(),
			day: (admitCard.day || '').trim(),
			sessions: admitCard.sessions
				.map((s) => ({ time: (s.time || '').trim(), subjects: (s.subjects || '').trim() }))
				.filter((s) => s.time || s.subjects),
			rules: admitRulesText
				.split('\n')
				.map((r) => r.trim())
				.filter(Boolean)
		};
	}

	async function handleSaveScholarship() {
		if (!activeScholarship) return;

		const cleanedAdmitCard = buildAdmitCard();
		if (!cleanedAdmitCard) {
			activeTab = 'admit';
			return;
		}

		const cleanedSyllabus = (form.syllabus || [])
			.map((c) => ({
				class: (c.class || '').trim(),
				subjects: (c.subjects || [])
					.map((sub) => ({
						name: (sub.name || '').trim(),
						topics: (sub.topics || []).map((t) => t.trim()).filter(Boolean)
					}))
					.filter((sub) => sub.name || sub.topics.length)
			}))
			.filter((c) => c.class || c.subjects.length);

		const payload = {
			...form,
			examRules: examRulesText
				.split('\n')
				.map((r) => r.trim())
				.filter(Boolean),
			offices: (form.offices || []).filter((o) => o.name || o.address || o.phone),
			syllabus: cleanedSyllabus,
			admitCard: cleanedAdmitCard
		};
		delete payload.id;
		// Branches are edited on /admin/branches; don't overwrite them with the copy loaded here.
		delete payload.branches;

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
	<div class="space-y-6 mt-6">
		{#if activeScholarship}
			<!-- Active Scholarship Header -->
			<div class="card flex flex-col sm:flex-row justify-between sm:items-center gap-4">
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
		{/if}

		<!-- Tabs -->
		<div class="bg-white rounded-lg p-2 shadow-sm">
			<div class="flex space-x-2 overflow-x-auto" aria-label="Tabs" role="tablist">
				{#each visibleTabs as tab}
					<button
						role="tab"
						aria-selected={activeTab === tab.id}
						on:click={() => (activeTab = tab.id)}
						class="{activeTab === tab.id
							? 'bg-primary-100 text-primary-900'
							: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} whitespace-nowrap px-4 py-2 rounded-md font-medium text-sm transition-colors flex-1 text-center"
					>
						{tab.label}
					</button>
				{/each}
			</div>
		</div>

		{#if activeTab === 'general' && activeScholarship}
			<!-- General Info -->
			<div class="card space-y-6">
				<div>
					<h3 class="text-base font-semibold text-gray-800">সাধারণ তথ্য</h3>
					<p class="text-xs text-gray-400 mt-0.5">
						পরীক্ষার তারিখ, বৃত্তির পরিমাণ, রেজিস্ট্রেশন ফি ও নিয়মাবলী।
					</p>
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
			</div>
		{:else if activeTab === 'offices' && activeScholarship}
			<!-- Offices -->
			<div class="card space-y-4">
				<div class="flex justify-between items-center gap-4">
					<div>
						<h3 class="text-base font-semibold text-gray-800">ফর্ম প্রাপ্তি ও জমা দেওয়ার ঠিকানা</h3>
						<p class="text-xs text-gray-400 mt-0.5">
							যেসব প্রতিষ্ঠান থেকে ফর্ম সংগ্রহ ও জমা দেওয়া যাবে।
						</p>
					</div>
					<button
						on:click={addOffice}
						class="text-sm font-medium text-primary-700 hover:text-primary-900 whitespace-nowrap"
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
		{:else if activeTab === 'syllabus' && activeScholarship}
			<!-- Syllabus -->
			<div class="card space-y-4">
				<div class="flex justify-between items-center gap-4">
					<div>
						<h3 class="text-base font-semibold text-gray-800">সিলেবাস</h3>
						<p class="text-xs text-gray-400 mt-0.5">
							প্রতিটি শ্রেণির জন্য একটি বক্স যোগ করুন, তারপর সেই শ্রেণির প্রতিটি বিষয় ও তার টপিকগুলো লিখুন।
						</p>
					</div>
					<button
						on:click={addSyllabusClass}
						class="text-sm font-medium text-primary-700 hover:text-primary-900 whitespace-nowrap"
					>
						+ শ্রেণি যোগ করুন
					</button>
				</div>

				<div class="space-y-4">
					{#each form.syllabus || [] as classData, ci}
						<div class="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-3">
							<div class="flex items-center gap-2">
								<input
									type="text"
									bind:value={classData.class}
									placeholder="শ্রেণির নাম (যেমনঃ ১০ম শ্রেণি (স্কুল/মাদরাসা))"
									class="flex-1 border border-gray-300 rounded-md p-2 text-sm font-semibold focus:ring-primary-500 focus:border-primary-500"
								/>
								<button
									on:click={() => removeSyllabusClass(ci)}
									class="text-red-500 hover:text-red-700 text-sm px-2 py-2"
									title="শ্রেণি মুছে ফেলুন"
								>
									✕
								</button>
							</div>

							<div class="space-y-3 pl-2 border-l-2 border-primary-100">
								{#each classData.subjects || [] as subject, si}
									<div class="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-start pl-2">
										<input
											type="text"
											bind:value={subject.name}
											placeholder="বিষয়ের নাম (যেমনঃ বাংলা)"
											class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
										/>
										<textarea
											value={(subject.topics || []).join('\n')}
											on:input={(e) => updateTopics(ci, si, e.target.value)}
											rows="3"
											placeholder="টপিকসমূহ (প্রতি লাইনে একটি)"
											class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
										></textarea>
										<button
											on:click={() => removeSubject(ci, si)}
											class="text-red-500 hover:text-red-700 text-sm px-2 py-2"
											title="বিষয় মুছে ফেলুন"
										>
											✕
										</button>
									</div>
								{/each}
								{#if !(classData.subjects || []).length}
									<p class="text-sm text-gray-400 pl-2">কোনো বিষয় যোগ করা হয়নি।</p>
								{/if}
								<button
									on:click={() => addSubject(ci)}
									class="text-sm font-medium text-primary-700 hover:text-primary-900 pl-2"
								>
									+ বিষয় যোগ করুন
								</button>
							</div>
						</div>
					{/each}
					{#if !(form.syllabus || []).length}
						<p class="text-sm text-gray-400">কোনো শ্রেণি যোগ করা হয়নি।</p>
					{/if}
				</div>
			</div>
		{:else if activeTab === 'admit' && activeScholarship}
			<!-- Admit Card -->
			<div class="card space-y-6">
				<div>
					<h3 class="text-base font-semibold text-gray-800">প্রবেশপত্র (এডমিট কার্ড)</h3>
					<p class="text-xs text-gray-400 mt-0.5">
						পরীক্ষা কেন্দ্র, সময়সূচী ও নিয়মাবলী এই বছরের সকল প্রবেশপত্রে দেখানো হবে।
					</p>
				</div>

				<div>
					<div class="flex justify-between items-center mb-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700">পরীক্ষা কেন্দ্রসমূহ</label>
							<p class="text-xs text-gray-400 mt-0.5">
								কেন্দ্র নম্বর (1-9) রোল নম্বরের প্রথম অংক হিসেবে ব্যবহৃত হয়। রোল দেওয়ার পর কোনো কেন্দ্রের নম্বর পরিবর্তন করবেন না।
							</p>
						</div>
						<button
							on:click={addCenter}
							class="text-sm font-medium text-primary-700 hover:text-primary-900 whitespace-nowrap"
						>
							+ কেন্দ্র যোগ করুন
						</button>
					</div>
					<div class="space-y-2">
						{#each admitCard.centers as center, i}
							<div class="grid grid-cols-[5rem_1fr_auto] gap-2 items-start">
								<input
									type="text"
									inputmode="numeric"
									maxlength="1"
									bind:value={center.number}
									placeholder="নং"
									class="border border-gray-300 rounded-md p-2 text-sm text-center focus:ring-primary-500 focus:border-primary-500"
								/>
								<input
									type="text"
									bind:value={center.name}
									placeholder="কেন্দ্রের নাম ও ঠিকানা"
									class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
								/>
								<button
									on:click={() => removeCenter(i)}
									class="text-red-500 hover:text-red-700 text-sm px-2 py-2"
									title="মুছে ফেলুন"
								>
									✕
								</button>
							</div>
						{/each}
						{#if !admitCard.centers.length}
							<p class="text-sm text-gray-400">কোনো কেন্দ্র যোগ করা হয়নি।</p>
						{/if}
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">প্রবেশপত্রে পরীক্ষার তারিখ</label>
						<input
							type="text"
							bind:value={admitCard.date}
							class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
							placeholder="১ নভেম্বর, ২০২৬"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">বার</label>
						<input
							type="text"
							bind:value={admitCard.day}
							class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
							placeholder="শনিবার"
						/>
					</div>
				</div>

				<div>
					<div class="flex justify-between items-center mb-2">
						<label class="block text-sm font-medium text-gray-700">পরীক্ষার সময়সূচী</label>
						<button
							on:click={addSession}
							class="text-sm font-medium text-primary-700 hover:text-primary-900 whitespace-nowrap"
						>
							+ সময় যোগ করুন
						</button>
					</div>
					<div class="space-y-2">
						{#each admitCard.sessions as session, i}
							<div class="grid grid-cols-1 sm:grid-cols-[10rem_1fr_auto] gap-2 items-start">
								<input
									type="text"
									bind:value={session.time}
									placeholder="১০:০০-১১:০০"
									class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
								/>
								<input
									type="text"
									bind:value={session.subjects}
									placeholder="বিষয় (যেমনঃ বাংলা ও ইংরেজি)"
									class="border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
								/>
								<button
									on:click={() => removeSession(i)}
									class="text-red-500 hover:text-red-700 text-sm px-2 py-2"
									title="মুছে ফেলুন"
								>
									✕
								</button>
							</div>
						{/each}
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						প্রবেশপত্রের নিয়মাবলী (প্রতি লাইনে একটি)
					</label>
					<textarea
						bind:value={admitRulesText}
						rows="5"
						class="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
					></textarea>
				</div>
			</div>
		{:else}
			<!-- Scholarship Years -->
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

			{#if !activeScholarship}
				<div class="card text-center text-gray-500">
					এখনো কোনো সক্রিয় বৃত্তি পরীক্ষা নেই। উপরের ফর্ম দিয়ে প্রথম বৃত্তি পরীক্ষা তৈরি করুন।
				</div>
			{/if}

			{#if allScholarships.length}
				<div class="card">
					<h2 class="section-title mb-4">সকল বৃত্তি পরীক্ষা</h2>
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
		{/if}

		{#if activeScholarship && activeTab !== 'years'}
			<!-- Shared save bar: one save covers every editor tab -->
			<div
				class="sticky bottom-0 z-10 bg-white border border-gray-200 rounded-lg shadow-md px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
			>
				<p class="text-xs text-gray-500">
					সাধারণ তথ্য, ঠিকানা, সিলেবাস ও প্রবেশপত্র — সকল ট্যাবের পরিবর্তন একসাথে সংরক্ষিত হবে।
				</p>
				<button on:click={handleSaveScholarship} disabled={saving} class="btn-primary disabled:opacity-50">
					{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
				</button>
			</div>
		{/if}
	</div>
{/if}

<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { addDoc } from 'firebase/firestore';
	import { fly } from 'svelte/transition';
	import InstitutionInput from '$lib/components/InstitutionInput.svelte';
	import { getActiveScholarship, getSiteInfo } from '$lib/siteData';
	import { applicationsCol } from '$lib/yearScope';
	import { loadInstitutions, addInstitutionIfMissing } from '$lib/institutions';

	let loading = true;
	let scholarship = null;
	let siteInfo = null;
	let institutions = [];

	onMount(async () => {
		[scholarship, siteInfo] = await Promise.all([getActiveScholarship(), getSiteInfo()]);
		loading = false;
		if (scholarship) {
			institutions = await loadInstitutions(scholarship.id);
		}
	});

	let formData = {
		institutionType: '',
		gender: '',
		name: '',
		nameEnglish: '',
		fatherName: '',
		institution: '',
		class: '',
		classRoll: '',
		mobile: '',
		presentAddress: '',
		guardianName: '',
		relation: '',
		guardianMobile: '',
		transactionID: '',
		creationTime: '',
		confirmed: false // Add the confirmed field, default to false
	};
	let formErrors = {};
	let submitting = false;
	let submitSuccess = false;
	let submitError = '';

	const banglaRegex = /^[ঀ-৿\s.,()-]+$/;
	const englishRegex = /^[A-Za-z\s.,'-]+$/;
	const mobileRegex = /^01\d{9}$/;
	const transactionIdRegex = /^[A-Za-z0-9]+$/;

	function stripSpaces(field) {
		formData[field] = formData[field].replace(/\s/g, '');
	}

	function validateForm() {
		formErrors = {};

		if (!formData.institutionType) {
			formErrors.institutionType = 'স্কুল অথবা মাদরাসা নির্বাচন করুন।';
		}

		if (!formData.gender) {
			formErrors.gender = 'ছাত্র অথবা ছাত্রী নির্বাচন করুন।';
		}

		if (!formData.name || !banglaRegex.test(formData.name.trim())) {
			formErrors.name = 'পরীক্ষার্থীর নাম শুধুমাত্র বাংলায় লিখুন।';
		}

		if (!formData.nameEnglish || !englishRegex.test(formData.nameEnglish.trim())) {
			formErrors.nameEnglish = 'নাম শুধুমাত্র ইংরেজিতে লিখুন।';
		}

		if (!formData.fatherName || !banglaRegex.test(formData.fatherName.trim())) {
			formErrors.fatherName = 'পিতার নাম শুধুমাত্র বাংলায় লিখুন।';
		}

		if (!formData.institution || !banglaRegex.test(formData.institution.trim())) {
			formErrors.institution = 'শিক্ষা প্রতিষ্ঠানের নাম শুধুমাত্র বাংলায় লিখুন।';
		}

		if (!formData.class) {
			formErrors.class = 'শ্রেণি নির্বাচন করুন।';
		}

		if (!formData.mobile || !mobileRegex.test(formData.mobile.trim())) {
			formErrors.mobile = 'মোবাইল নাম্বার ইংরেজিতে ১১ ডিজিটে, 01xxxxxxxxx ফরম্যাটে দিন।';
		}

		if (!formData.guardianMobile || !mobileRegex.test(formData.guardianMobile.trim())) {
			formErrors.guardianMobile = 'মোবাইল নাম্বার (অলটারনেট) ইংরেজিতে ১১ ডিজিটে, 01xxxxxxxxx ফরম্যাটে দিন।';
		}

		if (!formData.transactionID || !transactionIdRegex.test(formData.transactionID.trim())) {
			formErrors.transactionID = 'ট্রান্সেকশন আইডি শুধুমাত্র ইংরেজিতে লিখুন।';
		}

		return Object.keys(formErrors).length === 0;
	}

	async function handleSubmit() {
		submitting = true;
		submitSuccess = false;
		submitError = '';

		if (!validateForm()) {
			submitting = false;
			return;
		}

		if (!scholarship) {
			submitError = 'An error occurred while submitting the form. Please try again.';
			submitting = false;
			return;
		}

		try {
			// Trim whitespace from all string fields before submitting
			const cleanedFormData = Object.fromEntries(
				Object.entries(formData).map(([key, value]) =>
					typeof value === 'string' ? [key, value.trim()] : [key, value]
				)
			);

			cleanedFormData.creationTime = new Date().toISOString();
			cleanedFormData.confirmed = false; // Ensure confirmed is set to false
			const docRef = await addDoc(applicationsCol(scholarship.id), cleanedFormData);
			console.log('Document written with ID: ', docRef.id);
			await addInstitutionIfMissing(scholarship.id, cleanedFormData.institution, institutions);
			submitSuccess = true;
			goto('/britti_registration/successful');
			// Reset form after successful submission
			formData = {
				...formData,
				institutionType: '',
				gender: '',
				name: '',
				nameEnglish: '',
				fatherName: '',
				institution: '',
				class: '',
				classRoll: '',
				mobile: '',
				presentAddress: '',
				guardianName: '',
				relation: '',
				guardianMobile: '',
				transactionID: '',
				confirmed: false
			};
			formErrors = {};
		} catch (e) {
			console.error('Error adding document: ', e);
			submitError = 'An error occurred while submitting the form. Please try again.';
		}

		submitting = false;
	}
	let classOptions = [
		{ value: '৪র্থ', label: '৪র্থ শ্রেণি' },
		{ value: '৫ম', label: '৫ম শ্রেণি' },
		{ value: '৬ষ্ঠ', label: '৬ষ্ঠ শ্রেণি' },
		{ value: '৭ম', label: '৭ম শ্রেণি' },
		{ value: '৮ম', label: '৮ম শ্রেণি' },
		{ value: '৯ম', label: '৯ম শ্রেণি' },
		{ value: '১০ম', label: '১০ম শ্রেণি' }
	];
</script>

<svelte:head>
	<title>কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা {scholarship?.year ?? ''} - নিবন্ধন ফরম</title>
</svelte:head>

<div class="space-y-8">
	<span class="section-eyebrow block text-center">নিবন্ধন</span>
	<h1 class="text-3xl font-bold text-center text-primary-900">
		কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা {scholarship?.year ?? ''}
	</h1>
	<h2 class="text-lg font-semibold text-center text-gray-500">
		আয়োজনে: কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর
	</h2>

	{#if loading}
		<p class="text-center text-gray-400 py-8">লোড হচ্ছে...</p>
	{:else if !scholarship || !scholarship.registrationOpen}
		<h3 class="text-xl font-bold text-center text-secondary-700 mb-6">রেজিস্ট্রেশন বন্ধ আছে</h3>
	{:else}
	<div class="bg-primary-900 text-white p-6 rounded-lg shadow-card-lg">
		<h3 class="text-2xl font-bold mb-4 text-center">রেজিস্ট্রেশন ফি জমা দিন</h3>
		<div class="grid md:grid-cols-2 gap-4">
			<div in:fly={{ y: 50, duration: 500 }} class="bg-white bg-opacity-10 p-4 rounded-lg">
				<p class="text-lg font-semibold mb-2">রেজিস্ট্রেশন ফিঃ</p>
				<p class="text-3xl font-bold">{scholarship.regFee || '—'}/- টাকা</p>
			</div>
			<div
				in:fly={{ y: 50, duration: 500, delay: 200 }}
				class="bg-white bg-opacity-10 p-4 rounded-lg"
			>
				<p class="text-lg font-semibold mb-2">বিকাশ নাম্বার:</p>
				<p class="text-3xl font-bold">{scholarship.bkashNumber || '—'}</p>
				<p class="text-sm">(Personal, Send Money)</p>
			</div>
		</div>
		<div in:fly={{ y: 50, duration: 500, delay: 400 }} class="mt-4 text-center">
			<p class="text-lg">
				বিকাশে টাকা পাঠানোর পর ফিরতি মেসেজে প্রাপ্ত <span class="font-bold"
					>Transaction ID/Trx ID</span
				> নিচের ফর্মে দিতে হবে।
			</p>
			<p class="text-sm mt-2 text-secondary-200">
				সতর্কতা: আইডি না থাকলে অথবা ভুল আইডি দিলে রেজিস্ট্রেশন বাতিল হবে।<br/>
				সতর্কতা (২): শুধুমাত্র সিলেট মহানগরের রেজিস্ট্রেশনের জন্য এই ফর্ম ফিলাপ করবেন।
			</p>
		</div>
	</div>

	<h3 class="section-title text-center mb-6">রেজিস্ট্রেশন ফরম</h3>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <div class="flex justify-between">
      <div class="w-1/2">
        <label class="block text-sm font-medium text-gray-700">রেজিঃ নং DA-3075</label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input type="radio" bind:group={formData.institutionType} value="school" required class="form-radio">
            <span class="ml-2">স্কুল</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" bind:group={formData.institutionType} value="madrasa" required class="form-radio">
            <span class="ml-2">মাদরাসা</span>
          </label>
        </div>
        {#if formErrors.institutionType}
            <p class="text-red-500 text-sm mt-1">{formErrors.institutionType}</p>
        {/if}
      </div>
      <div class="w-1/2">
        <label class="block text-sm font-medium text-gray-700"></label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input type="radio" bind:group={formData.gender} value="male" required class="form-radio">
            <span class="ml-2">ছাত্র</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" bind:group={formData.gender} value="female" required class="form-radio">
            <span class="ml-2">ছাত্রী</span>
          </label>
        </div>
        {#if formErrors.gender}
            <p class="text-red-500 text-sm mt-1">{formErrors.gender}</p>
        {/if}
      </div>
    </div>
  
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">পরীক্ষার্থীর নাম (শুধুমাত্র বাংলায় লিখুন)</label>
        <input type="text" bind:value={formData.name} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        {#if formErrors.name}
            <p class="text-red-500 text-sm mt-1">{formErrors.name}</p>
        {/if}
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">ইংরেজিতে (শুধুমাত্র ইংরেজিতে লিখুন)</label>
        <input type="text" bind:value={formData.nameEnglish} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        {#if formErrors.nameEnglish}
            <p class="text-red-500 text-sm mt-1">{formErrors.nameEnglish}</p>
        {/if}
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">পিতার নাম (শুধুমাত্র বাংলায় লিখুন)</label>
        <input type="text" bind:value={formData.fatherName} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        {#if formErrors.fatherName}
            <p class="text-red-500 text-sm mt-1">{formErrors.fatherName}</p>
        {/if}
      </div>
      <InstitutionInput bind:value={formData.institution} {institutions} error={formErrors.institution} />
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label for="class" class="block text-sm font-medium text-gray-700">শ্রেণি</label>
          <select
            id="class"
            bind:value={formData.class}
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="" disabled selected>শ্রেণি নির্বাচন করুন</option>
            {#each classOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          {#if formErrors.class}
              <p class="text-red-500 text-sm mt-1">{formErrors.class}</p>
          {/if}
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">রোল</label>
          <input type="text" bind:value={formData.classRoll} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">মোবাইল (ইংরেজিতে ১১ ডিজিট, ফরম্যাটঃ 01xxxxxxxxx)</label>
        <input type="tel" maxlength="11" bind:value={formData.mobile} on:input={() => stripSpaces('mobile')} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        {#if formErrors.mobile}
            <p class="text-red-500 text-sm mt-1">{formErrors.mobile}</p>
        {/if}
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">বর্তমান ঠিকানা</label>
      <input type="text" bind:value={formData.presentAddress} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
    </div>
  
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">অভিভাবকের নাম</label>
        <input type="text" bind:value={formData.guardianName} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">সম্পর্ক</label>
        <input type="text" bind:value={formData.relation} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">মোবাইল নাম্বার (অলটারনেট) (ইংরেজিতে ১১ ডিজিট, ফরম্যাটঃ 01xxxxxxxxx)</label>
        <input type="tel" maxlength="11" bind:value={formData.guardianMobile} on:input={() => stripSpaces('guardianMobile')} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        {#if formErrors.guardianMobile}
            <p class="text-red-500 text-sm mt-1">{formErrors.guardianMobile}</p>
        {/if}
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">ট্রান্সেকশন আইডি (উপরে পেমেন্টের নিয়মাবলী দেখুন, শুধুমাত্র ইংরেজিতে লিখুন)</label>
        <input type="text" bind:value={formData.transactionID} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        {#if formErrors.transactionID}
            <p class="text-red-500 text-sm mt-1">{formErrors.transactionID}</p>
        {/if}
      </div>
    </div>
  
    <div class="text-center">
      <button type="submit" class="btn-primary disabled:opacity-50" disabled={submitting}>
        {submitting ? 'Submitting...' : 'নিবন্ধন সম্পন্ন করুন'}
      </button>
    </div>
  </form>

	{#if submitSuccess}
		<div class="mt-4 p-2 bg-green-100 text-green-700 rounded">
			Your application has been successfully submitted!
		</div>
	{/if}

	{#if submitError}
		<div class="mt-4 p-2 bg-red-100 text-red-700 rounded">
			{submitError}
		</div>
	{/if}
	{/if}

	<div class="mt-8 space-y-4">
		<div class="bg-secondary-50 border border-secondary-200 p-6 rounded-lg">
			<h4 class="text-lg font-semibold text-primary-900 mb-4">যোগাযোগের ঠিকানা:</h4>
			<ul class="space-y-2 text-gray-700">
				{#if siteInfo}
					{#each siteInfo.contactPersons || [] as person}
						<li>{person.phone} ({person.name})</li>
					{/each}
				{/if}
			</ul>
		</div>

		<div class="text-sm text-gray-600 text-center">
			বিস্তারিত তথ্যের জন্য: <a
				href="http://www.kkrfsylhet.org"
				class="text-primary-700 hover:underline">www.kkrfsylhet.org</a
			>
		</div>
	</div>
</div>

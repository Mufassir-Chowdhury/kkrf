<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { initializeApp } from 'firebase/app';
	import { getFirestore, collection, addDoc } from 'firebase/firestore';
	import { fly } from 'svelte/transition';

	// Your Firebase configuration
	const firebaseConfig = {
		apiKey: 'AIzaSyBy8i9BLWzUMulNQJkJsbDX8m6MFYz6T_k',
		authDomain: 'kkrf-sylhet.firebaseapp.com',
		projectId: 'kkrf-sylhet',
		storageBucket: 'kkrf-sylhet.appspot.com',
		messagingSenderId: '973839955936',
		appId: '1:973839955936:web:eefd07d1a4b7be73b91d85'
	};

	let app;
	let db;

	onMount(() => {
		app = initializeApp(firebaseConfig);
		db = getFirestore(app);
	});

	let formData = {
		institutionType: '',
		gender: '',
		name: '',
		nameEnglish: '',
		fatherName: '',
		motherName: '',
		institution: '',
		class: '',
		section: '',
		classRoll: '',
		birthDate: '',
		religion: '',
		mobile: '',
		permanentAddress: {
			village: '',
			postOffice: '',
			upazila: '',
			district: ''
		},
		presentAddress: '',
		guardianName: '',
		relation: '',
		guardianMobile: '',
		transactionID: '',
		creationTime: '',
		confirmed: false  // Add the confirmed field, default to false
	};
	let formErrors = {};
	let submitting = false;
	let submitSuccess = false;
	let submitError = '';

	async function handleSubmit() {
		submitting = true;
		submitSuccess = false;
		submitError = '';

		try {
			formData.creationTime = new Date().toISOString();
			formData.confirmed = false;  // Ensure confirmed is set to false
			const docRef = await addDoc(collection(db, 'scholarshipApplications-2025'), formData);
			console.log('Document written with ID: ', docRef.id);
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
				motherName: '',
				institution: '',
				class: '',
				section: '',
				classRoll: '',
				birthDate: '',
				religion: '',
				mobile: '',
				permanentAddress: { village: '', postOffice: '', upazila: '', district: '' },
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
	<title>কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫ - নিবন্ধন ফরম</title>
</svelte:head>

<div class="space-y-8">
	<h1 class="text-3xl font-bold text-center text-teal-700">কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</h1>
	<h2 class="text-xl font-semibold text-center text-teal-600">
		আয়োজনে: কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর
	</h2>

	<div class="bg-gradient-to-r from-teal-500 to-amber-500 text-white p-6 rounded-lg shadow-md">
		<h3 class="text-2xl font-bold mb-4 text-center">রেজিস্ট্রেশন ফি জমা দিন</h3>
		<div class="grid md:grid-cols-2 gap-4">
			<div in:fly={{ y: 50, duration: 500 }} class="bg-white bg-opacity-20 p-4 rounded-lg">
				<p class="text-lg font-semibold mb-2">রেজিস্ট্রেশন ফিঃ</p>
				<p class="text-3xl font-bold">২০০/- টাকা</p>
			</div>
			<div
				in:fly={{ y: 50, duration: 500, delay: 200 }}
				class="bg-white bg-opacity-20 p-4 rounded-lg"
			>
				<p class="text-lg font-semibold mb-2">বিকাশ নাম্বার:</p>
				<p class="text-3xl font-bold">01771144308</p>
				<p class="text-sm">(Personal, Send Money)</p>
			</div>
		</div>
		<div in:fly={{ y: 50, duration: 500, delay: 400 }} class="mt-4 text-center">
			<p class="text-lg">
				বিকাশে টাকা পাঠানোর পর ফিরতি মেসেজে প্রাপ্ত <span class="font-bold"
					>Transaction ID/Trx ID</span
				> নিচের ফর্মে দিতে হবে।
			</p>
			<p class="text-sm mt-2 text-yellow-200">
				সতর্কতা: আইডি না থাকলে অথবা ভুল আইডি দিলে রেজিস্ট্রেশন বাতিল হবে।<br/>
				সতর্কতা (২): শুধুমাত্র সিলেট মহানগরের রেজিস্ট্রেশনের জন্য এই ফর্ম ফিলাপ করবেন।
			</p>
		</div>
	</div>

	<h3 class="text-2xl font-bold text-center text-teal-800 mb-6">রেজিস্ট্রেশন ফরম</h3>

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
      </div>
    </div>
  
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">পরীক্ষার্থীর নাম (বাংলায়)</label>
        <input type="text" bind:value={formData.name} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">ইংরেজিতে</label>
        <input type="text" bind:value={formData.nameEnglish} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">পিতার নাম (বাংলায়)</label>
        <input type="text" bind:value={formData.fatherName} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">মাতার নাম (বাংলায়)</label>
        <input type="text" bind:value={formData.motherName} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">শিক্ষা প্রতিষ্ঠান</label>
        <input type="text" bind:value={formData.institution} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label for="class" class="block text-sm font-medium text-gray-700">শ্রেণি</label>
          <select 
            id="class"
            bind:value={formData.class} 
            required 
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="" disabled selected>শ্রেণি নির্বাচন করুন</option>
            {#each classOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">শাখা</label>
          <input type="text" bind:value={formData.section} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">রোল</label>
          <input type="text" bind:value={formData.classRoll} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">জন্ম তারিখ</label>
        <input type="date" bind:value={formData.birthDate} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">ধর্ম</label>
        <input type="text" bind:value={formData.religion} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">মোবাইল</label>
        <input type="tel" bind:value={formData.mobile} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
    </div>
  
    <div>
      <h4 class="font-semibold">স্থায়ী ঠিকানা</h4>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">গ্রাম</label>
          <input type="text" bind:value={formData.permanentAddress.village} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">ডাক</label>
          <input type="text" bind:value={formData.permanentAddress.postOffice} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">থানা</label>
          <input type="text" bind:value={formData.permanentAddress.upazila} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">জেলা</label>
          <input type="text" bind:value={formData.permanentAddress.district} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
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
        <label class="block text-sm font-medium text-gray-700">মোবাইল নাম্বার (অলটারনেট)</label>
        <input type="tel" bind:value={formData.guardianMobile} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">ট্রান্সেকশন আইডি (উপরে পেমেন্টের নিয়মাবলী দেখুন)</label>
        <input type="text" bind:value={formData.transactionID} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
    </div>
  
    <div class="text-center">
      <button type="submit" class="bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors" disabled={submitting}>
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

	<div class="mt-8 space-y-4">
		<div class="bg-amber-50 p-6 rounded-lg shadow-md">
			<h4 class="text-xl font-semibold text-teal-700 mb-4">যোগাযোগের ঠিকানা:</h4>
			<ul class="space-y-2 text-gray-700">
				<li>০১৩০০২০৮১৮৮ (তৌহিদুল ইসলাম)</li>
				<li>০১৭৮২৮৪৭৪৩৯ (রেজাউল করিম)</li>
				<li>০১৭৭৯০৯৮৬৪৫ (ফাহাদ হুসাইন)</li>
				<li>০১৩০৬৩২১০৫২ (আবুল হাসান রিয়াদ)</li>
			</ul>
		</div>

		<div class="text-sm text-gray-600 text-center">
			বিস্তারিত তথ্যের জন্য: <a
				href="http://www.kkrfsylhet.org"
				class="text-teal-600 hover:underline">www.kkrfsylhet.org</a
			>
		</div>
	</div>
</div>

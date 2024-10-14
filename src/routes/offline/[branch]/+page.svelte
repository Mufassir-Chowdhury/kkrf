<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { initializeApp } from 'firebase/app';
	import { getFirestore, collection, addDoc } from 'firebase/firestore';
    import { page } from '$app/stores';

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
		serial: '',
        institutionType: '',
		gender: '',
		name: '',
		fatherName: '',
		institution: '',
		class: '',
		section: '',
		classRoll: '',
		mobile: '',
		presentAddress: '',
		creationTime: '',
        branch: '',
	};
	let formErrors = {};
	let submitting = false;
	let submitSuccess = false;
	let submitError = '';
    let branch = $page.params.branch;
	async function handleSubmit() {
		submitting = true;
		submitSuccess = false;
		submitError = '';

		try {
			formData.creationTime = new Date().toISOString();
            formData.branch = branch;
			const docRef = await addDoc(collection(db, `offline`), formData);
			console.log('Document written with ID: ', docRef.id);
			submitSuccess = true;
			goto(`/offline/${branch}/successful`);
			
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
	<title>কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪ - নিবন্ধন ফরম</title>
</svelte:head>

<div class="space-y-8">
	<h1 class="text-3xl font-bold text-center text-teal-700">কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪</h1>
	<h2 class="text-xl font-semibold text-center text-teal-600">
		আয়োজনে: কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর
	</h2>


	<h3 class="text-2xl font-bold text-center text-teal-800 mb-6">রেজিস্ট্রেশন ফরম (অফলাইন)</h3>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <div class="flex justify-between">
      <div class="w-1/2">
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
        <label class="block text-sm font-medium text-gray-700">সিরিয়াল </label>
        <input type="text" maxlength="5" bind:value={formData.serial} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">পরীক্ষার্থীর নাম (বাংলায়)</label>
        <input type="text" bind:value={formData.name} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">পিতার নাম (বাংলায়)</label>
        <input type="text" bind:value={formData.fatherName} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
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
        <label class="block text-sm font-medium text-gray-700">মোবাইল</label>
        <input type="tel" maxlength="11" bind:value={formData.mobile} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
    </div>
  
    <div>
      <label class="block text-sm font-medium text-gray-700">বর্তমান ঠিকানা</label>
      <input type="text" bind:value={formData.presentAddress} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
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
				<li>০১৯৭৩৮৮১৪৯৮ (আহসান হাবীব)</li>
				<li>০১৯০৮৩০৩৮২৬ (রফিকুল ইসলাম)</li>
				<li>০১৮৭৭৪৩৮৫৪৮ (ছফির উদ্দীন)</li>
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

<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { initializeApp } from 'firebase/app';
	import { getFirestore, collection, addDoc } from 'firebase/firestore';
    import { page } from '$app/stores';

	export let data;
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
	let institutions = [];
	let filteredInstitutions = [];
	let showDropdown = false;

	onMount(async () => {
		app = initializeApp(firebaseConfig);
		db = getFirestore(app);
		
		// Load institutions from JSON file
		try {
			const response = await fetch('/institutions.json');
			const jsonData = await response.json();
			institutions = jsonData.institutions || [];
		} catch (error) {
			console.error('Error loading institutions:', error);
		}
	});

	let formData = {
		serial: '',
        institutionType: null,
		gender: null,
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
		ward: '',
	};
	let formErrors = {};
	let submitting = false;
	let submitSuccess = false;
	let submitError = '';
    let branch = $page.params.branch;

	function handleInstitutionInput() {
		const value = formData.institution.toLowerCase();
		if (value.length > 0) {
			filteredInstitutions = institutions.filter(inst => 
				inst.toLowerCase().includes(value)
			).slice(0, 10); // Limit to 10 suggestions
			showDropdown = filteredInstitutions.length > 0;
		} else {
			showDropdown = false;
		}
	}

	function selectInstitution(institution) {
		formData.institution = institution;
		showDropdown = false;
	}

	function handleInstitutionBlur() {
		// Delay hiding dropdown to allow click events to register
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}

    function validateForm() {
        formErrors = {};
        const serialRegex = new RegExp(`^${branch}[0-9]{3}$`);
        const mobileRegex = /^\d{11}$/;

        // Institution Type validation
        if (!formData.institutionType) {
            formErrors.institutionType = 'Please select an institution type.';
        }

        // Gender validation
        if (!formData.gender) {
            formErrors.gender = 'Please select a gender.';
        }

        // Serial validation
        if (!formData.serial || !serialRegex.test(formData.serial.trim())) {
            formErrors.serial = `Serial must be in English digits and format ${branch}001 to ${branch}999 without spaces.`;
        }

        // Mobile validation
        if (!formData.mobile || !mobileRegex.test(formData.mobile.trim())) {
            formErrors.mobile = 'Mobile number must be exactly 11 English digits without spaces.';
        }

        return Object.keys(formErrors).length === 0;
    }

	async function handleSubmit() {
		submitting = true;
		submitSuccess = false;
		submitError = '';
        
        // Run validation checks
        if (!validateForm()) {
            submitting = false;
            // The reactive formErrors object will cause UI to update with error messages
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
            cleanedFormData.branch = branch;

			const docRef = await addDoc(collection(db, `offline-2025`), cleanedFormData);
			console.log('Document written with ID: ', docRef.id);
			submitSuccess = true;
			goto(`/offline/${branch}/successful`);
			
			formErrors = {}; // Clear errors on success
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
	<h1 class="text-3xl font-bold text-center text-teal-700">শাখাঃ {data.thana[branch]}</h1>
	
	<h3 class="text-2xl font-bold text-center text-teal-800 mb-6">রেজিস্ট্রেশন ফরম (অফলাইন)</h3>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between md:space-x-4">
      <div class="w-full md:w-1/2 mb-4 md:mb-0">
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
      <div class="w-full md:w-1/2">
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
        <label class="block text-sm font-medium text-gray-700">সিরিয়াল ({branch}001 থেকে শুরু হবে <br/> ইংরেজিতে লিখবেন <br/> আপনার ফর্মের কপিতেও হাতে লিখে রাখবেন সিরিয়াল নাম্বারের ঘরে)</label>
        <input type="text" maxlength={branch.length + 3} bind:value={formData.serial} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        {#if formErrors.serial}
            <p class="text-red-500 text-sm mt-1">{formErrors.serial}</p>
        {/if}
        </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">পরীক্ষার্থীর নাম (বাংলায়)</label>
        <input type="text" bind:value={formData.name} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">পিতার নাম (বাংলায়)</label>
        <input type="text" bind:value={formData.fatherName} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
      </div>
      <div class="relative">
        <label class="block text-sm font-medium text-gray-700">শিক্ষা প্রতিষ্ঠান</label>
        <input 
          type="text" 
          bind:value={formData.institution} 
          on:input={handleInstitutionInput}
          on:blur={handleInstitutionBlur}
          on:focus={handleInstitutionInput}
          required 
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          autocomplete="off"
        >
        {#if showDropdown}
          <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {#each filteredInstitutions as institution}
              <button
                type="button"
                class="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                on:click={() => selectInstitution(institution)}
              >
                {institution}
              </button>
            {/each}
          </div>
        {/if}
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
          <label class="block text-sm font-medium text-gray-700">শাখা (না থাকলে নাই লিখবেন)</label>
          <input type="text" bind:value={formData.section} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">রোল</label>
          <input type="text" bind:value={formData.classRoll} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">মোবাইল (ইংরেজিতে ১১ ডিজিট, ডাবল চেক করবেন)</label>
        <input type="tel" maxlength="11" minlength="11" bind:value={formData.mobile} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        {#if formErrors.mobile}
            <p class="text-red-500 text-sm mt-1">{formErrors.mobile}</p>
        {/if}
      </div>
    </div>
  
    <div>
      <label class="block text-sm font-medium text-gray-700">বর্তমান ঠিকানা</label>
      <input type="text" bind:value={formData.presentAddress} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
    </div>
	<div>
		<label class="block text-sm font-medium text-gray-700">ওয়ার্ড</label>
		<input type="text" bind:value={formData.ward} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
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
</div>

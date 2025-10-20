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
		studentName: '',
		senderNumber: '',
		transactionID: '',
		refundNumber: '',
		bkashTime: '',
		submissionTime: ''
	};

	let submitting = false;
	let submitSuccess = false;
	let submitError = '';

	async function handleSubmit() {
		submitting = true;
		submitSuccess = false;
		submitError = '';

		try {
			formData.submissionTime = new Date().toISOString();
			const docRef = await addDoc(collection(db, 'refund-2025'), formData);
			console.log('Document written with ID: ', docRef.id);
			submitSuccess = true;
			
			// Reset form after successful submission
			formData = {
				studentName: '',
				senderNumber: '',
				transactionID: '',
				refundNumber: '',
				bkashTime: '',
				submissionTime: ''
			};
		} catch (e) {
			console.error('Error adding document: ', e);
			submitError = 'আবেদন জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
		}

		submitting = false;
	}
</script>

<svelte:head>
	<title>রিফান্ড আবেদন - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</title>
</svelte:head>

<div class="space-y-8">
	<h1 class="text-3xl font-bold text-center text-teal-700">রিফান্ড আবেদন</h1>
	<h2 class="text-xl font-semibold text-center text-teal-600">
		কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫
	</h2>

	<div class="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-lg shadow-md">
		<h3 class="text-2xl font-bold mb-4 text-center">গুরুত্বপূর্ণ বিজ্ঞপ্তি</h3>
		<div in:fly={{ y: 50, duration: 500 }} class="bg-white bg-opacity-20 p-6 rounded-lg space-y-4">
			<p class="text-lg leading-relaxed">
				আপনার রেজিস্ট্রেশন সিলেট মহানগরের বাইরের একটি শিক্ষা প্রতিষ্ঠানের জন্য করা হয়েছে বিধায় আপনার রেজিস্ট্রেশন <span class="font-bold text-yellow-200">সাময়িকভাবে স্থগিত</span> রাখা হয়েছে।
			</p>
            <p class="text-lg leading-relaxed">
				যদি সিলেট মহানগরে পরীক্ষা দিতে চান, তাহলে নিচের ফরমটি পূরণ করতে হবে না এবং আপনার রেজিস্ট্রেশন স্বয়ংক্রিয়ভাবে চূড়ান্ত করা হবে।
			</p>
			<p class="text-lg leading-relaxed">
				যদি <span class="font-bold text-yellow-200">২৪ অক্টোবর, ২০২৫</span> তারিখের মধ্যে রিফান্ড আবেদন জমা না দেন, তাহলে আপনার রেজিস্ট্রেশন <span class="font-bold">চূড়ান্ত</span> করা হবে এবং পরবর্তীতে কোনো রিফান্ড দেওয়া হবে না।
			</p>
			<div class="mt-4 p-4 bg-yellow-400 bg-opacity-30 rounded-lg">
				<p class="text-xl font-bold text-center">
					শেষ তারিখ: ২৪ অক্টোবর, ২০২৫
				</p>
			</div>
		</div>
	</div>

	<h3 class="text-2xl font-bold text-center text-teal-800 mb-6">রিফান্ড আবেদন ফরম</h3>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6 bg-white p-6 rounded-lg shadow-md">
		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				ছাত্র/ছাত্রীর নাম (বাংলায়) <span class="text-red-500">*</span>
			</label>
			<input 
				type="text" 
				bind:value={formData.studentName} 
				required 
				class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
				placeholder="যেমন: মোহাম্মদ রহিম"
			>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				বিকাশ প্রেরকের নাম্বার <span class="text-red-500">*</span>
			</label>
			<input 
				type="tel" 
				bind:value={formData.senderNumber} 
				required 
				class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
				placeholder="01XXXXXXXXX"
			>
			<p class="text-xs text-gray-500 mt-1">যে নাম্বার থেকে টাকা পাঠানো হয়েছিল</p>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				ট্রান্সেকশন আইডি (Transaction ID) <span class="text-red-500">*</span>
			</label>
			<input 
				type="text" 
				bind:value={formData.transactionID} 
				required 
				class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
				placeholder="যেমন: 9BK5ABCD12"
			>
			<p class="text-xs text-gray-500 mt-1">যে আইডি রেজিস্ট্রেশনে ব্যবহার করা হয়েছিল</p>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				রিফান্ড গ্রহণের বিকাশ নাম্বার <span class="text-red-500">*</span>
			</label>
			<input 
				type="tel" 
				bind:value={formData.refundNumber} 
				required 
				class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
				placeholder="01XXXXXXXXX"
			>
			<p class="text-xs text-gray-500 mt-1">যে নাম্বারে রিফান্ড পেতে চান</p>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">
				বিকাশ পেমেন্ট করার সময় <span class="text-red-500">*</span>
			</label>
			<input 
				type="text" 
				bind:value={formData.bkashTime} 
				required 
				class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
				placeholder="যেমন: ২০ অক্টোবর, ২০২৫ - দুপুর ২টা"
			>
			<p class="text-xs text-gray-500 mt-1">কখন টাকা পাঠানো হয়েছিল</p>
		</div>

		<div class="text-center pt-4">
			<button 
				type="submit" 
				class="bg-teal-600 text-white py-3 px-8 rounded-md hover:bg-teal-700 transition-colors text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed" 
				disabled={submitting}
			>
				{submitting ? 'জমা দেওয়া হচ্ছে...' : 'রিফান্ড আবেদন জমা দিন'}
			</button>
		</div>
	</form>

	{#if submitSuccess}
		<div in:fly={{ y: 20, duration: 500 }} class="mt-4 p-6 bg-green-100 border-l-4 border-green-500 text-green-800 rounded shadow-md">
			<div class="flex items-center">
				<svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
				</svg>
				<div>
					<p class="font-bold text-lg">সফলভাবে জমা হয়েছে!</p>
					<p class="text-sm mt-1">আপনার রিফান্ড আবেদন সফলভাবে জমা দেওয়া হয়েছে। শীঘ্রই প্রক্রিয়া করা হবে।</p>
				</div>
			</div>
		</div>
	{/if}

	{#if submitError}
		<div in:fly={{ y: 20, duration: 500 }} class="mt-4 p-6 bg-red-100 border-l-4 border-red-500 text-red-800 rounded shadow-md">
			<p class="font-semibold">{submitError}</p>
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
<script>
	import {
		collection,
		getDocs,
		query,
		orderBy,
		where
	} from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { onMount } from 'svelte';
	let csvData = [];
	let error = null;
  export let branch;
  export let branchName;

  let center = {
    1: 'শাহজালাল জামেয়া ইসলামিয়া স্কুল এন্ড কলেজ, মিরাবাজার',
    2: 'শাহজালাল জামেয়া ইসলামিয়া কামিল মাদরাসা, পাঠানটুলা',
    3: 'আল আমিন জামেয়া উচ্চ বিদ্যালয়, মেজরটিলা',
  }

	onMount(async () => {
		try {
			const q = query(
				collection(db, 'offline-2025'),
				where('branch', '==', branch),
        where('roll', '!=', null),
				orderBy('serial', 'desc')
			);
			const querySnapshot = await getDocs(q);
			let registrations = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			csvData = registrations;
		} catch (err) {
			console.error('Error loading registrations:', err);
			throw err;
		}
	});
</script>

{#if error}
	<div class="error">
		{error}
	</div>
{/if}
<div class="print:hidden">
	<div class="toggle-container">
		<button class="m-8 bg-black rounded-lg text-white px-4 py-2" on:click={() => window.print()}>
			Print
		</button>
	</div>
</div>
<div>
		<div class="a4-page">
			<div class="flex flex-col">
				{#each csvData as card}
          <div class="admit-card">

            <div class="bg-white text-sm">
              <div class="bg-blue-400 text-white p-2 text-center mb-3 w-full flex justify-between">
                <div class="flex-1">
                  <p>বৃত্তি রোল</p>
                  <div class="border mx-16 font-bold bg-slate-400">{card.roll}</div>
                </div>
                <div class="flex-1">
                  <h1 class="text-xl font-bold">কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৫</h1>
                  <p class="text-sm border-2 rounded-full">প্রবেশপত্র</p>
                </div>
                <div class="flex-1"></div>
              </div>
  
              <div class="w-full">
                <div class="grid grid-cols-4">
                  <div class="mb-2 col-span-2">
                    <p class="text-gray-600">পরীক্ষার্থীর নাম</p>
                    <p class="font-semibold">{card.name}</p>
                  </div>
                  <div class="mb-2">
                    <p class="text-gray-600">পিতার নাম</p>
                    <p class="font-semibold">{card.fatherName}</p>
                  </div>
                  <div class="mb-2">
                    <p class="text-gray-600">মোবাইল</p>
                    <p class="font-semibold">{card.mobile}</p>
                  </div>
                  <div class="mb-2 col-span-2">
                    <p class="text-gray-600">প্রতিষ্ঠানের নাম</p>
                    <p class="font-semibold">{card.institution}</p>
                  </div>
                  <div class="mb-2">
                    <p class="text-gray-600">শ্রেণি</p>
                    <p class="font-semibold">{card.class}</p>
                  </div>
                  <div class="mb-2">
                    <div class="w-1/2">
                      <label class="block text-sm font-medium text-gray-700"></label>
                      <div class="flex space-x-4">
                        <label class="inline-flex items-center">
                          <input
                            type="radio"
                            value="male"
                            checked={card.gender == 'male' ? true : false}
                            required
                            class="form-radio"
                          />
                          <span class="ml-2">ছাত্র</span>
                        </label>
                        <label class="inline-flex items-center">
                          <input
                            type="radio"
                            value="female"
                            checked={card.gender == 'female' ? true : false}
                            required
                            class="form-radio"
                          />
                          <span class="ml-2">ছাত্রী</span>
                        </label>
                      </div>
                    </div>
                    <div class="w-1/2">
                      <label class="block text-sm font-medium text-gray-700"></label>
                      <div class="flex space-x-4">
                        <label class="inline-flex items-center">
                          <input
                            type="radio"
                            value="male"
                            checked={card.institutionType == 'school' ? true : false}
                            required
                            class="form-radio"
                          />
                          <span class="ml-2">স্কুল</span>
                        </label>
                        <label class="inline-flex items-center">
                          <input
                            type="radio"
                            value="female"
                            checked={card.institutionType == 'school' ? false : true}
                            required
                            class="form-radio"
                          />
                          <span class="ml-2">মাদরাসা</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <div class="text-sm border-2 border-blue-400">
                <div class="text-lg font-semibold text-blue-400 flex justify-between">
                  <div>পরীক্ষার কেন্দ্রঃ</div>
                  <div>
                    {center[card.roll[0]]}
                  </div>
                  <div></div>
                </div>
                <div class="w-full bg-blue-400 text-center text-white">পরীক্ষার সময়সূচী</div>
                <div class="grid grid-cols-3 text-xs divide-x-2 divide-blue-400 text-center">
                  <div>
                    ১ নভেম্বর, ২০২৫ <br /> শনিবার
                  </div>
                  <div class="divide-y-2 divide-blue-400">
                    <div>১০:০০-১১:০০</div>
                    <div>বাংলা ও ইংরেজি</div>
                  </div>
                  <div class="divide-y-2 divide-blue-400">
                    <div>১১:১০-১২:১০</div>
                    <div>গণিত ও সাধারণ জ্ঞান/সাধারণ বিজ্ঞান</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col justify-around bg-white text-sm p-4">
              <div>
                <div class="text-center text-lg">পরীক্ষা সংক্রান্ত নিয়মাবলী</div>
                <div>
                  - প্রবেশপত্র ব্যতিত কোন পরীক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে না। <br />
                  - প্রত্যেক পরীক্ষার্থী প্রয়োজনীয় ক্যালকুলেটর, কলম ও জ্যামিতি বক্স অবশ্যই সাথে আনতে হবে।
                  এছাড়া অতিরিক্ত কাগজ সাথে রাখা যাবে না<br />
                </div>
              </div>
              <div class="text-blue-400">
                <span>ঠিকানাঃ {card.presentAddress}</span>
              </div>
              <div class="mt-4 flex justify-between">
                <div class=" mx-4 border-2 border-blue-400 pt-2 px-8">
                  <div>
                    <div class="font-semibold">অফিস কর্তৃক পূরণীয়</div>
                    <div>শাখাঃ {branchName} ({card.ward ?? ''})</div>
                    <div>সিরিয়ালঃ {card.serial}</div>
                  </div>
                </div>
                <div class="text-center relative">
                  <img src="/sign.png" alt="" srcset="" class="left-4 h-20 w-30 absolute" />
                  <div class="w-40 h-10 border-b-2 border-gray-400 mt-8"></div>
                  <p class="mt-1">পরিচালকের স্বাক্ষর</p>
                </div>
              </div>
            </div>
          </div>
				{/each}
			</div>
		</div>
</div>

<style>
	.a4-page {
		width: 210mm;
		min-height: 297mm;
		padding: 10mm;
		margin: 0 auto;
		background-color: white;
	}
	.error {
		color: red;
		margin: 10px 0;
		padding: 10px;
		background-color: #fff0f0;
		border-radius: 4px;
	}

	.admit-card {
		height: 148.5mm; /* Approximately 1/2 of A4 height minus some space for margins */
	}
	@media print {
		.a4-page {
			width: 210mm;
			min-height: 297mm;
			padding: 4mm;
			margin: 0;
		}
		@page {
			size: A4;
			margin: 0;
		}
	}

</style>

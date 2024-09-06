<!-- src/routes/britti_registration/+page.svelte -->
<script>
    let formData = {
      regNo: '',
      examCenter: '',
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
      serialNo: ''
    };
  
    function handleSubmit() {
      // Handle form submission here
      console.log(formData);
      // You would typically send this data to your server
    }
  </script>
  
  <svelte:head>
    <title>কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪ - নিবন্ধন ফরম</title>
  </svelte:head>
  
  <div class="min-h-screen bg-cyan-100 p-4">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-3xl font-bold text-center text-cyan-700 mb-6">
        কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪
      </h1>
      <h2 class="text-xl font-semibold text-center text-cyan-600 mb-4">
        আয়োজনে: কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর
      </h2>
      <h3 class="text-2xl font-bold text-center text-cyan-800 mb-6">রেজিস্ট্রেশন ফরম</h3>
  
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="flex justify-between">
          <div class="w-1/2">
            <label class="block text-sm font-medium text-gray-700">রেজিঃ নং DA-3075</label>
            <div class="flex space-x-2">
              <input type="checkbox" class="form-checkbox"> স্কুল
              <input type="checkbox" class="form-checkbox"> মাদরাসা
            </div>
          </div>
          <div class="w-1/3">
            <label class="block text-sm font-medium text-gray-700">পাসপোর্ট সাইজ ছবি</label>
            <div class="border-2 border-dashed border-gray-300 p-4 text-center">
              ছবি আপলোড করুন
            </div>
          </div>
        </div>
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">পরীক্ষার্থীর নাম (বাংলায়)</label>
            <input type="text" bind:value={formData.name} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">ইংরেজিতে</label>
            <input type="text" bind:value={formData.nameEnglish} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">পিতার নাম (বাংলায়)</label>
            <input type="text" bind:value={formData.fatherName} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">মাতার নাম (বাংলায়)</label>
            <input type="text" bind:value={formData.motherName} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">শিক্ষা প্রতিষ্ঠান</label>
            <input type="text" bind:value={formData.institution} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">শ্রেণি</label>
              <input type="text" bind:value={formData.class} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">শাখা</label>
              <input type="text" bind:value={formData.section} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">রোল</label>
              <input type="text" bind:value={formData.classRoll} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">জন্ম তারিখ</label>
            <input type="date" bind:value={formData.birthDate} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">ধর্ম</label>
            <input type="text" bind:value={formData.religion} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">মোবাইল</label>
            <input type="tel" bind:value={formData.mobile} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
        </div>
  
        <div>
          <h4 class="font-semibold">স্থায়ী ঠিকানা</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">গ্রাম</label>
              <input type="text" bind:value={formData.permanentAddress.village} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">ডাক</label>
              <input type="text" bind:value={formData.permanentAddress.postOffice} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">থানা</label>
              <input type="text" bind:value={formData.permanentAddress.upazila} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">জেলা</label>
              <input type="text" bind:value={formData.permanentAddress.district} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
            </div>
          </div>
        </div>
  
        <div>
          <label class="block text-sm font-medium text-gray-700">বর্তমান ঠিকানা</label>
          <input type="text" bind:value={formData.presentAddress} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
        </div>
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">অভিভাবকের নাম</label>
            <input type="text" bind:value={formData.guardianName} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">সম্পর্ক</label>
            <input type="text" bind:value={formData.relation} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">মোবাইল নাম্বার (অলটারনেট)</label>
            <input type="tel" bind:value={formData.guardianMobile} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">সিরিয়াল নাম্বার</label>
            <input type="text" bind:value={formData.serialNo} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
          </div>
        </div>
  
        <div class="text-center">
          <button type="submit" class="bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors">
            নিবন্ধন সম্পন্ন করুন
          </button>
        </div>
      </form>
  
      <div class="mt-8 text-sm text-gray-600 text-center">
        বিস্তারিত তথ্যের জন্য: www.kishorkhantasylhet.org
      </div>
    </div>
  </div>
<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { db } from '$lib/firebase';
    import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
        branch: '',
    };

    let loading = true;
    let updating = false;
    let error = null;
    let success = false;
    const id = $page.params.id;

    let classOptions = [
        { value: '৪র্থ', label: '৪র্থ শ্রেণি' },
        { value: '৫ম', label: '৫ম শ্রেণি' },
        { value: '৬ষ্ঠ', label: '৬ষ্ঠ শ্রেণি' },
        { value: '৭ম', label: '৭ম শ্রেণি' },
        { value: '৮ম', label: '৮ম শ্রেণি' },
        { value: '৯ম', label: '৯ম শ্রেণি' },
        { value: '১০ম', label: '১০ম শ্রেণি' }
    ];

    onMount(async () => {
        try {
            const docRef = doc(db, 'offline', id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                formData = { ...docSnap.data() };
            } else {
                error = 'Registration not found';
            }
        } catch (e) {
            console.error('Error loading registration:', e);
            error = 'Failed to load registration data';
        } finally {
            loading = false;
        }
    });

    async function handleSubmit() {
        updating = true;
        success = false;
        error = null;

        try {
            const docRef = doc(db, 'offline', id);
            await updateDoc(docRef, formData);
            success = true;
            goto(`/offline/${formData.branch}/list`);
        } catch (e) {
            console.error('Error updating registration:', e);
            error = 'Failed to update registration';
        } finally {
            updating = false;
        }
    }
</script>

<svelte:head>
    <title>Edit Registration - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪</title>
</svelte:head>

<div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-center text-teal-700 mb-8">
        রেজিস্ট্রেশন সম্পাদনা
    </h1>

    {#if loading}
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
            <p class="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
        </div>
    {:else}
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <div class="flex justify-between">
                <div class="w-1/2">
                    <label class="block text-sm font-medium text-gray-700">রেজিঃ নং DA-{formData.serial}</label>
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
                    <label class="block text-sm font-medium text-gray-700">সিরিয়াল</label>
                    <input type="text" bind:value={formData.serial} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
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
                            <option value="" disabled>শ্রেণি নির্বাচন করুন</option>
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
                    <input type="tel" bind:value={formData.mobile} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700">বর্তমান ঠিকানা</label>
                <input type="text" bind:value={formData.presentAddress} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm">
            </div>

            <div class="flex justify-center space-x-4">
                <button 
                    type="submit" 
                    class="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50"
                    disabled={updating}
                >
                    {updating ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                </button>
                <a 
                    href="/offline/{formData.branch}/admin"
                    class="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                    বাতিল করুন
                </a>
            </div>
        </form>

        {#if success}
            <div class="mt-4 p-2 bg-green-100 text-green-700 rounded">
                Registration updated successfully!
            </div>
        {/if}
    {/if}
</div>
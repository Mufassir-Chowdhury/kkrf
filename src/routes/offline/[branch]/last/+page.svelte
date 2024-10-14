<script>

    import { onMount } from 'svelte';
    import { initializeApp } from 'firebase/app';
    import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
    import { page } from '$app/stores';
    const firebaseConfig = {
        apiKey: 'AIzaSyBy8i9BLWzUMulNQJkJsbDX8m6MFYz6T_k',
        authDomain: 'kkrf-sylhet.firebaseapp.com',
        projectId: 'kkrf-sylhet',
        storageBucket: 'kkrf-sylhet.appspot.com',
        messagingSenderId: '973839955936',
        appId: '1:973839955936:web:eefd07d1a4b7be73b91d85'
    };
    
    let lastRegistration = null;
    let previousRegistration = null;
    let loading = true;
    let error = null;
    let branch = $page.params.branch;
    
    onMount(async () => {
        try {
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
    
            // Create query to get the last two registrations for this branch
            const q = query(
                collection(db, 'offline'),
                where('branch', '==', branch),
                orderBy('creationTime', 'desc'),
                limit(2)
            );
    
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                lastRegistration = querySnapshot.docs[0].data();
                if (querySnapshot.docs.length > 1) {
                    previousRegistration = querySnapshot.docs[1].data();
                }
            }
        } catch (e) {
            console.error('Error fetching registrations:', e);
            error = 'Failed to fetch registration data';
        } finally {
            loading = false;
        }
    });
    
    function getInstitutionType(type) {
        return type === 'school' ? 'স্কুল' : 'মাদরাসা';
    }
    
    function getGender(gender) {
        return gender === 'male' ? 'ছাত্র' : 'ছাত্রী';
    }
</script>

<svelte:head>
    <title>Last Registration - {branch} Branch</title>
</svelte:head>

<div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-center text-teal-700 mb-8">
        সর্বশেষ নিবন্ধন - {branch}
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
    {:else if lastRegistration}
        <div class="bg-white shadow-md rounded-lg p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <p class="text-gray-600">রেজিঃ নং</p>
                    <p class="font-medium">DA-{lastRegistration.serial}</p>
                </div>
                <div class="space-y-2">
                    <p class="text-gray-600">নিবন্ধনের সময়</p>
                    <p class="font-medium">
                        {new Date(lastRegistration.creationTime).toLocaleString('bn-BD')}
                    </p>
                </div>
                <div class="space-y-2">
                    <p class="text-gray-600">প্রতিষ্ঠানের ধরন</p>
                    <p class="font-medium">{getInstitutionType(lastRegistration.institutionType)}</p>
                </div>
                <div class="space-y-2">
                    <p class="text-gray-600">শিক্ষার্থীর ধরন</p>
                    <p class="font-medium">{getGender(lastRegistration.gender)}</p>
                </div>
                <div class="space-y-2">
                    <p class="text-gray-600">নাম</p>
                    <p class="font-medium">{lastRegistration.name}</p>
                </div>
                <div class="space-y-2">
                    <p class="text-gray-600">পিতার নাম</p>
                    <p class="font-medium">{lastRegistration.fatherName}</p>
                </div>
                <div class="space-y-2">
                    <p class="text-gray-600">শিক্ষা প্রতিষ্ঠান</p>
                    <p class="font-medium">{lastRegistration.institution}</p>
                </div>
                <div class="space-y-2">
                    <p class="text-gray-600">শ্রেণি</p>
                    <p class="font-medium">{lastRegistration.class}</p>
                </div>
                <div class="space-y-2">
                    <p class="text-gray-600">শাখা</p>
                    <p class="font-medium">{lastRegistration.section}</p>
                </div>
                <div class="space-y-2">
                    <p class="text-gray-600">রোল</p>
                    <p class="font-medium">{lastRegistration.classRoll}</p>
                </div>
                <div class="space-y-2">
                    <p class="text-gray-600">মোবাইল</p>
                    <p class="font-medium">{lastRegistration.mobile}</p>
                </div>
                <div class="col-span-2 space-y-2">
                    <p class="text-gray-600">ঠিকানা</p>
                    <p class="font-medium">{lastRegistration.presentAddress}</p>
                </div>
            </div>
        </div>

        {#if previousRegistration}
            <div class="mt-4 flex justify-end">
                <a 
                    href="/offline/{branch}/{previousRegistration.serial}"
                    class="text-teal-600 hover:text-teal-700 hover:underline"
                >
                    পূর্ববর্তী নিবন্ধন দেখুন →
                </a>
            </div>
        {/if}
    {:else}
        <div class="text-center py-8 bg-gray-50 rounded-lg">
            <p class="text-gray-600">কোনো নিবন্ধন পাওয়া যায়নি</p>
        </div>
    {/if}

    <div class="mt-6 flex justify-center space-x-4">
        <a 
            href="/offline/{branch}"
            class="inline-block bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
        >
            নতুন নিবন্ধন করুন
        </a>
        {#if lastRegistration}
            <a 
                href="/offline/{branch}/{lastRegistration.serial}"
                class="inline-block bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
                বর্তমান ফর্মে যান
            </a>
        {/if}
    </div>
</div>
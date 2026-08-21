<script>
    import { onMount } from 'svelte';
    import { getSiteInfo } from '$lib/siteData';

    let siteInfo = null;

    onMount(async () => {
        siteInfo = await getSiteInfo();
    });
</script>

<svelte:head>
    <title>যোগাযোগ - কিশোরকণ্ঠ পাঠক ফোরাম, সিলেট মহানগর</title>
</svelte:head>

<div class="space-y-16">
    <section class="text-center pt-4">
        <span class="section-eyebrow">যোগাযোগ</span>
        <h1 class="text-4xl md:text-5xl font-extrabold text-primary-900 mb-3 tracking-tight">যোগাযোগ করুন</h1>
        <p class="text-lg md:text-xl text-gray-500">আমরা আপনার কাছ থেকে শুনতে আগ্রহী</p>
    </section>

    <section class="card grid md:grid-cols-2 gap-12 items-center">
        <div>
            <h2 class="section-title mb-6">প্রধান কার্যালয়</h2>
            <div class="space-y-6 text-lg text-gray-700">
                <p>
                    <strong class="font-semibold text-primary-900">ঠিকানা:</strong><br>
                    {siteInfo?.address ?? ''}
                </p>
                <p>
                    <strong class="font-semibold text-primary-900">ফোন:</strong><br>
                    <a href="tel:{siteInfo?.phone ?? ''}" class="hover:text-primary-700 transition-colors">{siteInfo?.phone ?? ''}</a>
                </p>
                <p>
                    <strong class="font-semibold text-primary-900">ইমেইল:</strong><br>
                    <a href="mailto:{siteInfo?.email ?? ''}" class="hover:text-primary-700 transition-colors">{siteInfo?.email ?? ''}</a>
                </p>
                <p>
                    <strong class="font-semibold text-primary-900">অফিস সময়:</strong><br>
                    {siteInfo?.officeTime ?? ''}
                </p>
            </div>
        </div>
        <div class="bg-primary-50 rounded-lg p-8 border border-primary-100">
            <h3 class="text-xl font-bold text-primary-900 mb-4">আমাদেরকে ইমেইল করুন</h3>
            <p class="text-gray-600 mb-6">যেকোনো জিজ্ঞাসার জন্য, আমাদের এই ঠিকানায় ইমেইল করুন।</p>
            <a href="mailto:{siteInfo?.email ?? ''}" class="btn-primary">
                ইমেইল পাঠান
            </a>
        </div>
    </section>

    <section class="card">
        <h2 class="section-title mb-8 text-center">অন্যান্য যোগাযোগের নম্বর</h2>
        <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {#each siteInfo?.contactPersons || [] as person}
                <div class="border border-gray-200 rounded-lg p-6 hover:border-primary-200 transition-colors">
                    <h3 class="text-lg font-bold text-primary-900">{person.name}</h3>
                    <p class="text-secondary-600 font-medium mt-2">{person.phone}</p>
                </div>
            {/each}
        </div>
    </section>

    <div class="text-sm text-gray-500 text-center py-8 border-t border-gray-200">
        <p>বিস্তারিত তথ্যের জন্য আমাদের ওয়েবসাইট ভিজিট করুন: <a href="http://www.kkrfsylhet.org" class="text-primary-700 hover:underline">www.kkrfsylhet.org</a></p>
    </div>
</div>

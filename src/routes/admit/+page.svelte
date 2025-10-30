<script>
    import { goto } from '$app/navigation';
    import { encodeRoll } from '$lib/hash';
    import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, getDoc, where, setDoc, writeBatch, limit } from 'firebase/firestore';
    import { db } from '$lib/firebase';
  
    let roll = '';
    let error = '';
    let loading = false;
    
    // SMS resend section
    let resendRoll = '';
    let resendError = '';
    let resendLoading = false;
    let resendSuccess = '';
  
    async function handleLogin() {
        loading = true;
        error = '';
        try {
            const trimmedRoll = roll.trim();
            goto(`/admit/${trimmedRoll}`);
        } catch (err) {
            error = "Invalid code. Please try again.";
        } finally {
            loading = false;
        }
    }
    
    async function handleResendSMS() {
        resendLoading = true;
        resendError = '';
        resendSuccess = '';
        
        try {
            const trimmedRoll = resendRoll.trim();
            
            const q = query(
                collection(db, 'offline-2025'),
                where('roll', '==', trimmedRoll),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            let registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            
            if (registrations.length === 0) {
                resendError = 'রোল নম্বর খুঁজে পাওয়া যায়নি। দয়া করে সঠিক রোল নম্বর প্রদান করুন।';
                return;
            }
            
            const reg = registrations[0];
            const mobile = reg.mobile;
            
            if (!mobile) {
                resendError = 'ফোন নম্বর পাওয়া যায়নি। অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।';
                return;
            }
            
            // Generate admit card code
            const hash = encodeRoll(trimmedRoll);
            const message = `এডমিট কার্ড এর কোড - ${hash}`;
            
            // Send SMS
            const url = 'https://api.bdbulksms.net/api.php?json';
            const t1 = '59702300401725';
            const t2 = '814840c01d5e52';
            const t3 = '79bac7dda539127ec4a9f539';
            const SMS_API_TOKEN = `${t1}${t2}${t3}`;
            
            const data = new FormData();
            data.set('token', SMS_API_TOKEN);
            data.set('message', message);
            data.set('to', mobile);
            
            const response = await fetch(url, {
                method: 'POST',
                body: data
            });
            
            const result = await response.json();
            console.log('SMS API Response:', result[0]);
            if (result[0].status === 'SENT' || result[0].response_code === 202) {
                resendSuccess = `SMS সফলভাবে ${mobile} নম্বরে পাঠানো হয়েছে।`;
            } else {
                resendError = 'SMS পাঠাতে ব্যর্থ। অনুগ্রহ করে পরে আবার চেষ্টা করুন।';
            }
            
        } catch (err) {
            console.error('Error resending SMS:', err);
            resendError = 'একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।';
        } finally {
            resendLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Admit Card - কিশোরকণ্ঠ পাঠক ফোরাম</title>
</svelte:head>

<div class="flex items-center justify-center min-h-[70vh] py-8">
    <div class="w-full max-w-2xl px-4">
        <!-- Admit Card Download Section -->
        <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
            <h1 class="text-4xl font-bold text-center text-primary-800 mb-8">Admit Card Download</h1>
            
            <form on:submit|preventDefault={handleLogin} class="space-y-6">
                <div>
                    <label for="roll" class="block text-lg font-medium text-gray-700 mb-2">Code</label>
                    <input 
                        type="text" 
                        id="roll" 
                        bind:value={roll} 
                        required 
                        class="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="Enter the 6 character code"
                    />
                    <span class="text-sm text-gray-600 mt-2 block">এডমিট কার্ড সংক্রান্ত ম্যাসেজে প্রাপ্ত লিংকের শেষ ৬ টি ক্যারেক্টার প্রদান করুন। যেমনঃ AABSoU</span>
                    <p class="text-sm text-gray-600 mt-1">*এডমিট কার্ড পেয়ে থাকলে নতুন করে ডাউনলোড করতে হবে না।</p>
                    <p class="text-sm text-gray-600 mt-1">*এডমিট কার্ডের ম্যাসেজ না পেয়ে থাকলে নিচের সেকশনে রোল প্রদান করুন।</p>
                </div>
                
                {#if error}
                    <p class="text-red-500 text-center text-sm">{error}</p>
                {/if}
                
                <div class="text-center pt-4">
                    <button 
                        type="submit" 
                        class="w-full bg-primary-600 text-white py-3 px-8 rounded-full hover:bg-primary-700 transition-transform transform hover:scale-105 text-xl font-semibold shadow-lg disabled:bg-gray-400 disabled:scale-100"
                        disabled={loading}
                    >
                        {loading ? 'Downloading...' : 'Download Admit Card'}
                    </button>
                </div>
            </form>
        </div>
        
        <!-- Resend SMS Section -->
        <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <h2 class="text-3xl font-bold text-center text-primary-800 mb-6">SMS না পেয়ে থাকলে</h2>
            <p class="text-center text-gray-600 mb-6">আপনার রোল নম্বর দিয়ে পুনরায় SMS পাঠান</p>
            
            <form on:submit|preventDefault={handleResendSMS} class="space-y-6">
                <div>
                    <label for="resendRoll" class="block text-lg font-medium text-gray-700 mb-2">Roll Number</label>
                    <input 
                        type="text" 
                        id="resendRoll" 
                        bind:value={resendRoll} 
                        required 
                        class="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="123456"
                    />
                    <span class="text-sm text-gray-600 mt-2 block">আপনার ৬ সংখ্যার রোল নম্বর প্রদান করুন</span>
                </div>
                
                {#if resendError}
                    <p class="text-red-500 text-center text-sm">{resendError}</p>
                {/if}
                
                {#if resendSuccess}
                    <p class="text-green-600 text-center text-sm font-medium">{resendSuccess}</p>
                {/if}
                
                <div class="text-center pt-4">
                    <button 
                        type="submit" 
                        class="w-full bg-green-600 text-white py-3 px-8 rounded-full hover:bg-green-700 transition-transform transform hover:scale-105 text-xl font-semibold shadow-lg disabled:bg-gray-400 disabled:scale-100"
                        disabled={resendLoading}
                    >
                        {resendLoading ? 'পাঠানো হচ্ছে...' : 'SMS পুনরায় পাঠান'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
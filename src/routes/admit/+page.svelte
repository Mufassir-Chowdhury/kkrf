<script>
    import { goto } from '$app/navigation';
  
    let roll = '';
    let mobile = '';
    let error = '';
    let loading = false;
  
    async function handleLogin() {
        loading = true;
        error = '';
        try {
            goto(`/admit/${roll}?challenge=${mobile}`);
        } catch (err) {
            error = "Invalid credentials. Please try again.";
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Admit Card - কিশোরকণ্ঠ পাঠক ফোরাম</title>
</svelte:head>

<div class="flex items-center justify-center min-h-[70vh]">
    <div class="w-full max-w-md px-4">
        <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <h1 class="text-4xl font-bold text-center text-primary-800 mb-8">Admit Card Download</h1>
            
            <form on:submit|preventDefault={handleLogin} class="space-y-6">
                <div>
                    <label for="roll" class="block text-lg font-medium text-gray-700 mb-2">Roll Number</label>
                    <input 
                        type="number" 
                        id="roll" 
                        bind:value={roll} 
                        required 
                        class="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="Enter your roll number"
                    />
                </div>
                <div>
                    <label for="mobile" class="block text-lg font-medium text-gray-700 mb-2">Mobile Number</label>
                    <input 
                        type="tel" 
                        id="mobile" 
                        bind:value={mobile} 
                        required 
                        class="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="Enter the 11-digit mobile number"
                    />
                    <p class="text-sm text-gray-500 mt-1">যে নাম্বারে ম্যাসেজ পেয়েছেন সেই ফোন নাম্বারটি দিন।</p>
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
    </div>
</div>

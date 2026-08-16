<script>
    import { auth } from '$lib/firebase';
    import { signInWithEmailAndPassword } from 'firebase/auth';
    import { goto } from '$app/navigation';
  
    let email = 'info@kkrfsylhet.org';
    let password = '';
    let error = '';
    let loading = false;
  
    async function handleLogin() {
      loading = true;
      error = '';
      try {
        await signInWithEmailAndPassword(auth, email, password);
        goto('/admin');
      } catch (err) {
        error = "Invalid password. Please try again.";
      } finally {
        loading = false;
      }
    }
</script>

<svelte:head>
    <title>Admin Login - কিশোরকণ্ঠ পাঠক ফোরাম</title>
</svelte:head>

<div class="flex items-center justify-center min-h-[70vh]">
    <div class="w-full max-w-md px-4">
        <div class="card">
            <h1 class="text-2xl font-bold text-center text-primary-900 mb-8">Admin Login</h1>
            
            <form on:submit|preventDefault={handleLogin} class="space-y-6">
                <div>
                    <label for="password" class="block text-lg font-medium text-gray-700 mb-2">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        bind:value={password} 
                        required 
                        class="w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 text-base focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="Enter your password"
                    />
                </div>
                
                {#if error}
                    <p class="text-red-500 text-center text-sm">{error}</p>
                {/if}
                
                <div class="text-center pt-4">
                    <button 
                        type="submit" 
                        class="w-full bg-primary-800 text-white py-3 px-8 rounded-md hover:bg-primary-900 transition-colors text-base font-semibold shadow-card disabled:bg-gray-400"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

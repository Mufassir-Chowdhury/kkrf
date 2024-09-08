<script>
    import { auth } from '$lib/firebase';
    import { signInWithEmailAndPassword } from 'firebase/auth';
    import { goto } from '$app/navigation';
  
    let email = 'info@kkrfsylhet.org';
    let password = '';
    let error = '';
  
    async function handleLogin() {
      try {
        let authUser = await signInWithEmailAndPassword(auth, email, password);
        console.log(authUser.user);
        console.log("   Login successful");
        goto('/admin');
      } catch (err) {
        error = err.message;
      }
    }
  </script>
  
  <svelte:head>
    <title>Admin Login - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪</title>
  </svelte:head>
  
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold text-center text-teal-700 mb-6">Admin Login</h1>
      
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            id="password" 
            bind:value={password} 
            required 
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        {#if error}
          <p class="text-red-500 text-sm">{error}</p>
        {/if}
        
        <button 
          type="submit" 
          class="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  </div>
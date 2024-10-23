<script>
    import { goto } from '$app/navigation';
  
    let roll = '';
    let mobile = '';
    let error = '';
  
    async function handleLogin() {
      try {
        goto(`/admit/${roll}?challenge=${mobile}`);
      } catch (err) {
        error = err.message;
      }
    }
  </script>
  
  <svelte:head>
    <title>Admit Card Login - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৪</title>
  </svelte:head>
  
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold text-center text-teal-700 mb-6">Admit Card Login</h1>
      
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div>
            <label for="roll" class="block text-sm font-medium text-gray-700">Roll</label>
            <input 
              type="number" 
              id="roll" 
              bind:value={roll} 
              required 
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        <div>
          <label for="mobile" class="block text-sm font-medium text-gray-700">Mobile Number <br>(যে নাম্বারে ম্যাসেজ পেয়েছেন সেই ফোন নাম্বারের ১১ ডিজিট)</label>
          <input 
            type="mobile" 
            id="mobile" 
            bind:value={mobile} 
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
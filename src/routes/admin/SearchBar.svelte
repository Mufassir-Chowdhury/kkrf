<script>
    import { createEventDispatcher } from 'svelte';
    
    export let searchTerm = '';
    const dispatch = createEventDispatcher();
    
    function handleInput() {
      dispatch('search');
    }
  </script>
  
  <input 
    type="text" 
    bind:value={searchTerm} 
    on:input={handleInput} 
    placeholder="Search by name, institution, or mobile" 
    class="p-2 border border-gray-300 rounded-md w-64"
  />
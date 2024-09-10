<script>
    import { createEventDispatcher } from 'svelte';
    import { confirmRegistration, cancelConfirmation } from './dashboardUtils';
    
    export let registration;
    const dispatch = createEventDispatcher();
    
    async function handleConfirm() {
      await confirmRegistration(registration.id);
      dispatch('confirmationUpdate');
      dispatch('close');
    }
    
    async function handleCancel() {
      await cancelConfirmation(registration.id);
      dispatch('confirmationUpdate');
      dispatch('close');
    }
  </script>
  
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Registration Details</h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500">
            Transaction ID: {registration.transactionID}
          </p>
        </div>
        <div class="items-center px-4 py-3">
          {#if !registration.confirmed}
            <button
              on:click={handleConfirm}
              class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Confirm Registration
            </button>
          {:else}
            <button
              on:click={handleCancel}
              class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Cancel Confirmation
            </button>
          {/if}
          <button
            on:click={() => dispatch('close')}
            class="mt-3 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
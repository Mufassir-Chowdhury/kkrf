<script>
    export let title;
    export let subtitle = '';
</script>

<section class="text-center pt-8 mb-12">
    <h1 class="text-4xl md:text-5xl font-extrabold text-primary-800 mb-4">{title}</h1>
    {#if subtitle}
        <p class="text-xl md:text-2xl text-secondary-700">{subtitle}</p>
    {/if}
</section>

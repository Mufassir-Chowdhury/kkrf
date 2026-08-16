<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Admin Dashboard - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<span class="section-eyebrow">প্যানেল</span>
		<h2 class="section-title">Admin Dashboard</h2>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<a href="/admin/scholarship" class="block group">
			<div class="card p-6 hover:shadow-card-lg hover:-translate-y-0.5 transition-all border-t-4 border-t-primary-900">
				<h3 class="text-lg font-semibold text-primary-900 mb-1">Scholarship Settings</h3>
				<p class="text-gray-500 text-sm">Start a new year, toggle registration, edit site info</p>
			</div>
		</a>

		<a href="/admin/list" class="block group">
			<div class="card p-6 hover:shadow-card-lg hover:-translate-y-0.5 transition-all border-t-4 border-t-primary-700">
				<h3 class="text-lg font-semibold text-primary-900 mb-1">All Registrations</h3>
				<p class="text-gray-500 text-sm">Manage all scholarship applications</p>
			</div>
		</a>

		<a href="/admin/institutions" class="block group">
			<div class="card p-6 hover:shadow-card-lg hover:-translate-y-0.5 transition-all border-t-4 border-t-primary-700">
				<h3 class="text-lg font-semibold text-primary-900 mb-1">Institutions</h3>
				<p class="text-gray-500 text-sm">Manage all institutions</p>
			</div>
		</a>

		<a href="/admin/online" class="block group">
			<div class="card p-6 hover:shadow-card-lg hover:-translate-y-0.5 transition-all border-t-4 border-t-primary-700">
				<h3 class="text-lg font-semibold text-primary-900 mb-1">Online Registrations</h3>
				<p class="text-gray-500 text-sm">Manage online scholarship applications</p>
			</div>
		</a>

		<a href="/admin/refund" class="block group">
			<div class="card p-6 hover:shadow-card-lg hover:-translate-y-0.5 transition-all border-t-4 border-t-secondary-500">
				<h3 class="text-lg font-semibold text-primary-900 mb-1">Refund Applications</h3>
				<p class="text-gray-500 text-sm">Manage refund requests</p>
			</div>
		</a>

		<a href="/admin/search" class="block group">
			<div class="card p-6 hover:shadow-card-lg hover:-translate-y-0.5 transition-all border-t-4 border-t-secondary-500">
				<h3 class="text-lg font-semibold text-primary-900 mb-1">Search</h3>
				<p class="text-gray-500 text-sm">Search for students</p>
			</div>
		</a>

		<a href="/admin/result" class="block group">
			<div class="card p-6 hover:shadow-card-lg hover:-translate-y-0.5 transition-all border-t-4 border-t-secondary-500">
				<h3 class="text-lg font-semibold text-primary-900 mb-1">Results</h3>
				<p class="text-gray-500 text-sm">Manage results</p>
			</div>
		</a>
	</div>
</div>

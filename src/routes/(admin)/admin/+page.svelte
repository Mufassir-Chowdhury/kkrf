<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Admin Dashboard - কিশোরকণ্ঠ মেধাবৃত্তি পরীক্ষা ২০২৫</title>
</svelte:head>

<div class="space-y-6 p-6">
	<h2 class="text-2xl font-bold text-center text-teal-700">Admin Dashboard</h2>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<a href="/admin/list" class="block">
			<div
				class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border-l-4 border-blue-500"
			>
				<h3 class="text-xl font-semibold text-gray-800 mb-2">All Registrations</h3>
				<p class="text-gray-600">Manage all scholarship applications</p>
			</div>
		</a>

		<a href="/admin/institutions" class="block">
			<div
				class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border-l-4 border-blue-500"
			>
				<h3 class="text-xl font-semibold text-gray-800 mb-2">Institutions</h3>
				<p class="text-gray-600">Manage all institutions</p>
			</div>
		</a>

		<a href="/admin/online" class="block">
			<div
				class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border-l-4 border-blue-500"
			>
				<h3 class="text-xl font-semibold text-gray-800 mb-2">Online Registrations</h3>
				<p class="text-gray-600">Manage online scholarship applications</p>
			</div>
		</a>

		<a href="/admin/refund" class="block">
			<div
				class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border-l-4 border-green-500"
			>
				<h3 class="text-xl font-semibold text-gray-800 mb-2">Refund Applications</h3>
				<p class="text-gray-600">Manage refund requests</p>
			</div>
		</a>

		<a href="/admin/search" class="block">
			<div
				class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border-l-4 border-yellow-500"
			>
				<h3 class="text-xl font-semibold text-gray-800 mb-2">Search</h3>
				<p class="text-gray-600">Search for students</p>
			</div>
		</a>
	</div>
</div>

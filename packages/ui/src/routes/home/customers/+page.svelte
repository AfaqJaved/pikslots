<script>
	import { authStore } from '$stores/auth.svelte';
	import { routeRolesGuard } from '$utils/routes.roles.guard';
	import Customer from '../../../modules/customers/customer.svelte';

	let currentUserData = $derived(authStore.getPayloadData() ?? null);
</script>

{#if routeRolesGuard(['Platform Owner', 'Business Owner', 'Admin', 'Enhanced'], currentUserData?.role ?? null)}
	<Customer></Customer>
{/if}

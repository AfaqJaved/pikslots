<script>
	import Reviews from '../../../../modules/settings/reviews/reviews.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { routeRolesGuard } from '$utils/routes.roles.guard';

	let currentUserData = $derived(authStore.getPayloadData() ?? null);
</script>

{#if routeRolesGuard(['Platform Owner', 'Business Owner', 'Admin'], currentUserData?.role ?? null)}
	<Reviews />
{/if}

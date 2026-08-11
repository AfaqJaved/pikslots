<script>
	import BrandDetail from '../../../../../modules/settings/brand/brand-details/brand-detail.svelte';
	import { authStore } from '../../../../../modules/core/store/auth.svelte';
	import { routeRolesGuard } from '$utils/routes.roles.guard';

	let currentUserData = $derived(authStore.getPayloadData() ?? null);
</script>

{#if routeRolesGuard(['Platform Owner', 'Business Owner', 'Admin'], currentUserData?.role ?? null)}
	<BrandDetail></BrandDetail>
{/if}

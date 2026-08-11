<script lang="ts">
	import { authStore } from '$stores/auth.svelte';
	import { routeRolesGuard } from '$utils/routes.roles.guard';
	import YourBrand from '../../../../modules/settings/brand/your brand/your-brand.svelte';

	let currentUser = $derived(authStore.getPayloadData());
</script>

{#if routeRolesGuard(['Standard', 'Enhanced'], currentUser?.role ?? null)}
	<YourBrand></YourBrand>
{/if}

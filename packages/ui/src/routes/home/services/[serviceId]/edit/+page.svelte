<script lang="ts">
	import EditService from '../../../../../modules/services/edit-service.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
</script>

<EditService serviceId={$page.params.serviceId} onBack={() => goto(resolve('/home/services'))} />

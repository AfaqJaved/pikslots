<script>
	import NewService from '../../../../modules/services/new-service.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
</script>

<NewService onBack={() => goto(resolve('/home/services'))} />

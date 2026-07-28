<script>
	import NewClass from '../../../../../modules/services/new-class.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
</script>

<NewClass onBack={() => goto(resolve('/home/services'))} />

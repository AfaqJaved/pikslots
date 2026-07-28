<script lang="ts">
	import EditClass from '../../../../../../modules/services/edit-class.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
</script>

<EditClass classId={$page.params.classId} onBack={() => goto(resolve('/home/services'))} />

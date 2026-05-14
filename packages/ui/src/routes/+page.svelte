<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { sum } from '@pikslots/shared';
</script>

<h1 class="bg-red-400">Welcome to SvelteKit {sum()}</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<Button variant={'outline'}>ClickME</Button>

<script lang="ts">
	import HomeLayout from '../../modules/home/layout/home-layout.svelte';
	let { children } = $props();
</script>

<HomeLayout>
	{@render children()}
</HomeLayout>

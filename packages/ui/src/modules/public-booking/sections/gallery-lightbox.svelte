<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { PublicGalleryPhoto } from '../types';

	let {
		open = $bindable(),
		photos
	}: {
		open: boolean;
		photos: PublicGalleryPhoto[];
	} = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[85vh] max-w-3xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Photos</Dialog.Title>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-2">
			{#each photos as photo (photo.id)}
				<div
					class="aspect-video w-full bg-cover bg-center"
					style={photo.url ? `background-image: url(${photo.url})` : `background-image: ${photo.gradient}`}
					role="img"
					aria-label={photo.alt}
				></div>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>

<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import type { PublicGalleryPhoto } from '../types';

	let { photos, onShowAllPhotos }: { photos: PublicGalleryPhoto; onShowAllPhotos: () => void } =
		$props();

	const preview = $derived(photos.slice(0, 2));
</script>

{#if photos.length > 0}
	<div class="flex flex-col gap-4">
		<h2 class="text-xl font-semibold">Gallery</h2>

		<div class="relative grid grid-cols-2 gap-1 overflow-hidden">
			{#each preview as photo, index (index)}
				<button
					type="button"
					onclick={onShowAllPhotos}
					class="aspect-video w-full cursor-pointer bg-cover bg-center"
					style={photo
						? `background-image: url(${photo})`
						: `background-image: linear-gradient(135deg, #7c3aed 0%, #1e1b4b 60%, #0a0a0a 100%)`}
					aria-label={photo ?? 'GalleryImage'}
				></button>
			{/each}

			<Button
				variant="secondary"
				class="border-gray absolute right-3 bottom-3 border-2 bg-background text-foreground hover:bg-background/80"
				onclick={onShowAllPhotos}
			>
				Show all photos
			</Button>
		</div>
	</div>
{/if}

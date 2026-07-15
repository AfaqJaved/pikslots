<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import type { PublicBusiness } from '../types';

	let { business, onShowAllPhotos }: { business: PublicBusiness; onShowAllPhotos: () => void } =
		$props();

	const initials = $derived(
		business.name
			.split(' ')
			.map((word) => word[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);
</script>

<div
	class="relative mx-auto flex h-64 max-w-5xl items-center justify-between overflow-hidden px-8"
	style={business.brandDetail.bannerImageUrl
		? `background-image: url(${business.brandDetail.bannerImageUrl}); background-size: cover; background-position: center;`
		: `background-image: linear-gradient(135deg, ${business.brandAppearanceDetails.brandColor} 0%, color-mix(in srgb, ${business.brandAppearanceDetails.brandColor} 40%, black) 60%, black 100%);`}
>
	<div class="flex size-20 items-center justify-center bg-background/90 text-lg font-bold">
		{#if business.brandDetail.brandLogoUrl}
			<img
				src={business.brandDetail.brandLogoUrl}
				alt="{business.name} logo"
				class="size-full object-contain"
			/>
		{:else}
			{initials}
		{/if}
	</div>

	<Button
		variant="secondary"
		class="absolute right-6 bottom-6 bg-background text-foreground hover:bg-background/80"
		onclick={onShowAllPhotos}
	>
		Show all photos
	</Button>
</div>

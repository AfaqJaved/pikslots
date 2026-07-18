<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { businessStore } from '$stores/business.svelte';
	import { PlusIcon } from '@lucide/svelte';
	import Photo from '@tabler/icons-svelte/icons/photo';
	import { toast } from 'svelte-sonner';

	// ________ props_______________________________
	let {
		open = $bindable(false),
		galleryTempUrls = $bindable([]),
		onSave
	}: {
		open: boolean;
		galleryTempUrls: string[];
		onSave: (file: File[]) => void;
	} = $props();

	//______________image variables____________________________________
	const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
	const MAX_SIZE_MB = 10;
	let fileInput: HTMLInputElement;

	//_______states____________________________________________
	let file = $state<File[]>([]);
	let galleryPhotoUrls = $state<string[]>([]);

	// ________derived__________________________________
	const business = $derived(businessStore.selectedBusiness);
	const galleryUrls = $derived([...galleryPhotoUrls, ...galleryTempUrls]);

	//___________effect___________________
	$effect(() => {
		if (business) {
			galleryPhotoUrls = [...business.brandAppearanceDetails.gallaryPhotosUrls];
		}
	});

	//________functions_________________________________
	function onFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const selected = input.files?.[0];
		if (!selected) return;

		if (!ACCEPTED_TYPES.includes(selected.type)) {
			toast.error('Only JPG, JPEG and PNG files are allowed');
			return;
		}
		if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
			toast.error(`File must be under ${MAX_SIZE_MB}MB`);
			return;
		}
		file = [...file, selected];
		const newUrl = URL.createObjectURL(selected);
		galleryTempUrls = [...galleryTempUrls, newUrl];
		input.value = '';
	}

	function removePhoto(url: string) {
		const tempIndex = galleryTempUrls.indexOf(url);

		if (tempIndex !== -1) {
			URL.revokeObjectURL(url);

			galleryTempUrls = galleryTempUrls.filter((u) => u !== url);

			file = file.filter((_, index) => index !== tempIndex);

			return;
		}

		galleryPhotoUrls = galleryPhotoUrls.filter((u) => u !== url);
	}

	async function save() {
		if (!file) return;
		onSave(file);
		close();
	}

	function close() {
		open = false;
		file = [];
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) close();
	}}
>
	<Dialog.Content class="gap-0 p-0 sm:max-w-lg">
		<Dialog.Header class="px-6 pt-6 pb-4">
			<Dialog.Title>Gallery</Dialog.Title>
		</Dialog.Header>

		{#if business === null}
			<Skeleton class="min-h-40 rounded-lg" />
		{:else if galleryUrls.length > 0}
			<div class="grid grid-cols-6 gap-2 rounded-lg border p-2">
				<div class="aspect-square w-full rounded-md">
					<input
						bind:this={fileInput}
						type="file"
						accept=".jpg,.jpeg,.png"
						class="hidden"
						onchange={onFileChange}
					/>

					<Button
						class="flex h-full w-full items-center justify-center bg-black/30"
						onclick={() => fileInput.click()}
					>
						<PlusIcon color="black" />
					</Button>
				</div>

				{#each galleryUrls as url (url)}
					<div class="group relative aspect-square overflow-hidden rounded-md">
						<img src={url} alt="Gallery" class="h-full w-full object-cover" />

						<button
							type="button"
							onclick={() => removePhoto(url)}
							class="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
							aria-label="Remove photo"
						>
							<svg
								viewBox="0 0 12 12"
								class="size-3"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							>
								<path d="M2 2l8 8M10 2l-8 8" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30"
			>
				<input
					bind:this={fileInput}
					type="file"
					accept=".jpg,.jpeg,.png"
					class="hidden"
					onchange={onFileChange}
				/>
				<Button variant="outline" size="sm" onclick={() => fileInput.click()}>
					<Photo size={14} />
					Upload photos
				</Button>
			</div>
		{/if}

		<Dialog.Footer class="border-t px-6 py-4">
			<Button variant="outline" onclick={close}>Cancel</Button>
			<Button class=" opacity-80 hover:opacity-100" onclick={save} disabled={!file}>Apply</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

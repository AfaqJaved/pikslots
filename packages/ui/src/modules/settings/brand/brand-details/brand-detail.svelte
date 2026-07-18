<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import Photo from '@tabler/icons-svelte/icons/photo';
	import Upload from '@tabler/icons-svelte/icons/upload';
	import CircleHalf from '@tabler/icons-svelte/icons/circle-half';
	import DeviceTablet from '@tabler/icons-svelte/icons/device-tablet';
	import DeviceDesktop from '@tabler/icons-svelte/icons/device-desktop';
	import type { BusinessIndustry } from '@pikslots/shared';
	import { businessStore } from '../../../core/store/business.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { updateBusinessBrandDetails } from '../../../api/business/update.business.brand.details.mutation';
	import type {
		BusinessUpdateBrandDetailsInput,
		BusinessUpdateBrandDetailsResult
	} from '../../../api/business/models/business-model';
	import type { BaseErrorResponse } from '@pikslots/shared';
	import type { AxiosError } from 'axios';
	import { toast } from 'svelte-sonner';
	import UpdateBrandDetailImagesDialog from '../dialogs/update-brand-details-images-dialog.svelte';
	import { uploadAvatarMutationOptions } from '../../../api/s3/upload.avatar.mutation';
	import { UpdateBusinessBrandDetailsImagesMutationsOptions } from '../../../api/business/update.business.brand.details.images.mutation';
	import type { PikslotErrorResponse } from '../../../api/common/common-models';

	const INDUSTRIES: { value: BusinessIndustry; label: string }[] = [
		{ value: 'salon_and_beauty', label: 'Salon & Beauty' },
		{ value: 'health_and_wellness', label: 'Health & Wellness' },
		{ value: 'fitness', label: 'Fitness' },
		{ value: 'medical', label: 'Medical' },
		{ value: 'education', label: 'Education' },
		{ value: 'legal', label: 'Legal' },
		{ value: 'financial', label: 'Financial' },
		{ value: 'hospitality', label: 'Hospitality' },
		{ value: 'retail', label: 'Retail' },
		{ value: 'other', label: 'Other' }
	];

	const business = $derived(businessStore.selectedBusiness);

	let businessName = $state('');
	let bookingUrl = $state('');
	let about = $state('');
	let selectedIndustry = $state<BusinessIndustry | ''>('');

	let bannerDialogOpen = $state(false);
	let bannerFile = $state<File | null>(null);
	let bannerPreview = $state<string | null>(null);
	let bannerInput: HTMLInputElement;

	let logoDialogOpen = $state(false);
	let logoFile = $state<File | null>(null);
	let logoPreview = $state<string | null>(null);
	let logoInput: HTMLInputElement;

	$effect(() => {
		if (business) {
			businessName = business.name;
			bookingUrl = business.slug;
			about = business.about;
			selectedIndustry = business.industry;
			bannerPreview = business.brandDetail.bannerImageUrl;
			logoPreview = business.brandDetail.brandLogoUrl;
		}
	});

	const uploadMutation = createMutation(uploadAvatarMutationOptions);
	const updateBrnndDetailsImageMutation = createMutation(
		UpdateBusinessBrandDetailsImagesMutationsOptions
	);
	const updateMutation = createMutation<
		BusinessUpdateBrandDetailsResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateBrandDetailsInput
	>(() => ({
		mutationFn: updateBusinessBrandDetails
	}));

	$effect(() => {
		if (updateMutation.data) {
			businessStore.setSelectedBusiness(updateMutation.data);
			toast.success('Brand details saved successfully.');
		}
		if (updateMutation.isError) {
			toast.error(
				updateMutation.error?.response?.data?.message ?? 'Failed to save. Please try again.'
			);
		}
	});

	const isSaving = $derived(
		uploadMutation.isPending ||
			updateMutation.isPending ||
			updateBrnndDetailsImageMutation.isPending
	);

	const isDirty = $derived(
		!!business &&
			(businessName !== business.name ||
				bookingUrl !== business.slug ||
				about !== business.about ||
				selectedIndustry !== business.industry ||
				logoPreview !== business.brandDetail.brandLogoUrl ||
				bannerPreview !== business.brandDetail.bannerImageUrl)
	);

	function handleBannerUpload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		bannerFile = file;
		if (bannerPreview) URL.revokeObjectURL(bannerPreview);
		bannerPreview = URL.createObjectURL(file);
		bannerDialogOpen = true;
		input.value = '';
	}

	function bannerOnSave(file: File | null) {
		bannerFile = file;
	}

	function handleLogoUpload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		logoFile = file;
		if (logoPreview) URL.revokeObjectURL(logoPreview);
		logoPreview = URL.createObjectURL(file);
		logoDialogOpen = true;
		input.value = '';
	}

	function logoOnSave(file: File | null) {
		logoFile = file;
	}

	async function handleSave() {
		try {
			if (!business || !selectedIndustry) return;

			let bannerImageKey = '';
			let logoImageKey = '';

			if (logoFile) {
				logoImageKey = await uploadMutation.mutateAsync({
					id: business.id,
					folder: 'brand_details',
					businessSlug: business.slug,
					file: logoFile
				});
			}
			if (bannerFile) {
				bannerImageKey = await uploadMutation.mutateAsync({
					id: business.id,
					folder: 'brand_details',
					businessSlug: business.slug,
					file: bannerFile
				});
			}

			if (logoFile || bannerFile) {
				let { oldBannerImageUrl, oldBrandLogoUrl } =
					await updateBrnndDetailsImageMutation.mutateAsync({
						businessId: business.id,
						bannerImageKey: bannerImageKey,
						brandLogoKey: logoImageKey
					});
				console.log(
					'before mutation :',
					'banner =',
					bannerImageKey || oldBannerImageUrl,
					'brandlogo ',
					logoImageKey || oldBrandLogoUrl
				);
				await updateMutation.mutateAsync({
					id: business.id,
					bannerImageUrl: bannerImageKey || (oldBannerImageUrl as string),
					logoUrl: logoImageKey || (oldBrandLogoUrl as string),
					name: businessName,
					slug: bookingUrl,
					industry: selectedIndustry,
					about
				});
			} else {
				console.log('aya2');
				await updateMutation.mutateAsync({
					id: business.id,
					bannerImageUrl: business.brandDetail.bannerImageUrl,
					logoUrl: business.brandDetail.brandLogoUrl,
					name: businessName,
					slug: bookingUrl,
					industry: selectedIndustry,
					about
				});
			}

			bannerImageKey = '';
			logoImageKey = '';
		} catch (error) {
			const axiosError = error as AxiosError<PikslotErrorResponse>;

			toast.error(axiosError.response?.data?.message ?? 'Failed to save. Please try again.');
		}
	}
</script>

<UpdateBrandDetailImagesDialog
	bind:open={bannerDialogOpen}
	bind:previewUrl={bannerPreview}
	initialFile={bannerFile}
	title="Banner Image"
	onSave={bannerOnSave}
/>

<UpdateBrandDetailImagesDialog
	bind:open={logoDialogOpen}
	bind:previewUrl={logoPreview}
	initialFile={logoFile}
	title="Brand Logo"
	onSave={logoOnSave}
/>

<!-- Page header -->
<div class="border-b px-4 lg:px-6">
	<div class="flex items-center justify-between py-3">
		<div class="flex items-center gap-3">
			<h1 class="text-sm font-semibold">Your brand</h1>
			<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
				<CircleHalf size={14} />
				<span>35% complete</span>
			</div>
		</div>
		<Button class="cursor-pointer" size="sm" onclick={handleSave} disabled={!isDirty || isSaving}>
			{updateMutation.isPending ? 'Saving...' : 'Save'}
		</Button>
	</div>
</div>

<!-- Two column layout -->
<div class="grid flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2 lg:px-6">
	<!-- Left: Form -->
	<div class="flex flex-col gap-8">
		<!-- Brand details section -->
		<section class="flex flex-col gap-5">
			<h2 class="text-xs font-semibold">Brand details</h2>

			<!-- Banner upload -->
			{#if bannerPreview}
				<Button
					class="h-40 w-full cursor-pointer bg-transparent p-0"
					onclick={() => bannerInput.click()}
				>
					<img
						src={bannerPreview}
						alt="Banner preview"
						class="h-full w-full rounded-lg border object-cover opacity-100 hover:opacity-60"
					/>
				</Button>
				<input
					bind:this={bannerInput}
					type="file"
					accept=".jpg,.jpeg,.png"
					class="hidden"
					onchange={handleBannerUpload}
				/>
			{:else if business?.brandDetail.bannerImageUrl}
				<img
					src={business.brandDetail.bannerImageUrl}
					alt="Banner"
					class="h-40 w-full rounded-lg border object-cover"
				/>
			{:else if business === null}
				<Skeleton class="h-40 w-full rounded-lg" />
			{:else}
				<div
					class="flex h-40 w-full flex-col items-center justify-center rounded-lg border bg-muted"
				>
					<Photo size={32} class="mb-3 text-muted-foreground" />
					<input
						bind:this={bannerInput}
						type="file"
						accept=".jpg,.jpeg,.png"
						class="hidden"
						onchange={handleBannerUpload}
					/>
					<Button variant="outline" size="sm" onclick={() => bannerInput.click()}>
						<Upload size={14} />
						Upload banner image
					</Button>
				</div>
			{/if}

			<!-- Logo upload -->
			<div class="flex items-center gap-4">
				{#if business === null}
					<Skeleton class="size-16 rounded-full" />
				{:else if logoPreview}
					<img
						src={logoPreview}
						alt="Logo preview"
						class="size-16 rounded-full border object-cover"
					/>
				{:else}
					<Avatar.Root class="size-16 rounded-full border">
						<Avatar.Image src={business?.brandDetail.brandLogoUrl ?? ''} alt="Brand logo" />
						<Avatar.Fallback class="rounded-full bg-muted">
							<Photo size={20} class="text-muted-foreground" />
						</Avatar.Fallback>
					</Avatar.Root>
				{/if}
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium">Brand logo</span>
					<span class="text-xs text-muted-foreground"
						>Select a 200 × 200 px image, up to 10 MB in size</span
					>
					<input
						bind:this={logoInput}
						type="file"
						accept=".jpg,.jpeg,.png"
						class="hidden"
						onchange={handleLogoUpload}
					/>
					<Button variant="outline" size="sm" class="mt-1 w-fit" onclick={() => logoInput.click()}>
						<Upload size={14} />
						Upload logo
					</Button>
				</div>
			</div>

			<!-- Business name -->
			<div class="flex flex-col gap-2">
				<Label for="business-name">Business name</Label>
				{#if business === null}
					<Skeleton class="h-9 w-full rounded-md" />
				{:else}
					<Input id="business-name" bind:value={businessName} placeholder="Your business name" />
				{/if}
			</div>

			<!-- Booking page URL -->
			<div class="flex flex-col gap-2">
				<Label for="booking-url">Your Booking Page URL</Label>
				{#if business === null}
					<Skeleton class="h-9 w-full rounded-md" />
				{:else}
					<div class="flex">
						<Input
							id="booking-url"
							bind:value={bookingUrl}
							placeholder="your-slug"
							class="rounded-r-none"
						/>
						<div
							class="flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-xs text-muted-foreground"
						>
							.pikslots.com
						</div>
					</div>
				{/if}
			</div>

			<!-- Industry -->
			<div class="flex flex-col gap-2">
				<Label>Industry</Label>
				{#if business === null}
					<Skeleton class="h-9 w-full rounded-md" />
				{:else}
					<Select.Root type="single" bind:value={selectedIndustry}>
						<Select.Trigger class="w-full">
							{INDUSTRIES.find((i) => i.value === selectedIndustry)?.label ?? 'Select an industry'}
						</Select.Trigger>
						<Select.Content>
							{#each INDUSTRIES as industry (industry.value)}
								<Select.Item value={industry.value}>{industry.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/if}
			</div>

			<!-- About -->
			<div class="flex flex-col gap-2">
				<Label for="about">About</Label>
				{#if business === null}
					<Skeleton class="h-24 w-full rounded-md" />
				{:else}
					<textarea
						id="about"
						bind:value={about}
						placeholder="Tell the world about your brand"
						rows={4}
						class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					></textarea>
				{/if}
			</div>
		</section>
	</div>

	<!-- Right: Preview -->
	<div class="flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<span class="text-xs font-medium">Preview</span>
			<div class="flex items-center gap-1">
				<Button variant="ghost" size="icon-sm">
					<DeviceTablet size={16} />
				</Button>
				<Button variant="ghost" size="icon-sm">
					<DeviceDesktop size={16} />
				</Button>
			</div>
		</div>

		<Card.Root class="overflow-hidden">
			<div class="border-b px-4 py-2">
				<div
					class="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground"
				>
					<span>https://</span>
					{#if business === null}
						<Skeleton class="h-3 w-24 rounded" />
					{:else}
						<span class="font-medium text-foreground">{bookingUrl || 'your-slug'}</span>
					{/if}
					<span>.pikslots.com</span>
				</div>
			</div>
			<Card.Content class="flex min-h-96 items-center justify-center bg-muted/40 p-6">
				<div class="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
					<DeviceTablet size={32} />
					<span>Preview will appear here</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

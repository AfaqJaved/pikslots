<script lang="ts">
	import type {
		OwnerFormValues,
		BusinessOwnerFormValues,
		BusinessFormValues
	} from './utils/schema';
	import OwnerStep from './steps/owner-step.svelte';
	import BusinessOwnerStep from './steps/business-owner-step.svelte';
	import BusinessStep from './steps/business-step.svelte';
	import { Check, ShieldAlert } from '@lucide/svelte';
	import { Card } from '$lib/components/ui/card';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { completeOnboardingMutationOptions } from '../api/onboarding/complete.onboarding.mutation';
	import type { OnboardingCompleteInput } from '@pikslots/shared';
	import { GetOnboardingStatusQueryOptions } from '../api/onboarding/get.onboarding.status.query';

	let currentStep = $state(0);

	let ownerValues: OwnerFormValues = {
		username: '',
		password: '',
		first_name: '',
		last_name: '',
		email: '',
		booking_url: 'Platform Owner'
	};

	let businessOwnerValues: BusinessOwnerFormValues = {
		username: '',
		password: '',
		first_name: '',
		last_name: '',
		email: '',
		booking_url: 'Business Owner'
	};

	let businessValues: BusinessFormValues = {
		name: '',
		slug: '',
		industry: '' as BusinessFormValues['industry'],
		default_time_zone: ''
	};

	const steps = [
		{ title: 'Platform Owner', description: 'Create your account' },
		{ title: 'Business Owner', description: 'Create the business owner account' },
		{ title: 'Business Details', description: 'Set up your business' }
	];

	function handleOwnerNext() {
		currentStep = 1;
	}

	function handleBusinessOwnerNext() {
		currentStep = 2;
	}

	function handleBack() {
		if (currentStep > 0) currentStep -= 1;
	}

	const completeOnboardingMutation = createMutation(completeOnboardingMutationOptions);
	const OnboardingStatusQuery = createQuery(GetOnboardingStatusQueryOptions);

	const onboardingComplete = $derived(OnboardingStatusQuery.data?.isOnboardingComplete === true);
	// const onboardingComplete = false;

	$effect(() => {
		if (!onboardingComplete) return;
		const timer = setTimeout(() => {
			goto(resolve('/login'));
		}, 3000);
		return () => clearTimeout(timer);
	});

	function buildPayload(): OnboardingCompleteInput {
		return {
			platformOwner: {
				username: ownerValues.username,
				password: ownerValues.password,
				name: { firstName: ownerValues.first_name, lastName: ownerValues.last_name },
				email: ownerValues.email,
				phone: ownerValues.phone ? ownerValues.phone?.toString() : '',
				role: 'Platform Owner'
			},
			businessOwner: {
				username: businessOwnerValues.username,
				password: businessOwnerValues.password,
				name: {
					firstName: businessOwnerValues.first_name,
					lastName: businessOwnerValues.last_name
				},
				email: businessOwnerValues.email,
				phone: businessOwnerValues.phone ? businessOwnerValues.phone.toString() : '',
				role: 'Business Owner'
			},
			business: {
				slug: businessValues.slug,
				name: businessValues.name,
				industry: businessValues.industry,
				defaultTimeZone: businessValues.default_time_zone
			}
		};
	}

	function handleBusinessNext() {
		const payload = buildPayload();
		if (payload.platformOwner.username === payload.businessOwner.username) {
			toast.error('Platform owner and business owner usernames must be different!');
			return;
		}

		if (payload.platformOwner.email === payload.businessOwner.email) {
			toast.error('Platform owner and business owner emails must be different!');
			return;
		}

		completeOnboardingMutation.mutate(payload, {
			onSuccess: async () => {
				currentStep = 3;

				await new Promise((resolve) => setTimeout(resolve, 3000));

				await goto(resolve('/login'));
			},
			onError: (error) => {
				toast.error(error?.response?.data?.message ?? 'Onboarding failed. Please try again.');
			}
		});
	}
</script>

<div class="r flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-2xl">
		{#if onboardingComplete}
			<Card class="rounded-2xl border-slate-200/60 shadow-xl ">
				<CardHeader class="text-center">
					<CardTitle class="text-2xl">403 - Forbidden</CardTitle>
					<CardDescription>Onboarding is already complete. Redirecting to login...</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4 py-6 text-center">
						<div
							class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10"
						>
							<ShieldAlert class="h-8 w-8 text-destructive" />
						</div>
						<div>
							<h3 class="text-xl font-semibold">Access denied</h3>
							<p class="mt-1 text-sm text-muted-foreground">
								You'll be redirected to the login page shortly.
							</p>
						</div>
						<Button variant="outline" class="w-full" onclick={() => goto(resolve('/login'))}>
							Go to login now
						</Button>
					</div>
				</CardContent>
			</Card>
		{:else if OnboardingStatusQuery.isPending}
			<div class="flex items-center justify-center py-24">
				<div
					class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
				></div>
			</div>
		{:else}
			<!-- Step indicator -->
			<div class="mb-8 flex items-center justify-center gap-2 sm:gap-4">
				{#each steps as step, i (i)}
					<div class="flex items-center gap-2 sm:gap-4">
						<div class="flex flex-col items-center gap-2">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300
							{currentStep === i
									? 'scale-110 border-primary bg-primary text-primary-foreground shadow-lg'
									: currentStep > i
										? 'border-primary bg-primary/10 text-primary'
										: 'border-muted-foreground/30 bg-background text-muted-foreground'}"
							>
								{#if currentStep > i}
									<Check class="h-5 w-5" />
								{:else}
									{i + 1}
								{/if}
							</div>
							<span
								class="hidden text-xs font-medium sm:block {currentStep === i
									? 'text-foreground'
									: 'text-muted-foreground'}"
							>
								{step.title}
							</span>
						</div>
						{#if i < steps.length - 1}
							<div
								class="h-0.5 w-8 rounded-full transition-all duration-300 sm:w-16 {currentStep > i
									? 'bg-primary'
									: 'bg-muted-foreground/20'}"
							></div>
						{/if}
					</div>
				{/each}
			</div>

			<Card class="rounded-2xl border-slate-200/60 shadow-xl ">
				<CardHeader class="text-center">
					{#if currentStep < steps.length}
						<CardTitle class="text-2xl">{steps[currentStep].title}</CardTitle>
						<CardDescription>{steps[currentStep].description}</CardDescription>
					{:else}
						<CardTitle class="text-2xl">You're all set</CardTitle>
						<CardDescription>Your account is ready</CardDescription>
					{/if}
				</CardHeader>
				<CardContent>
					{#if currentStep === 0}
						<OwnerStep values={ownerValues} onNext={handleOwnerNext} />
					{:else if currentStep === 1}
						<BusinessOwnerStep
							values={businessOwnerValues}
							onNext={handleBusinessOwnerNext}
							onBack={handleBack}
						/>
					{:else if currentStep === 2}
						<BusinessStep
							values={businessValues}
							onSubmit={handleBusinessNext}
							onBack={handleBack}
							isSubmitting={completeOnboardingMutation.isPending}
						/>
					{:else}
						<div class="space-y-4 py-6 text-center">
							<div
								class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
							>
								<Check class="h-8 w-8 text-primary" />
							</div>
							<div>
								<h3 class="text-xl font-semibold">Welcome aboard!</h3>
								<p class="mt-1 text-sm text-muted-foreground">
									Your account is ready. You'll be redirected to login in {3}s.
								</p>
							</div>
							<Button variant="outline" class="w-full" onclick={() => goto(resolve('/login'))}>
								Go to login now
							</Button>
						</div>
					{/if}
				</CardContent>
			</Card>
		{/if}
	</div>
</div>

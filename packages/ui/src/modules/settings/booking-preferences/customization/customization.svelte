<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	// ── General ────────────────────────────────────────────────────
	let language = $state('English (US)');
	let timeFormat = $state('12 Hours');
	let weekStartsOn = $state('Monday');

	const languages = ['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Arabic'];
	const timeFormats = ['12 Hours', '24 Hours'];
	const weekDays = ['Monday', 'Sunday', 'Saturday'];

	// ── Services and classes ───────────────────────────────────────
	let showPrices = $state(true);
	let showDuration = $state(true);
	let showBusinessHours = $state(true);
	let showLocalTime = $state(true);
	let bookAnotherButton = $state(true);

	// ── Labels ─────────────────────────────────────────────────────
	let labelService = $state('Service');
	let labelClass = $state('Class');
	let labelTeamMember = $state('Team member');
	let labelCity = $state('City');
	let labelState = $state('State');
	let labelPostalCode = $state('Postal code');

	// ── Terms and conditions ───────────────────────────────────────
	let termsLabel = $state('');
	let termsLink = $state('');
	let requireAgreement = $state(false);

	// ── Confirmation redirect ──────────────────────────────────────
	let redirectLabel = $state('');
	let redirectLink = $state('');
</script>

<div class="flex flex-col">
	<!-- Page header -->
	<div class="flex items-center justify-between border-b px-6 py-4">
		<h1 class="text-base font-semibold">Booking preferences</h1>
		<Button>Save</Button>
	</div>

	<div class="flex w-[60%] flex-col gap-6 px-6 py-4">

		<!-- Customization heading -->
		<h2 class="text-sm font-semibold">Customization</h2>

		<!-- General -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">General</span>
				<span class="text-xs text-muted-foreground">Select standard display preferences for your Booking Page.</span>
			</div>

			<div class="flex flex-col gap-2.5">
				<!-- Preferred language -->
				<div class="flex items-start justify-between gap-6">
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Preferred language</span>
						<span class="text-xs text-muted-foreground">This will be the default language of your Booking Page.</span>
					</div>
					<Select.Root type="single" bind:value={language}>
						<Select.Trigger class="w-40 shrink-0 text-xs">{language}</Select.Trigger>
						<Select.Content>
							{#each languages as l (l)}
								<Select.Item value={l}>{l}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Time format -->
				<div class="flex items-start justify-between gap-6">
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Time format</span>
						<span class="text-xs text-muted-foreground">Display time in 12-hour AM/PM or 24-hour format.</span>
					</div>
					<Select.Root type="single" bind:value={timeFormat}>
						<Select.Trigger class="w-40 shrink-0 text-xs">{timeFormat}</Select.Trigger>
						<Select.Content>
							{#each timeFormats as f (f)}
								<Select.Item value={f}>{f}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Week starts on -->
				<div class="flex items-start justify-between gap-6">
					<div class="flex flex-col gap-0.5">
						<span class="text-xs font-medium">Week starts on</span>
						<span class="text-xs text-muted-foreground">Set the first day of the week as seen on your Booking Page.</span>
					</div>
					<Select.Root type="single" bind:value={weekStartsOn}>
						<Select.Trigger class="w-40 shrink-0 text-xs">{weekStartsOn}</Select.Trigger>
						<Select.Content>
							{#each weekDays as d (d)}
								<Select.Item value={d}>{d}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>

		<!-- Services and classes -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Services and classes</span>
				<span class="text-xs text-muted-foreground">What will your visitors see when they browse your Booking Page?</span>
			</div>

			<div class="flex flex-col gap-2.5">
				<div class="flex items-center gap-3">
					<Switch bind:checked={showPrices} />
					<span class="text-xs">Service and class prices</span>
				</div>
				<div class="flex items-center gap-3">
					<Switch bind:checked={showDuration} />
					<span class="text-xs">Service and class duration</span>
				</div>
				<div class="flex items-center gap-3">
					<Switch bind:checked={showBusinessHours} />
					<span class="text-xs">Business hours</span>
				</div>
				<div class="flex items-center gap-3">
					<Switch bind:checked={showLocalTime} />
					<span class="text-xs">Local time</span>
				</div>
				<div class="flex items-center gap-3">
					<Switch bind:checked={bookAnotherButton} />
					<span class="text-xs">'Book another appointment' button</span>
				</div>
			</div>
		</div>

		<!-- Labels -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Labels</span>
				<span class="text-xs text-muted-foreground">Customize the section labels on your Booking Page.</span>
			</div>

			<div class="flex flex-col gap-3">
				<div class="grid grid-cols-2 gap-3">
					<div class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground">Display 'service' as</span>
						<Input bind:value={labelService} class="text-xs" />
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground">Display 'class' as</span>
						<Input bind:value={labelClass} class="text-xs" />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground">Display 'team member' as</span>
						<Input bind:value={labelTeamMember} class="text-xs" />
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground">Display 'city' as</span>
						<Input bind:value={labelCity} class="text-xs" />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground">Display 'state' as</span>
						<Input bind:value={labelState} class="text-xs" />
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground">Display 'postal code' as</span>
						<Input bind:value={labelPostalCode} class="text-xs" />
					</div>
				</div>
			</div>
		</div>

		<!-- Terms and conditions -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Terms and conditions</span>
				<span class="text-xs text-muted-foreground">Have any T&Cs that need to be accepted before booking? Add them below.</span>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-1">
					<span class="text-xs text-muted-foreground">Label</span>
					<Input bind:value={termsLabel} class="text-xs" />
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-xs text-muted-foreground">Terms link</span>
					<Input bind:value={termsLink} class="text-xs" />
				</div>
			</div>

			<div class="flex items-start gap-3">
				<Switch bind:checked={requireAgreement} disabled={!termsLabel && !termsLink} class="mt-0.5 opacity-40" />
				<div class="flex flex-col gap-0.5">
					<span class="text-xs text-muted-foreground">Require agreement</span>
					<span class="text-xs text-muted-foreground">Display a checkbox to confirm customers accept your terms before booking.</span>
				</div>
			</div>
		</div>

		<!-- Confirmation redirect -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-medium">Confirmation redirect</span>
				<span class="text-xs text-muted-foreground">Send customers to your site, socials or somewhere else from the confirmation screen.</span>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-1">
					<span class="text-xs text-muted-foreground">Label</span>
					<Input bind:value={redirectLabel} class="text-xs" />
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-xs text-muted-foreground">Redirect link</span>
					<Input bind:value={redirectLink} class="text-xs" />
				</div>
			</div>
		</div>

	</div>
</div>

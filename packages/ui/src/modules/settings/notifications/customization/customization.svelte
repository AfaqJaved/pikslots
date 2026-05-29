<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { businessStore } from '../../../core/store/business.svelte';

	const business = $derived(businessStore.selectedBusiness);

	let senderName = $state('');
	let emailSignature = $state('');

	$effect(() => {
		if (business) {
			const c = business.notificationCustomization;
			senderName = c.emailSenderName;
			emailSignature = c.emailSignature;
		}
	});
</script>

<div class="flex flex-col">
	<!-- Page header -->
	<div class="flex items-center justify-between border-b px-6 py-4">
		<h1 class="text-base font-semibold">Notifications</h1>
		<div class="flex items-center gap-2">
			<Button variant="outline">Cancel</Button>
			<Button>Save</Button>
		</div>
	</div>

	<div class="flex w-[60%] flex-col gap-4 px-6 py-4">
		<h2 class="text-sm font-semibold">Customization</h2>

		<div class="flex flex-col gap-3">
			<span class="text-xs font-medium">Emails</span>

			<div class="flex flex-col gap-1">
				<span class="text-xs text-muted-foreground">Sender name</span>
				<Input bind:value={senderName} class="text-xs" />
			</div>

			<div class="flex flex-col gap-1">
				<span class="text-xs text-muted-foreground">Email signature</span>
				<textarea
					bind:value={emailSignature}
					rows={4}
					class="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				></textarea>
			</div>
		</div>
	</div>
</div>

<script lang="ts">
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldError,
		FieldSeparator
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import loginImage from '$lib/assets/login-image.jpg';
	import { createMutation } from '@tanstack/svelte-query';
	import { loginUser } from '../api/user/login.user.mutation';
	import type { BaseErrorResponse, LoginUserInput, LoginUserResponse } from '@pikslots/shared';
	import type { AxiosError } from 'axios';
	import { toast } from 'svelte-sonner';
	import { authStore } from '$stores/auth.svelte.js';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { zod4 as zod } from 'sveltekit-superforms/adapters';
	import { LoginUserFormSchema } from './validations/schema';
	import * as m from '$lib/paraglide/messages.js';

	const loginMutation = createMutation<
		LoginUserResponse,
		AxiosError<BaseErrorResponse>,
		LoginUserInput
	>(() => ({
		mutationFn: loginUser
	}));

	const { form, errors, enhance } = superForm(
		{ userNameOrEmail: '', password: '' },
		{
			validators: zod(LoginUserFormSchema),
			SPA: true,
			resetForm: false,
			onUpdate({ form }) {
				if (form.valid) {
					loginMutation.mutate({
						usernameOrEmail: form.data.userNameOrEmail,
						password: form.data.password
					});
				}
			}
		}
	);

	$effect(() => {
		if (authStore.isAuthenticated) goto('/home');

		if (loginMutation.data) {
			authStore.setAccessToken(loginMutation.data.accessToken);
			goto('/home');
		}
		if (loginMutation.isError) {
			console.log(loginMutation.error.response?.data.message);
			toast.error(
				loginMutation.error?.response?.data?.message ?? m.login_error_default()
			);
		}
	});
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-between gap-2">
			<a href="##" class="font-code flex items-center gap-2 text-2xl">{m.nav_brand()}</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				<form class={cn('flex flex-col gap-6')} use:enhance>
					<FieldGroup>
						<div class="flex flex-col items-center gap-1 text-center">
							<h1 class="text-2xl font-bold">{m.login_title()}</h1>
							<p class="text-sm text-balance text-muted-foreground">
								{m.login_subtitle()}
							</p>
						</div>

						<Field>
							<FieldLabel for="userNameOrEmail">{m.login_label_username()}</FieldLabel>
							<Input
								id="userNameOrEmail"
								name="userNameOrEmail"
								type="text"
								placeholder="m@example.com"
								bind:value={$form.userNameOrEmail}
							/>
							<FieldError errors={$errors.userNameOrEmail?.map((e) => ({ message: e }))} />
						</Field>

						<Field>
							<div class="flex items-center">
								<FieldLabel for="password">{m.login_label_password()}</FieldLabel>
								<a href="##" class="ms-auto text-sm underline-offset-4 hover:underline">
									{m.login_forgot_password()}
								</a>
							</div>
							<Input id="password" name="password" type="password" bind:value={$form.password} />
							<FieldError errors={$errors.password?.map((e) => ({ message: e }))} />
						</Field>

						<Field>
							<Button type="submit" disabled={loginMutation.isPending}>
								{loginMutation.isPending ? m.login_btn_loading() : m.login_btn_submit()}
							</Button>
						</Field>

						<FieldSeparator>{m.login_separator()} 👇🏻</FieldSeparator>

						<Field>
							<FieldDescription class="text-center">
								{m.login_no_account()}
								<a href="##" class="underline underline-offset-4">{m.login_sign_up()}</a>
							</FieldDescription>
						</Field>
					</FieldGroup>
				</form>
			</div>
		</div>
	</div>
	<div class="relative hidden bg-muted lg:block">
		<img
			src={loginImage}
			alt="placeholder"
			class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>

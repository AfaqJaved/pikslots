import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface Credentials {
	username: string;
	password: string;
}

/**
 * Logs in through the real login form and waits for the app to land on /home.
 * Every role-based test needs a fresh login because the access token lives in
 * in-memory Svelte state (see modules/core/store/auth.svelte.ts) — it is not
 * persisted to localStorage, so there is no shortcut around the UI flow.
 */
export async function loginAs(page: Page, user: Credentials): Promise<void> {
	await page.goto('/login');

	await page.getByTestId('email').fill(user.username);
	await page.getByTestId('password').fill(user.password);
	await page.getByTestId('login-btn').click();

	await expect(page).toHaveURL(/\/home/);
}

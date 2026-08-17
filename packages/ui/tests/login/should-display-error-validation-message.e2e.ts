import { expect, test } from '@playwright/test';

test('should display proper field validation errors when credentials are removed', async ({
	page
}) => {
	await page.goto('/login');

	const email = page.getByTestId('email');
	const password = page.getByTestId('password');
	const loginBtn = page.getByTestId('login-btn');

	// User enters credentials
	await email.fill('test@example.com');
	await password.fill('password123');

	await expect(loginBtn).toBeEnabled();

	// User removes credentials
	await email.fill('');
	await password.fill('');
	await password.blur();

	// Button should become disabled
	await expect(loginBtn).toBeDisabled();

	// Field validation errors should be displayed
	await expect(page.getByTestId('email-error')).toBeVisible();
	await expect(page.getByTestId('password-error')).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('should display proper field validation errors when credentials are removed', async ({ page }) => {
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

	// Button should become disabled
	await expect(loginBtn).toBeDisabled();

	// Field validation errors should be displayed
	await expect(page.getByText('UserName or Email is Required')).toBeVisible();
	await expect(page.getByText('Password must be atleast 8 characters')).toBeVisible();
});
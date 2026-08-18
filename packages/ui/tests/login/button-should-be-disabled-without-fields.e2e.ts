import { expect, test } from '@playwright/test';

test('should be disabled login button if any credential is not provided', async ({ page }) => {
	await page.goto('/login');

	const email = page.getByTestId('email');
	const password = page.getByTestId('password');
	const loginBtn = page.getByTestId('login-btn');

	await email.fill('');
	await password.fill('');

	// Button will be disabled if both are empty
	await expect(loginBtn).toBeDisabled();

	await email.fill('test@example.com');
	await password.fill('');

	// Email provided, password empty button will be disabled
	await expect(loginBtn).toBeDisabled();

	// Email empty, password provided so button will be disabled
	await email.fill('');
	await password.fill('password123');

	await expect(loginBtn).toBeDisabled();

	// Both provided if both are provided button will be disabled
	await email.fill('test@example.com');
	await password.fill('password123');

	await expect(loginBtn).toBeEnabled();
});

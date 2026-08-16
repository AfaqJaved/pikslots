import test, { expect } from '@playwright/test';

test('login page should have proper heading and paragraph', async ({ page }) => {
	await page.goto('/login');

	const heading = page.getByTestId('login-heading');
	const paragraph = page.getByTestId('login-paragraph');

	await expect(heading).toHaveText('Login to your account');
	await expect(paragraph).toHaveText('Enter your email below to login to your account');
});

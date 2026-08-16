import { expect, test } from '@playwright/test';

test('login page should have proper heading and paragraph', async ({ page }) => {
	await page.goto('/login');

	const heading = page.getByTestId('login-heading');
	const paragraph = page.getByTestId('login-paragraph');

	await expect(heading).toHaveText('Login to your account');
	await expect(paragraph).toHaveText('Enter your email below to login to your account');
});

test('should login sucessfully for the platform owner', async ({ page }) => {
	await page.goto('/login');

	const email = page.getByTestId('email');
	const password = page.getByTestId('password');
	const loginBtn = page.getByTestId('login-btn');

	await email.fill('afaq@afaqjaved.com');
	await password.fill('admin12345');

	await page.screenshot({ path: 'login.png', fullPage: true });

	await loginBtn.click();

	await expect(page).toHaveURL(/\/home/);
});

import { expect, test } from '@playwright/test';

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

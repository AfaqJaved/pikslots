import { expect, test } from '@playwright/test';

test('should display error toast when credentials are incorrect', async ({ page }) => {
	await page.goto('/login');

	const email = page.getByTestId('email');
	const password = page.getByTestId('password');
	const loginBtn = page.getByTestId('login-btn');

	await email.fill('wrong@example.com');
	await password.fill('wrongpassword');

	await loginBtn.click();

	const toast = page.locator('[data-sonner-toast]');

	await expect(toast).toBeVisible();
	await expect(toast).toContainText('Access denied : please provide valid credentials');
});

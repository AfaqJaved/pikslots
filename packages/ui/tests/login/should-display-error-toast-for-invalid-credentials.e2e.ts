import { expect, test } from '@playwright/test';
import { USER } from '../common/user-data'

test('should display error toast when credentials are incorrect', async ({ page }) => {
	await page.goto('/login');

	const email = page.getByTestId('email');
	const password = page.getByTestId('password');
	const loginBtn = page.getByTestId('login-btn');
	
	await email.fill(USER.NO_ACCESS.username);
	await password.fill(USER.NO_ACCESS.password);

	await loginBtn.click();

	const toast = page.locator('[data-sonner-toast]');

	await expect(toast).toBeVisible();
	await expect(toast).toContainText('Access denied : please provide valid credentials');
});

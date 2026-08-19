import { expect, test } from '@playwright/test';
import { USER } from '../common/user-data';

test('should login sucessfully for the platform owner', async ({ page }) => {
	await page.goto('/login');

	const email = page.getByTestId('email');
	const password = page.getByTestId('password');
	const loginBtn = page.getByTestId('login-btn');

	await email.fill(USER.PLATFORM_OWNER.username);
	await password.fill(USER.PLATFORM_OWNER.password);

	//	await page.screenshot({ path: 'login.png', fullPage: true });

	await loginBtn.click();

	await expect(page).toHaveURL(/\/home/);
});

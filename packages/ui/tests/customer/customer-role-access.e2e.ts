import { test, expect } from '@playwright/test';
import { USER } from '../common/user-data';
import { loginAs } from '../common/login';

// Mirrors modules/home/nav-menu/menu.ts `customerAccess` and the
// routeRolesGuard(['Platform Owner', 'Business Owner', 'Admin', 'Enhanced'], ...)
// call in routes/home/customers/+page.svelte.
const ALLOWED_ROLES = [
	{ label: 'Platform Owner', user: USER.PLATFORM_OWNER },
	{ label: 'Business Owner', user: USER.BUSINESS_OWNER },
	{ label: 'Admin', user: USER.ADMIN },
	{ label: 'Enhanced', user: USER.ENHANCED }
];

test.describe('Customer page - role-based authorization', () => {
	for (const { label, user } of ALLOWED_ROLES) {
		test(`${label} can open the customer page`, async ({ page }) => {
			await loginAs(page, user);

			await page.goto('/home/customers');

			await expect(page).toHaveURL(/\/home\/customers/);
			await expect(page.getByTestId('customer-page')).toBeVisible();
			await expect(page.getByTestId('customer-heading')).toHaveText('Customers');
		});

		test(`${label} sees the Customers link in the sidebar`, async ({ page }) => {
			await loginAs(page, user);

			await expect(page.getByTestId('nav-item-customers')).toBeVisible();
		});
	}

	test('Standard is redirected away from the customer page (direct navigation)', async ({
		page
	}) => {
		await loginAs(page, USER.STANDARD);

		await page.goto('/home/customers');

		// routeRolesGuard sends disallowed roles back to /home.
		await expect(page).toHaveURL(/\/home$/);
		await expect(page.getByTestId('customer-page')).not.toBeVisible();
	});

	test('Standard does not see the Customers link in the sidebar', async ({ page }) => {
		await loginAs(page, USER.STANDARD);

		await expect(page.getByTestId('nav-item-customers')).not.toBeVisible();
	});

	test('Standard cannot reach the customer page even via the browser back/forward stack', async ({
		page
	}) => {
		await loginAs(page, USER.STANDARD);

		await page.goto('/home/customers');
		await expect(page).toHaveURL(/\/home$/);

		// A second, direct attempt should be rejected the same way -- not just
		// the first navigation after login.
		await page.goto('/home/customers');
		await expect(page).toHaveURL(/\/home$/);
	});

	test('an unauthenticated visitor is redirected to /login', async ({ page }) => {
		await page.goto('/home/customers');

		await expect(page).toHaveURL(/\/login/);
	});
});

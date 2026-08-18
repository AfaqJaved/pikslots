import test, { expect } from '@playwright/test';

test('customer page should have proper heading', async ({ page }) => {
	await page.goto('/home/customers');

	const heading = page.getByTestId('customer-heading');

	await expect(heading).toHaveText('Customers');
});

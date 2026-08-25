import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { USER } from './user-data';
import { loginAs } from './login';

// Edit/delete tests previously assumed a customer already existed in the
// seeded business and just navigated to /home/customers. That was flaky --
// on a business with zero customers, `customer-detail` never renders and
// every assertion built on top of it times out. Creating the fixture we
// need, in the test itself, removes the dependency on external seed data.
//
// NOTE: this goes through the real Add Customer dialog, so it is currently
// blocked by the same countryCode/dial-code schema mismatch documented in
// customer-add.e2e.ts ("[blocking bug]" test). Every test in
// customer-edit.e2e.ts and customer-delete.e2e.ts depends on this helper,
// so until that's fixed, all of them will fail for that one root cause.
export async function createCustomerAndOpenDetail(
	page: Page,
	firstName = `E2E ${Date.now()}`
): Promise<string> {
	await loginAs(page, USER.BUSINESS_OWNER);
	await page.goto('/home/customers');

	await page.getByTestId('customer-add').click();
	await page.getByTestId('add-customer-first-name').fill(firstName);
	// lastName is required by AddCustomerSchema (requiredName('Last name')).
	await page.getByTestId('add-customer-last-name').fill('Doe');
	// The app validates phone as "4-15 digits" and requires at least one of
	// phone/email -- fill a valid phone so the form actually submits.
	await page.getByTestId('add-customer-phone').fill('3001234567');
	await page.getByTestId('add-customer-save').click();

	const toast = page.locator('[data-sonner-toast]');
	await expect(toast).toBeVisible();
	await expect(page.getByTestId('add-customer-first-name')).not.toBeVisible();

	const item = page.locator('[data-testid^="customer-item-"]', { hasText: firstName });
	await expect(item).toBeVisible({ timeout: 10000 });
	await item.click();

	await expect(page.getByTestId('customer-detail')).toBeVisible();

	return firstName;
}

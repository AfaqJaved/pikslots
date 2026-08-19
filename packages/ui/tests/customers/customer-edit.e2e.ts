import { test, expect } from '@playwright/test';
import { USER } from '../common/user-data';
import { loginAs } from '../common/login';

async function openFirstCustomerAndEdit(page: import('@playwright/test').Page) {
	await loginAs(page, USER.BUSINESS_OWNER);
	await page.goto('/home/customers');

	// Relies on the same seeded customer used across the existing suite
	// (see tests/customer/customer-main-page.e2e.ts -- "customer-1").
	await expect(page.getByTestId('customer-detail')).toBeVisible();
	await page.getByTestId('customer-edit').click();
	await expect(page.getByTestId('edit-customer-first-name')).toBeVisible();
}

test.describe('Edit customer dialog - field validation', () => {
	test('blocks submission when first name is cleared', async ({ page }) => {
		await openFirstCustomerAndEdit(page);

		await page.getByTestId('edit-customer-first-name').fill('');
		await page.getByTestId('edit-customer-save').click();

		await expect(page.getByTestId('edit-customer-first-name-error')).toBeVisible();
	});

	test('rejects a malformed primary email', async ({ page }) => {
		await openFirstCustomerAndEdit(page);

		await page.getByTestId('edit-customer-email').fill('not-an-email');
		await page.getByTestId('edit-customer-save').click();

		await expect(page.getByTestId('edit-customer-email-error')).toBeVisible();
	});
});

test.describe('Edit customer dialog - submission', () => {
	test('the form is pre-filled with the selected customer\u2019s data', async ({ page }) => {
		await openFirstCustomerAndEdit(page);

		await expect(page.getByTestId('edit-customer-first-name')).not.toHaveValue('');
	});

	test('successfully updates a customer and shows a success toast', async ({ page }) => {
		await openFirstCustomerAndEdit(page);

		await page.route('**/customers/**', async (route) => {
			if (route.request().method() !== 'PATCH') return route.continue();
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ data: { id: 'customer-1' } })
			});
		});

		await page.getByTestId('edit-customer-company').fill('Acme Inc');
		await page.getByTestId('edit-customer-save').click();

		const toast = page.locator('[data-sonner-toast]');
		await expect(toast).toBeVisible();
		await expect(toast).toContainText('Customer updated successfully');
	});

	test('shows an error toast when the update request fails', async ({ page }) => {
		await openFirstCustomerAndEdit(page);

		await page.route('**/customers/**', async (route) => {
			if (route.request().method() !== 'PATCH') return route.continue();
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Internal Server Error' })
			});
		});

		await page.getByTestId('edit-customer-company').fill('Acme Inc');
		await page.getByTestId('edit-customer-save').click();

		const toast = page.locator('[data-sonner-toast]');
		await expect(toast).toBeVisible();
		await expect(toast).toContainText('Failed to update customer');
	});

	test('Cancel closes the dialog without submitting', async ({ page }) => {
		await openFirstCustomerAndEdit(page);

		let submitted = false;
		await page.route('**/customers/**', async (route) => {
			if (route.request().method() === 'PATCH') submitted = true;
			await route.continue();
		});

		await page.getByTestId('edit-customer-company').fill('Should not save');
		await page.getByTestId('edit-customer-cancel').click();

		await expect(page.getByTestId('edit-customer-first-name')).not.toBeVisible();
		expect(submitted).toBe(false);
	});
});

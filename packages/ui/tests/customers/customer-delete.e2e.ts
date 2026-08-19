import { test, expect } from '@playwright/test';
import { USER } from '../common/user-data';
import { loginAs } from '../common/login';

test.describe('Delete customer', () => {
	test('opening the actions menu and clicking delete shows a confirmation dialog', async ({
		page
	}) => {
		await loginAs(page, USER.BUSINESS_OWNER);
		await page.goto('/home/customers');

		await page.getByTestId('customer-actions').click();
		await page.getByTestId('customer-delete').click();

		await expect(page.getByText('Delete customer')).toBeVisible();
		await expect(page.getByTestId('confirm-dialog-confirm')).toBeVisible();
		await expect(page.getByTestId('confirm-dialog-cancel')).toBeVisible();
	});

	test('Cancel on the confirm dialog does not delete the customer', async ({ page }) => {
		await loginAs(page, USER.BUSINESS_OWNER);
		await page.goto('/home/customers');

		let deleteCalled = false;
		await page.route('**/customers/**', async (route) => {
			if (route.request().method() === 'DELETE') deleteCalled = true;
			await route.continue();
		});

		await page.getByTestId('customer-actions').click();
		await page.getByTestId('customer-delete').click();
		await page.getByTestId('confirm-dialog-cancel').click();

		expect(deleteCalled).toBe(false);
		await expect(page.getByTestId('confirm-dialog-confirm')).not.toBeVisible();
	});

	test('confirming delete removes the customer and shows a success toast', async ({ page }) => {
		await loginAs(page, USER.BUSINESS_OWNER);
		await page.goto('/home/customers');

		await page.route('**/customers/**', async (route) => {
			if (route.request().method() !== 'DELETE') return route.continue();
			await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
		});

		await page.getByTestId('customer-actions').click();
		await page.getByTestId('customer-delete').click();
		await page.getByTestId('confirm-dialog-confirm').click();

		const toast = page.locator('[data-sonner-toast]');
		await expect(toast).toBeVisible();
		await expect(toast).toContainText('Customer deleted');
	});

	test('shows an error toast when the delete request fails', async ({ page }) => {
		await loginAs(page, USER.BUSINESS_OWNER);
		await page.goto('/home/customers');

		await page.route('**/customers/**', async (route) => {
			if (route.request().method() !== 'DELETE') return route.continue();
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Internal Server Error' })
			});
		});

		await page.getByTestId('customer-actions').click();
		await page.getByTestId('customer-delete').click();
		await page.getByTestId('confirm-dialog-confirm').click();

		const toast = page.locator('[data-sonner-toast]');
		await expect(toast).toBeVisible();
		await expect(toast).toContainText('Failed to delete customer');
	});
});

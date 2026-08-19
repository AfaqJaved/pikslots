import { test, expect } from '@playwright/test';

test.describe('Customer Page - Main Page', () => {
	test('customer page should have proper heading', async ({ page }) => {
		await page.goto('/customers');

		const heading = page.getByTestId('customer-heading');

		await expect(heading).toHaveText('Customers');
	});

	//   test('should display loading state while customers are loading', async ({
	//     page,
	//   }) => {
	//     await page.route('**/customers**', async (route) => {
	//       await new Promise((resolve) => setTimeout(resolve, 1000));
	//       await route.continue();
	//     });

	//     await page.goto('/customers');

	//     await expect(page.getByTestId('customer-loading')).toBeVisible();
	//   });

	test('should display empty state when there are no customers', async ({ page }) => {
		await page.route('**/customers**', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([])
			});
		});

		await page.goto('/customers');

		await expect(page.getByTestId('customer-empty')).toBeVisible();
	});

	test('should display customers', async ({ page }) => {
		await page.goto('/customers');

		await expect(page.getByTestId('customer-list')).toBeVisible();

		await expect(page.getByTestId('customer-item-customer-1')).toBeVisible();
	});

	test('should automatically select the first customer', async ({ page }) => {
		await page.goto('/customers');

		await expect(page.getByTestId('customer-item-customer-1')).toHaveAttribute(
			'data-selected',
			'true'
		);

		await expect(page.getByTestId('customer-detail')).toBeVisible();
	});

	test('should select another customer', async ({ page }) => {
		await page.goto('/customers');

		await page.getByTestId('customer-item-customer-2').click();

		await expect(page.getByTestId('customer-item-customer-2')).toHaveAttribute(
			'data-selected',
			'true'
		);

		await expect(page.getByTestId('customer-detail')).toBeVisible();
	});

	test('should reset to About tab when selecting another customer', async ({ page }) => {
		await page.goto('/customers');

		await page.getByTestId('customer-tab-notes').click();

		await page.getByTestId('customer-item-customer-2').click();

		await expect(page.getByTestId('customer-tab-about')).toHaveAttribute('data-state', 'active');
	});

	test('should search customers by first name', async ({ page }) => {
		await page.goto('/customers');

		await page.getByTestId('customer-search').fill('John');

		await expect(page.getByTestId('customer-item-customer-1')).toBeVisible();

		await expect(page.getByTestId('customer-item-customer-2')).not.toBeVisible();
	});

	test('should search customers by last name', async ({ page }) => {
		await page.goto('/customers');

		await page.getByTestId('customer-search').fill('Smith');

		await expect(page.getByTestId('customer-item-customer-1')).toBeVisible();
	});

	test('should search customers by full name', async ({ page }) => {
		await page.goto('/customers');

		await page.getByTestId('customer-search').fill('John Smith');

		await expect(page.getByTestId('customer-item-customer-1')).toBeVisible();
	});

	test('should perform case-insensitive search', async ({ page }) => {
		await page.goto('/customers');

		await page.getByTestId('customer-search').fill('jOhN sMiTh');

		await expect(page.getByTestId('customer-item-customer-1')).toBeVisible();
	});

	test('should display empty state when search has no results', async ({ page }) => {
		await page.goto('/customers');

		await page.getByTestId('customer-search').fill('DoesNotExist');

		await expect(page.getByTestId('customer-empty')).toBeVisible();
	});

	test('should display all customers after clearing search', async ({ page }) => {
		await page.goto('/customers');

		const search = page.getByTestId('customer-search');

		await search.fill('John');

		await search.fill('');

		await expect(page.getByTestId('customer-item-customer-1')).toBeVisible();

		await expect(page.getByTestId('customer-item-customer-2')).toBeVisible();
	});

	test('should open the customer options menu', async ({ page }) => {
		await page.goto('/customers');

		await page.getByTestId('customer-options').click();

		await expect(page.getByTestId('customer-import')).toBeVisible();

		await expect(page.getByTestId('customer-export')).toBeVisible();
	});

	test('should display all customer tabs', async ({ page }) => {
		await page.goto('/customers');

		await expect(page.getByTestId('customer-tab-about')).toBeVisible();

		await expect(page.getByTestId('customer-tab-notes')).toBeVisible();

		await expect(page.getByTestId('customer-tab-appointments')).toBeVisible();

		await expect(page.getByTestId('customer-tab-updates')).toBeVisible();
	});

	test('should switch between customer tabs', async ({ page }) => {
		await page.goto('/customers');

		await page.getByTestId('customer-tab-notes').click();

		await expect(page.getByTestId('customer-tab-notes')).toHaveAttribute('data-state', 'active');

		await page.getByTestId('customer-tab-appointments').click();

		await expect(page.getByTestId('customer-tab-appointments')).toHaveAttribute(
			'data-state',
			'active'
		);

		await page.getByTestId('customer-tab-updates').click();

		await expect(page.getByTestId('customer-tab-updates')).toHaveAttribute('data-state', 'active');

		await page.getByTestId('customer-tab-about').click();

		await expect(page.getByTestId('customer-tab-about')).toHaveAttribute('data-state', 'active');
	});

	test('should open customer actions menu', async ({ page }) => {
		await page.goto('/customers');

		await page.getByTestId('customer-actions').click();

		await expect(page.getByTestId('customer-delete')).toBeVisible();
	});

	test('should display edit customer action', async ({ page }) => {
		await page.goto('/customers');

		await expect(page.getByTestId('customer-edit')).toBeVisible();
	});

	test('should display book appointment action', async ({ page }) => {
		await page.goto('/customers');

		await expect(page.getByTestId('customer-book-appointment')).toBeVisible();
	});

	test('should handle customer API failure', async ({ page }) => {
		await page.route('**/customers**', async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({
					message: 'Internal Server Error'
				})
			});
		});

		await page.goto('/customers');

		// Use your application's actual error test ID here.
		await expect(page.getByTestId('customer-error')).toBeVisible();
	});
});

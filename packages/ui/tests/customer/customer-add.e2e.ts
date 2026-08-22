import { test, expect } from '@playwright/test';
import { USER } from '../common/user-data';
import { loginAs } from '../common/login';

// Any role that can reach the customer page is enough to exercise the Add
// Customer dialog itself -- role gating is covered separately in
// customer-role-access.e2e.ts.
async function openAddCustomerDialog(page: import('@playwright/test').Page) {
	await loginAs(page, USER.BUSINESS_OWNER);
	await page.goto('/home/customers');
	await page.getByTestId('customer-add').click();
	await expect(page.getByTestId('add-customer-first-name')).toBeVisible();
}

test.describe('Add customer dialog - field validation', () => {
	test('blocks submission when first name is empty', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-first-name-error')).toBeVisible();
		await expect(page.getByTestId('add-customer-first-name-error')).toContainText(
			'First name is required'
		);
		// Dialog must stay open -- nothing should have been submitted.
		await expect(page.getByTestId('add-customer-save')).toBeVisible();
	});

	test('rejects a malformed primary email', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-email').fill('not-an-email');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-email-error')).toBeVisible();
		await expect(page.getByTestId('add-customer-email-error')).toContainText('Invalid email');
	});

	test('rejects a malformed additional email', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-add-field').click();
		await page.getByTestId('add-customer-add-field-email').click();
		await page.getByTestId('add-customer-additional-email').fill('also-not-an-email');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-additional-email-error')).toBeVisible();
	});

	test('an empty primary email is allowed (field is optional)', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-email').fill('');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-email-error')).not.toBeVisible();
	});
});

test.describe('Add customer dialog - uncommon / unexpected input', () => {
	// NOTE: AddCustomerSchema (modules/customers/validations/add-customer-schema.ts)
	// currently defines `phone: z.string()` with no format constraint at all.
	// The two tests below document today's actual behavior. They are not
	// asserting desired behavior -- see the follow-up describe block for what
	// I'd expect once phone validation is added.
	test('[known gap] letters in the phone field are currently accepted with no error', async ({
		page
	}) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-phone').fill('abcdefg');

		await page.route('**/customers', async (route) => {
			if (route.request().method() !== 'POST') return route.continue();
			await route.fulfill({
				status: 201,
				contentType: 'application/json',
				body: JSON.stringify({ data: { id: 'new-customer-1' } })
			});
		});

		await page.getByTestId('add-customer-save').click();

		// Today: no client-side error is raised and the request is sent.
		await expect(page.getByTestId('add-customer-phone-error')).not.toBeVisible();
	});

	test('[known gap] a phone field left as only whitespace is accepted', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-phone').fill('   ');

		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-phone-error')).not.toBeVisible();
	});

	test('[known gap] a first name that is only whitespace passes the "required" check', async ({
		page
	}) => {
		await openAddCustomerDialog(page);

		// z.string().min(1) only checks length, not trimmed content, so a
		// single space currently satisfies "required".
		await page.getByTestId('add-customer-first-name').fill(' ');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-first-name-error')).not.toBeVisible();
	});

	test('a very long first name does not crash the form', async ({ page }) => {
		await openAddCustomerDialog(page);

		const longName = 'A'.repeat(500);
		await page.getByTestId('add-customer-first-name').fill(longName);

		await expect(page.getByTestId('add-customer-first-name')).toHaveValue(longName);
		await expect(page.getByTestId('add-customer-first-name-error')).not.toBeVisible();
	});

	test('markup-like text in first name is stored as plain text, not executed', async ({ page }) => {
		await openAddCustomerDialog(page);

		const payload = '<img src=x onerror=alert(1)>';
		await page.getByTestId('add-customer-first-name').fill(payload);

		await expect(page.getByTestId('add-customer-first-name')).toHaveValue(payload);
		// No dialog/alert should have fired from Svelte's auto-escaping.
		page.on('dialog', () => {
			throw new Error('Unexpected browser dialog -- possible unescaped markup injection');
		});
	});
});

test.describe('Add customer dialog - once phone validation exists (target behavior)', () => {
	test.fixme('rejects letters typed into the phone field with a toast', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-phone').fill('abcdefg');
		await page.getByTestId('add-customer-save').click();

		const toast = page.locator('[data-sonner-toast]');
		await expect(toast).toBeVisible();
		await expect(toast).toContainText('phone');
	});
});

test.describe('Add customer dialog - submission', () => {
	test('successfully adds a customer and shows a success toast', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.route('**/customers', async (route) => {
			if (route.request().method() !== 'POST') return route.continue();
			await route.fulfill({
				status: 201,
				contentType: 'application/json',
				body: JSON.stringify({ data: { id: 'new-customer-1' } })
			});
		});

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-email').fill('jane.doe@example.com');
		await page.getByTestId('add-customer-save').click();

		const toast = page.locator('[data-sonner-toast]');
		await expect(toast).toBeVisible();
		await expect(toast).toContainText('Customer added successfully');
	});

	test('shows an error toast when the create request fails', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.route('**/customers', async (route) => {
			if (route.request().method() !== 'POST') return route.continue();
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Internal Server Error' })
			});
		});

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-save').click();

		const toast = page.locator('[data-sonner-toast]');
		await expect(toast).toBeVisible();
		await expect(toast).toContainText('Failed to add customer');
	});

	test('Cancel closes the dialog without submitting', async ({ page }) => {
		await openAddCustomerDialog(page);

		let submitted = false;
		await page.route('**/customers', async (route) => {
			if (route.request().method() === 'POST') submitted = true;
			await route.continue();
		});

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-cancel').click();

		await expect(page.getByTestId('add-customer-first-name')).not.toBeVisible();
		expect(submitted).toBe(false);
	});

	test('reopening the dialog after cancel starts with a blank form', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-cancel').click();

		await page.getByTestId('customer-add').click();
		await expect(page.getByTestId('add-customer-first-name')).toHaveValue('');
	});
});

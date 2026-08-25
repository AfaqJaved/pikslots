import { test, expect } from '@playwright/test';
import { USER } from '../common/user-data';
import { loginAs } from '../common/login';

// A phone value that satisfies phoneNumber's "4-15 digits" rule.
const VALID_PHONE = '3001234567';

// Any role that can reach the customer page is enough to exercise the Add
// Customer dialog itself -- role gating is covered separately in
// customer-role-access.e2e.ts.
async function openAddCustomerDialog(page: import('@playwright/test').Page) {
	await loginAs(page, USER.BUSINESS_OWNER);
	await page.goto('/home/customers');
	await page.getByTestId('customer-add').click();
	await expect(page.getByTestId('add-customer-first-name')).toBeVisible();
}

// Fills every field required to pass client-side validation
// (firstName, lastName, country default is already valid, phone satisfies
// the email-or-phone refine) so a test can isolate exactly one field.
async function fillMinimumValidForm(page: import('@playwright/test').Page) {
	await page.getByTestId('add-customer-first-name').fill('Jane');
	await page.getByTestId('add-customer-last-name').fill('Doe');
	await page.getByTestId('add-customer-phone').fill(VALID_PHONE);
}

test.describe('Add customer dialog - required fields', () => {
	test('blocks submission when first name is empty', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-first-name-error')).toBeVisible();
		await expect(page.getByTestId('add-customer-first-name-error')).toContainText(
			'First name is required'
		);
		await expect(page.getByTestId('add-customer-save')).toBeVisible();
	});

	test('blocks submission when first name is only whitespace', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('   ');
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-save').click();

		// requiredName() trims before checking min(1), so whitespace now
		// correctly resolves to the "required" error.
		await expect(page.getByTestId('add-customer-first-name-error')).toBeVisible();
	});

	test('blocks submission when last name is empty', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-last-name-error')).toBeVisible();
		await expect(page.getByTestId('add-customer-last-name-error')).toContainText(
			'Last name is required'
		);
	});

	test('rejects a first/last name containing digits or symbols', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane123');
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-first-name-error')).toBeVisible();
		await expect(page.getByTestId('add-customer-first-name-error')).toContainText(
			'invalid characters'
		);
	});

	test('rejects a first name longer than 100 characters', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('A'.repeat(101));
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-first-name-error')).toBeVisible();
		await expect(page.getByTestId('add-customer-first-name-error')).toContainText(
			'under 100 characters'
		);
	});

	test('accepts a first name at exactly the 100 character limit', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('A'.repeat(100));
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-phone').fill(VALID_PHONE);
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-first-name-error')).not.toBeVisible();
	});

	test('names with apostrophes, hyphens and accents are accepted', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill("Jean-Luc O'Neil");
		await page.getByTestId('add-customer-last-name').fill('Müller');
		await page.getByTestId('add-customer-phone').fill(VALID_PHONE);
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-first-name-error')).not.toBeVisible();
		await expect(page.getByTestId('add-customer-last-name-error')).not.toBeVisible();
	});
});

test.describe('Add customer dialog - phone validation', () => {
	test('rejects letters typed into the phone field', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-phone').fill('abcdefg');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-phone-error')).toBeVisible();
		await expect(page.getByTestId('add-customer-phone-error')).toContainText(
			'Phone number must contain'
		);
	});

	test('rejects a phone number shorter than 4 digits', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-phone').fill('12');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-phone-error')).toBeVisible();
	});

	test('rejects a phone number longer than 15 digits', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-phone').fill('1'.repeat(16));
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-phone-error')).toBeVisible();
	});

	test('accepts a valid 10-digit phone number', async ({ page }) => {
		await openAddCustomerDialog(page);

		await fillMinimumValidForm(page);
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-phone-error')).not.toBeVisible();
	});

	test('a phone left blank is fine as long as email is filled', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-email').fill('jane.doe@example.com');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-phone-error')).not.toBeVisible();
		await expect(page.getByTestId('add-customer-email-error')).not.toBeVisible();
	});
});

test.describe('Add customer dialog - email validation', () => {
	test('rejects a malformed primary email', async ({ page }) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-email').fill('not-an-email');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-email-error')).toBeVisible();
		await expect(page.getByTestId('add-customer-email-error')).toContainText('Invalid email');
	});

	test('rejects a malformed additional email', async ({ page }) => {
		await openAddCustomerDialog(page);

		await fillMinimumValidForm(page);
		await page.getByTestId('add-customer-add-field').click();
		await page.getByTestId('add-customer-add-field-email').click();
		await page.getByTestId('add-customer-additional-email').fill('also-not-an-email');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-additional-email-error')).toBeVisible();
	});

	test('requires at least one of email or phone', async ({ page }) => {
		await openAddCustomerDialog(page);

		// firstName/lastName valid, but both email and phone left blank --
		// the schema's object-level .refine() attaches its error to `email`.
		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-email-error')).toBeVisible();
		await expect(page.getByTestId('add-customer-email-error')).toContainText(
			'At least one of email or phone is required'
		);
	});

	test('an empty email is allowed when a valid phone is provided', async ({ page }) => {
		await openAddCustomerDialog(page);

		await fillMinimumValidForm(page);
		await page.getByTestId('add-customer-save').click();

		await expect(page.getByTestId('add-customer-email-error')).not.toBeVisible();
	});
});

test.describe('Add customer dialog - other uncommon input', () => {
	test('markup-like text in first name is rejected and never executed', async ({ page }) => {
		await openAddCustomerDialog(page);

		const payload = '<img src=x onerror=alert(1)>';
		await page.getByTestId('add-customer-first-name').fill(payload);
		await page.getByTestId('add-customer-last-name').fill('Doe');
		await page.getByTestId('add-customer-save').click();

		// The name regex rejects angle brackets/digits, so this is now
		// blocked by validation, not just "harmless because Svelte escapes it".
		await expect(page.getByTestId('add-customer-first-name-error')).toBeVisible();
		await expect(page.getByTestId('add-customer-first-name')).toHaveValue(payload);
		page.on('dialog', () => {
			throw new Error('Unexpected browser dialog -- possible unescaped markup injection');
		});
	});
});

test.describe('Add customer dialog - country code (known issue)', () => {
	// AddCustomerSchema requires countryCode to match /^[A-Z]{2}$/ (an ISO
	// alpha-2 code like "PK"), but the dropdown it's bound to only offers
	// dial codes ("+92", "+1", ...) and the form defaults to "+92". That
	// means this field currently fails validation in its default state, for
	// every submission, regardless of any other field.
	//
	// There is also no <FieldError> rendered for countryCode at all, so this
	// failure is completely silent today -- no inline error, no toast, the
	// form just doesn't submit. That's why this test asserts the *symptom*
	// (no success toast, dialog stays open) rather than an error message --
	// there's no error element to point at yet.
	test('[blocking bug] a technically-valid submission silently fails because of countryCode', async ({
		page
	}) => {
		await openAddCustomerDialog(page);

		let requestSent = false;
		await page.route('**/customers', async (route) => {
			if (route.request().method() === 'POST') requestSent = true;
			await route.continue();
		});

		await fillMinimumValidForm(page);
		await page.getByTestId('add-customer-save').click();

		// Give the (non-existent) submission a moment, then assert nothing
		// happened: no request, no toast, dialog still open.
		await page.waitForTimeout(1000);
		expect(requestSent).toBe(false);
		await expect(page.locator('[data-sonner-toast]')).not.toBeVisible();
		await expect(page.getByTestId('add-customer-first-name')).toBeVisible();
	});
});

test.describe('Add customer dialog - submission', () => {
	// NOTE: these assume the countryCode bug above is fixed. Until then they
	// will fail for the same root cause, not a new one.
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

		await fillMinimumValidForm(page);
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

		await fillMinimumValidForm(page);
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

	// Observed real behavior -- the dialog does NOT reset its fields between
	// a Cancel and the next open. Confirm with the team whether that's
	// intended (preserve an unsaved draft) or should reset.
	test('[known behavior] reopening after Cancel keeps the previously typed value', async ({
		page
	}) => {
		await openAddCustomerDialog(page);

		await page.getByTestId('add-customer-first-name').fill('Jane');
		await page.getByTestId('add-customer-cancel').click();

		await page.getByTestId('customer-add').click();
		await expect(page.getByTestId('add-customer-first-name')).toHaveValue('Jane');
	});
});

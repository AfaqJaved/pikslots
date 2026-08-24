import { expect, type Locator, type Page } from '@playwright/test';

export class BrandDetailsPage {
	private readonly saveButton: Locator;
	private readonly businessName: Locator;
	private readonly bookingUrl: Locator;
	private readonly about: Locator;
	private readonly industrySelect: Locator;
	private readonly toast: Locator;

	constructor(private page: Page) {
		this.saveButton = this.page.getByTestId('save-btn');
		this.businessName = this.page.getByTestId('business-name');
		this.bookingUrl = this.page.getByTestId('booking-url');
		this.about = this.page.getByTestId('about');
		this.industrySelect = this.page.getByTestId('industry-select');
		this.toast = this.page.locator('[data-sonner-toast]');
	}

	async goto() {
		await this.page.goto('/home/settings/brand/brand-details');
		await expect(this.saveButton).toBeVisible();
	}

	async isSaveButtonDisabled() {
		await expect(this.saveButton).toBeDisabled();
	}

	async changeBusinessName(name: string) {
		await this.businessName.fill(name);
	}

	async changeBookingUrl(url: string) {
		await this.bookingUrl.fill(url);
	}

	async changeAbout(about: string) {
		await this.about.fill(about);
	}

	async changeIndustry(industry: string) {
		await this.industrySelect.click();
		await this.page.getByRole('option', { name: industry }).click();
	}

	async save() {
		await this.saveButton.click();
	}

	async expectSaveButtonEnabled() {
		await expect(this.saveButton).toBeEnabled();
	}

	async expectSaveButtonDisabled() {
		await expect(this.saveButton).toBeDisabled();
	}

	async expectSuccessToast(message: string) {
		await expect(this.toast).toBeVisible();
		await expect(this.toast).toContainText(message);
	}
}

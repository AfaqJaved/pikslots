import { expect, type Locator, type Page } from '@playwright/test';

export class ServicesPage {
	private readonly newServiceBtn: Locator;
	private readonly servicesList: Locator;
	private readonly saveButton: Locator;
	private readonly searchInput: Locator;
	private readonly toast: Locator;

	constructor(private page: Page) {
		this.newServiceBtn = this.page.getByTestId('add-service-btn');
		this.servicesList = this.page.getByTestId('service-row');
		this.saveButton = this.page.getByTestId('save-service-btn');
		this.searchInput = this.page.getByPlaceholder('Services');
		this.toast = this.page.locator('[data-sonner-toast]');
	}

	async goto() {
		await this.page.goto('/home/services');
		await expect(this.newServiceBtn).toBeVisible();
	}

	async createNewService() {
		await this.newServiceBtn.click();
	}

	async getServiceCount() {
		return await this.servicesList.count();
	}

	async getServiceTitle(index: number) {
		const row = this.servicesList.nth(index);
		const title = row.locator('span:text-is').first();
		return await title.textContent();
	}

	async selectService(index: number) {
		await this.servicesList.nth(index).click();
	}

	async searchServices(term: string) {
		await this.searchInput.fill(term);
	}

	async clearSearch() {
		await this.searchInput.clear();
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
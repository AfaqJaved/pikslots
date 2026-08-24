import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
	private readonly email: Locator;
	private readonly password: Locator;
	private readonly loginBtn: Locator;
	private readonly toast: Locator;

	constructor(private page: Page) {
		this.email = this.page.getByTestId('email');
		this.password = this.page.getByTestId('password');
		this.loginBtn = this.page.getByTestId('login-btn');
		this.toast = this.page.locator('[data-sonner-toast]');
	}

	async goto() {
		await this.page.goto('/login');
		await expect(this.email).toBeVisible();
	}

	async fillEmail(email: string) {
		await this.email.fill(email);
	}

	async fillPassword(password: string) {
		await this.password.fill(password);
	}

	async login(email: string, password: string) {
		await this.fillEmail(email);
		await this.fillPassword(password);
		await this.loginBtn.click();
	}

	async expectLoginButtonEnabled() {
		await expect(this.loginBtn).toBeEnabled();
	}

	async expectLoginButtonDisabled() {
		await expect(this.loginBtn).toBeDisabled();
	}

	async expectErrorToast(message: string) {
		await expect(this.toast).toBeVisible();
		await expect(this.toast).toContainText(message);
	}
}

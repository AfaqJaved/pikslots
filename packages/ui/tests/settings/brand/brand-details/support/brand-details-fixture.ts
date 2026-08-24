import { LoginPage } from '../../../../login/support/login-page.pom';
import { BrandDetailsPage } from './brand-details-page.pom';
import { test as base } from '@playwright/test';

type TestFixtures = {
	loginPage: LoginPage;
	brandDetailsPage: BrandDetailsPage;
};

export const test = base.extend<TestFixtures>({
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},
	brandDetailsPage: async ({ page }, use) => {
		await use(new BrandDetailsPage(page));
	}
});

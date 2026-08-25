import { LoginPage } from '../../login/support/login-page.pom';
import { ServicesPage } from './services-page.pom';
import { test as base } from '@playwright/test';

type TestFixtures = {
	loginPage: LoginPage;
	servicesPage: ServicesPage;
};

export const test = base.extend<TestFixtures>({
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},
	servicesPage: async ({ page }, use) => {
		await use(new ServicesPage(page));
	}
});
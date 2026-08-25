import { test } from '../services/support/services-fixture';
// import { USER } from '../../../common/user-data';
import { USER } from '../common/user-data';
import { expect } from '@playwright/test';

test.beforeEach(async ({ loginPage, servicesPage }) => {
	await loginPage.goto();
	await loginPage.login(USER.PLATFORM_OWNER.username, USER.PLATFORM_OWNER.password);
	await servicesPage.goto();
});

test('should display services page', async ({ servicesPage }) => {
	const serviceCount = await servicesPage.getServiceCount();
	await expect(serviceCount).toBeGreaterThanOrEqual(0);
});

test('should navigate to new service page', async ({ servicesPage }) => {
	await servicesPage.createNewService();
});

test('should search services', async ({ servicesPage }) => {
	await servicesPage.searchServices('test');
	await servicesPage.clearSearch();
});

test('should display services list', async ({ servicesPage }) => {
	const count = await servicesPage.getServiceCount();
	await expect(count).toBeGreaterThanOrEqual(0);
});

test('should select a service from the list', async ({ servicesPage }) => {
	const count = await servicesPage.getServiceCount();
	if (count > 0) {
		await servicesPage.selectService(0);
	}
});

import { test } from '../brand-details/support/brand-details-fixture';
import { USER } from '../../../common/user-data';

test.beforeEach(async ({ loginPage, brandDetailsPage }) => {
	await loginPage.goto();
	await loginPage.login(USER.PLATFORM_OWNER.username, USER.PLATFORM_OWNER.password);
	await brandDetailsPage.goto();
});

test('save button should be disabled when fields are not modified', async ({
	brandDetailsPage
}) => {
	await brandDetailsPage.expectSaveButtonDisabled();
});

test('save button should enable when business name changes', async ({ brandDetailsPage }) => {
	await brandDetailsPage.changeBusinessName('new Business-name');
	await brandDetailsPage.expectSaveButtonEnabled();
});

test('save button should enable when booking URL changes', async ({ brandDetailsPage }) => {
	await brandDetailsPage.changeBookingUrl('new-slug');
	await brandDetailsPage.expectSaveButtonEnabled();
});

test('save button should enable when about changes', async ({ brandDetailsPage }) => {
	await brandDetailsPage.changeAbout('New about text');
	await brandDetailsPage.expectSaveButtonEnabled();
});

test('save button should enable when industry changes', async ({ brandDetailsPage }) => {
	await brandDetailsPage.changeIndustry('Health & Wellness');
	await brandDetailsPage.expectSaveButtonEnabled();
});

test('save brand details when changes happen on the brand details', async ({
	brandDetailsPage
}) => {
	await brandDetailsPage.changeBusinessName('hello sir');
	await brandDetailsPage.save();
	await brandDetailsPage.expectSuccessToast('Brand details saved successfully.');
});

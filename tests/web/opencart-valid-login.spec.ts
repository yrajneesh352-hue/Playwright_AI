import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Valid customer login flow @master @sanity @regression @web', async ({
    page,
    homePage,
    loginPage,
    accountPage,
}) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step('1) Navigate to My Account → Login', async () => {
        await homePage.clickMyAccount();
        await homePage.clickLogin();
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step('2) Log in with the configured customer credentials', async () => {
        await loginPage.login(email, password);
    });

    await test.step('3) Verify the My Account dashboard and authenticated navigation', async () => {
        await expect(page).toHaveURL(/route=account\/account/);
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
        expect(await homePage.hasAuthenticatedAccountNavigation()).toBeTruthy();
    });

    console.log('✅ Valid customer login completed successfully.');
});

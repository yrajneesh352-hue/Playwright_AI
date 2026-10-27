import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Customer logout flow @master @sanity @regression @web', async ({
    page,
    homePage,
    loginPage,
    accountPage,
    logoutPage,
}) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step('1) Log in using the configured customer credentials', async () => {
        await homePage.clickMyAccount();
        await homePage.clickLogin();
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
        await loginPage.login(email, password);
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
    });

    await test.step('2) Select Logout from the account dashboard', async () => {
        await accountPage.clickLogout();
        expect(await logoutPage.isLogoutConfirmationDisplayed()).toBeTruthy();
    });

    await test.step('3) Continue to the homepage and verify authenticated options are unavailable', async () => {
        await logoutPage.clickContinue();
        await expect(page).toHaveURL(/route=common\/home/);
        expect(await homePage.isHomePageExists()).toBeTruthy();
        expect(await homePage.hasAuthenticatedAccountNavigation()).toBeFalsy();
    });

    console.log('✅ Customer logout completed successfully.');
});

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('Customer registration flow @master @sanity @regression @web', async ({
    homePage,
    registerPage,
    accountPage,
}) => {
    const email = RandomDataUtil.getEmail().replace('@', `-${Date.now()}@`);
    const registrationDetails = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email,
        telephone: RandomDataUtil.getPhoneNumber(),
        password: RandomDataUtil.getPassword(),
    };

    await test.step('1) Navigate to My Account → Register', async () => {
        await homePage.clickMyAccount();
        await homePage.clickRegister();
        expect(await registerPage.isRegistrationPageExists()).toBeTruthy();
    });

    await test.step('2) Submit valid registration details and accept the Privacy Policy', async () => {
        await registerPage.completeRegistration(registrationDetails);
        expect(await registerPage.isAccountCreatedConfirmationVisible()).toBeTruthy();
    });

    await test.step('3) Continue to the new account and verify authenticated navigation', async () => {
        await registerPage.clickContinue();
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
        expect(await homePage.hasAuthenticatedAccountNavigation()).toBeTruthy();
    });

    console.log('✅ Customer registration completed successfully.');
});

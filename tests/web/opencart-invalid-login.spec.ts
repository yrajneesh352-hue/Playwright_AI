import path from 'path';
import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';

type LoginTestData = {
    testName: string;
    email: string;
    password: string;
    expected: 'success' | 'failure';
};

const loginData = DataProvider.readJson(
    path.resolve(process.cwd(), 'testdata', 'opencart_logindata.json'),
) as LoginTestData[];
const invalidCredentials = loginData.find(
    (data) => data.expected === 'failure' && data.email.trim() && data.password.trim(),
);

if (!invalidCredentials) {
    throw new Error('A non-blank invalid login row is required in opencart_logindata.json.');
}

test('Invalid customer login is rejected @master @sanity @regression @web', async ({
    page,
    homePage,
    loginPage,
    accountPage,
}) => {
    const email = invalidCredentials.email.replace('@', `+invalid-${Date.now()}@`);

    await test.step('1) Navigate to My Account → Login', async () => {
        await homePage.clickMyAccount();
        await homePage.clickLogin();
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step('2) Submit invalid customer credentials', async () => {
        await loginPage.login(email, invalidCredentials.password);
    });

    await test.step('3) Verify the warning and confirm the customer remains unauthenticated', async () => {
        await expect(page).toHaveURL(/route=account\/login/);
        expect(await loginPage.isWarningVisible()).toBeTruthy();
        expect(await loginPage.getWarningMessage()).toContain(
            'Warning: No match for E-Mail Address and/or Password.',
        );
        expect(await accountPage.isMyAccountPageExists()).toBeFalsy();
    });

    console.log('✅ Invalid customer login was rejected as expected.');
});

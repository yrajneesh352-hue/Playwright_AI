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

for (const [index, data] of loginData.entries()) {
    test(`${data.testName} - row ${index + 1} @master @regression @datadriven @web`, async ({
        page,
        homePage,
        loginPage,
        accountPage,
    }) => {
        const email = data.email.trim() ? data.email : '';
        const password = data.password.trim() ? data.password : '';

        await test.step('1) Open the login page', async () => {
            await homePage.clickMyAccount();
            await homePage.clickLogin();
            expect(await loginPage.isLoginPageExists()).toBeTruthy();
        });

        await test.step('2) Submit the supplied data and validate the expected result', async () => {
            await loginPage.login(email, password);

            if (data.expected === 'success') {
                await expect(page).toHaveURL(/route=account\/account/);
                expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
            } else {
                await expect(page).toHaveURL(/route=account\/login/);
                if (await loginPage.isWarningVisible()) {
                    const warningMessage = await loginPage.getWarningMessage();
                    expect(
                        warningMessage.includes('Warning: No match for E-Mail Address and/or Password.') ||
                        warningMessage.includes('Warning: Your account has exceeded allowed number of login attempts.'),
                    ).toBeTruthy();
                } else {
                    expect(email === '' || password === '').toBeTruthy();
                    expect(await loginPage.hasNativeValidationError()).toBeTruthy();
                }
                expect(await accountPage.isMyAccountPageExists()).toBeFalsy();
            }
        });

        console.log(`✅ Data-driven login row ${index + 1} completed successfully.`);
    });
}

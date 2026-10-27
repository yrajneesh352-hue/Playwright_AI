import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('Complete customer shopping journey @master @regression @end-to-end @web', async ({
    page,
    homePage,
    registerPage,
    loginPage,
    accountPage,
    logoutPage,
    searchResultsPage,
    productPage,
    cartPage,
}) => {
    const email = RandomDataUtil.getEmail().replace('@', `-${Date.now()}@`);
    const password = RandomDataUtil.getPassword();
    const registrationDetails = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email,
        telephone: RandomDataUtil.getPhoneNumber(),
        password,
    };
    const { productName, productQuantity } = Helper.getInStockProductDetails();
    let productPrice = '';

    await test.step('1) Register a new customer and verify account creation', async () => {
        await homePage.clickMyAccount();
        await homePage.clickRegister();
        expect(await registerPage.isRegistrationPageExists()).toBeTruthy();
        await registerPage.completeRegistration(registrationDetails);
        expect(await registerPage.isAccountCreatedConfirmationVisible()).toBeTruthy();
        await registerPage.clickContinue();
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
    });

    await test.step('2) Log out and sign in again with the new customer credentials', async () => {
        await accountPage.clickLogout();
        expect(await logoutPage.isLogoutConfirmationDisplayed()).toBeTruthy();
        await logoutPage.clickContinue();
        await homePage.clickMyAccount();
        await homePage.clickLogin();
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
        await loginPage.login(email, password);
        await expect(page).toHaveURL(/route=account\/account/);
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
    });

    await test.step('3) Find the configured product and add it to the cart', async () => {
        await homePage.searchProduct(productName);
        expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
        expect(await searchResultsPage.hasProduct(productName)).toBeTruthy();
        await searchResultsPage.openProduct(productName);
        expect(await productPage.isProductDetailsDisplayed(productName)).toBeTruthy();

        productPrice = await productPage.getProductPrice();
        await productPage.setQuantity(productQuantity);
        await productPage.addToCart();
        expect(await productPage.getProductAddedMessage()).toContain(
            `Success: You have added ${productName} to your shopping cart!`,
        );
    });

    await test.step('4) Verify the product, quantity, price, and cart total', async () => {
        await homePage.openShoppingCart();
        await expect(page).toHaveURL(/route=checkout\/cart/);
        expect(await cartPage.isShoppingCartPageExists()).toBeTruthy();
        expect(await cartPage.hasProduct(productName)).toBeTruthy();
        expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);

        const expectedLineTotal =
            Helper.convertPriceToNumber(productPrice) * Number(productQuantity);
        expect(Helper.convertPriceToNumber(await cartPage.getProductPrice(productName)))
            .toBe(Helper.convertPriceToNumber(productPrice));
        expect(Helper.convertPriceToNumber(await cartPage.getProductLineTotal(productName)))
            .toBe(expectedLineTotal);
        expect(Helper.convertPriceToNumber(await cartPage.getCartTotal()))
            .toBe(expectedLineTotal);
    });

    console.log('✅ Complete customer shopping journey finished successfully.');
});

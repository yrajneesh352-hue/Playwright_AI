import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Add product to cart with expected quantity @master @sanity @regression @web', async ({
    page,
    homePage,
    searchResultsPage,
    productPage,
    cartPage,
}) => {
    const { productName, productQuantity } = Helper.getInStockProductDetails();

    await test.step('1) Search for the configured product and open its details', async () => {
        await homePage.searchProduct(productName);
        expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
        expect(await searchResultsPage.hasProduct(productName)).toBeTruthy();
        await searchResultsPage.openProduct(productName);
        expect(await productPage.isProductDetailsDisplayed(productName)).toBeTruthy();
    });

    await test.step('2) Set the requested quantity and add the product to the cart', async () => {
        await productPage.setQuantity(productQuantity);
        await productPage.addToCart();
        expect(await productPage.getProductAddedMessage()).toContain(
            `Success: You have added ${productName} to your shopping cart!`,
        );
    });

    await test.step('3) Verify the product and quantity in the shopping cart', async () => {
        await homePage.openShoppingCart();
        await expect(page).toHaveURL(/route=checkout\/cart/);
        expect(await cartPage.isShoppingCartPageExists()).toBeTruthy();
        expect(await cartPage.hasProduct(productName)).toBeTruthy();
        expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);
    });

    console.log('✅ Product added to the shopping cart with the expected quantity.');
});

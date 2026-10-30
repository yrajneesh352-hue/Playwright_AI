import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Cart product quantity can be updated and removed @master @regression @web', async ({
    page,
    homePage,
    searchResultsPage,
    productPage,
    cartPage,
}) => {
    const { productName } = Helper.getInStockProductDetails();
    const quantity = '2';

    await test.step('1) Add the configured product to the shopping cart', async () => {
        await homePage.searchProduct(productName);
        expect(await searchResultsPage.hasProduct(productName)).toBeTruthy();
        await searchResultsPage.openProduct(productName);
        await productPage.setQuantity('1');
        await productPage.addToCart();
        await homePage.openShoppingCart();
        expect(await cartPage.hasProduct(productName)).toBeTruthy();
    });

    await test.step('2) Update the cart quantity and verify the calculated line total', async () => {
        await cartPage.updateProductQuantity(productName, quantity);
        expect(await cartPage.getProductQuantity(productName)).toBe(quantity);

        const unitPrice = Helper.convertPriceToNumber(await cartPage.getProductPrice(productName));
        const expectedLineTotal = unitPrice * Number(quantity);
        expect(Helper.convertPriceToNumber(await cartPage.getProductLineTotal(productName)))
            .toBe(expectedLineTotal);
        expect(Helper.convertPriceToNumber(await cartPage.getCartTotal()))
            .toBe(expectedLineTotal);
    });

    await test.step('3) Remove the product and verify the cart is empty', async () => {
        await cartPage.removeProduct(productName);
        await expect.poll(() => cartPage.isShoppingCartEmpty()).toBeTruthy();
    });
});

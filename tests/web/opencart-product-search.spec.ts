import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Product search returns the expected product @master @sanity @regression @web', async ({
    page,
    homePage,
    searchResultsPage,
}) => {
    const { productName } = Helper.getProductDetails();

    await test.step('1) Search for the configured product', async () => {
        await homePage.searchProduct(productName);
    });

    await test.step('2) Verify search results and the exact matching product name', async () => {
        await expect(page).toHaveURL(new RegExp(`route=product/search.*search=${encodeURIComponent(productName)}`));
        expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
        expect(await searchResultsPage.hasProduct(productName)).toBeTruthy();
        await expect(page.getByRole('heading', { name: productName, exact: true })).toHaveText(productName);
    });

    console.log('✅ Product search returned the expected product.');
});

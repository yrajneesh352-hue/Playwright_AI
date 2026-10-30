import { test, expect } from '../../fixtures/pageFixtures';

test('Product search displays an empty-results message @master @regression @web', async ({
    page,
    homePage,
    searchResultsPage,
}) => {
    const missingProduct = `missing-product-${Date.now()}`;

    await test.step('1) Search for a product that does not exist', async () => {
        await homePage.searchProduct(missingProduct);
    });

    await test.step('2) Verify the search page explains that there are no matching products', async () => {
        expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
        await expect(
            page.getByText('There is no product that matches the search criteria.', { exact: true }),
        ).toBeVisible();
        expect(await searchResultsPage.hasProduct(missingProduct)).toBeFalsy();
    });
});

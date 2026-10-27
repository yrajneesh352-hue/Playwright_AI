import { Locator, Page } from '@playwright/test';

export class SearchResultsPage {
    private readonly page: Page;

    // Locators
    private readonly resultsHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.resultsHeading = page.getByRole('heading', { name: /Search -/ });
    }

    /**
     * Checks whether the search results page is displayed.
     * @returns Promise<boolean> - true when the results heading is visible
     */
    async isSearchResultsPageExists(): Promise<boolean> {
        try {
            return await this.resultsHeading.isVisible();
        } catch (error) {
            console.log(`Error checking the search results page: ${error}`);
            return false;
        }
    }

    /**
     * Checks whether a product appears in search results.
     * @param productName - Expected product name
     * @returns Promise<boolean> - true when an exact product link is visible
     */
    async hasProduct(productName: string): Promise<boolean> {
        try {
            return await this.page.getByRole('heading', { name: productName, exact: true })
                .getByRole('link', { name: productName, exact: true }).isVisible();
        } catch (error) {
            console.log(`Error checking for product "${productName}": ${error}`);
            return false;
        }
    }

    /**
     * Opens a product from search results.
     * @param productName - Product name to open
     */
    async openProduct(productName: string): Promise<void> {
        await this.page.getByRole('heading', { name: productName, exact: true })
            .getByRole('link', { name: productName, exact: true }).click();
    }
}

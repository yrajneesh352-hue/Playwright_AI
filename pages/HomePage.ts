import { Locator, Page } from '@playwright/test';

export class HomePage {
    private readonly page: Page;

    // Locators
    private readonly accountToggle: Locator;
    private readonly searchInput: Locator;
    private readonly searchButton: Locator;
    private readonly cartButton: Locator;
    private readonly viewCartLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.accountToggle = page.locator('#top-links').getByRole('link', { name: /My Account/ });
        this.searchInput = page.getByPlaceholder('Search');
        this.searchButton = page.locator('#search button');
        this.cartButton = page.locator('#cart > button');
        this.viewCartLink = page.getByRole('link', { name: /View Cart/ });
    }

    /**
     * Opens the My Account menu.
     */
    async clickMyAccount(): Promise<void> {
        await this.accountToggle.click();
    }

    /**
     * Opens the registration page from the account menu.
     */
    async clickRegister(): Promise<void> {
        await this.page.getByRole('link', { name: 'Register', exact: true }).click();
    }

    /**
     * Opens the login page from the account menu.
     */
    async clickLogin(): Promise<void> {
        await this.page.getByRole('link', { name: 'Login', exact: true }).click();
    }

    /**
     * Searches for a product.
     * @param productName - Product name to search for
     */
    async searchProduct(productName: string): Promise<void> {
        await this.searchInput.fill(productName);
        await this.searchButton.click();
    }

    /**
     * Opens the shopping cart from the header cart menu.
     */
    async openShoppingCart(): Promise<void> {
        await this.cartButton.click();
        await this.viewCartLink.click();
    }

    /**
     * Checks whether the account menu offers authenticated account options.
     * @returns Promise<boolean> - true when the Logout option is visible
     */
    async hasAuthenticatedAccountNavigation(): Promise<boolean> {
        try {
            await this.clickMyAccount();
            return await this.page.locator('#top-links')
                .getByRole('link', { name: 'Logout', exact: true }).isVisible();
        } catch (error) {
            console.log(`Error checking authenticated account navigation: ${error}`);
            return false;
        }
    }

    /**
     * Checks whether the current URL is the store homepage.
     * @returns Promise<boolean> - true when the homepage URL is displayed
     */
    async isHomePageExists(): Promise<boolean> {
        try {
            const currentUrl = new URL(this.page.url());
            return currentUrl.pathname.endsWith('/upload/') ||
                currentUrl.searchParams.get('route') === 'common/home';
        } catch (error) {
            console.log(`Error checking the home page: ${error}`);
            return false;
        }
    }
}

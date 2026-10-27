import { Locator, Page } from '@playwright/test';

export class AccountPage {
    // Locators
    private readonly accountHeading: Locator;
    private readonly accountInformationLink: Locator;
    private readonly logoutLink: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.accountHeading = page.locator('#content').getByRole('heading', { name: 'My Account', exact: true });
        this.accountInformationLink = page.getByRole('link', { name: 'Edit your account information', exact: true });
        this.logoutLink = page.locator('#column-right').getByRole('link', { name: 'Logout', exact: true });
    }

    /**
     * Checks whether the authenticated account dashboard is displayed.
     * @returns Promise<boolean> - true when account dashboard content is visible
     */
    async isMyAccountPageExists(): Promise<boolean> {
        try {
            return await this.accountHeading.isVisible() && await this.accountInformationLink.isVisible();
        } catch (error) {
            console.log(`Error checking the My Account page: ${error}`);
            return false;
        }
    }

    /**
     * Logs out from the account dashboard.
     */
    async clickLogout(): Promise<void> {
        await this.logoutLink.click();
    }
}

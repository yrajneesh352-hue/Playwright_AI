import { Locator, Page } from '@playwright/test';

export class LogoutPage {
    // Locators
    private readonly logoutHeading: Locator;
    private readonly continueButton: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.logoutHeading = page.getByRole('heading', { name: 'Account Logout', exact: true });
        this.continueButton = page.getByRole('link', { name: 'Continue', exact: true });
    }

    /**
     * Checks whether the logout confirmation page is displayed.
     * @returns Promise<boolean> - true when the confirmation heading is visible
     */
    async isLogoutConfirmationDisplayed(): Promise<boolean> {
        try {
            return await this.logoutHeading.isVisible();
        } catch (error) {
            console.log(`Error checking the logout confirmation: ${error}`);
            return false;
        }
    }

    /**
     * Continues from the logout confirmation page.
     */
    async clickContinue(): Promise<void> {
        await this.continueButton.click();
    }
}

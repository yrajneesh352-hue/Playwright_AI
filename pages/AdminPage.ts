import { Locator, Page } from '@playwright/test';

export type AdminCustomerDetails = {
    firstName: string;
    lastName: string;
    email: string;
    status: string;
};

export class AdminPage {
    // Locators
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly loginWarning: Locator;
    private readonly customerMenu: Locator;
    private readonly customerManagementLink: Locator;
    private readonly emailFilterInput: Locator;
    private readonly filterButton: Locator;

    constructor(private readonly page: Page) {
        // Initialize locators with CSS selectors
        this.usernameInput = page.getByRole('textbox', { name: 'Username' });
        this.passwordInput = page.getByRole('textbox', { name: 'Password' });
        this.loginButton = page.getByRole('button', { name: /Login/ });
        this.loginWarning = page.locator('.alert-danger');
        this.customerMenu = page.locator('#menu-customer > a');
        this.customerManagementLink = page.locator('#menu-customer')
            .getByRole('link', { name: 'Customers', exact: true }).last();
        this.emailFilterInput = page.locator('#input-email');
        this.filterButton = page.locator('#button-filter');
    }

    /**
     * Opens the Admin portal and signs in with configured credentials.
     * @param adminUrl - Admin portal URL
     * @param username - Configured Admin username
     * @param password - Configured Admin password
     */
    async login(adminUrl: string, username: string, password: string): Promise<void> {
        await this.page.goto(adminUrl);
        if (await this.customerMenu.isVisible()) {
            return;
        }

        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();

        const loginResult = await Promise.race([
            this.customerMenu.waitFor({ state: 'visible' }).then(() => 'success' as const),
            this.loginWarning.waitFor({ state: 'visible' }).then(() => 'rejected' as const),
        ]);
        if (loginResult === 'rejected') {
            throw new Error('The Admin portal rejected the configured administrator credentials.');
        }
    }

    /**
     * Opens the customer list and filters it by email.
     * @param email - Unique customer email to find
     */
    async searchCustomerByEmail(email: string): Promise<void> {
        await this.customerMenu.click();
        await this.customerManagementLink.click();
        await this.emailFilterInput.fill(email);
        await this.filterButton.click();
    }

    /**
     * Checks whether a customer row matching the email is displayed.
     * @param email - Customer email to check
     * @returns Promise<boolean> - true when a matching row is present
     */
    async customerExists(email: string): Promise<boolean> {
        const row = this.customerRow(email);
        try {
            await row.waitFor({ state: 'visible' });
            return true;
        } catch (error) {
            console.log(`Error checking the Admin customer row: ${error}`);
            return false;
        }
    }

    /**
     * Reads the customer status from the Admin customer list.
     * @param email - Customer email to locate
     * @returns Promise<string> - displayed customer status
     */
    async getCustomerListStatus(email: string): Promise<string> {
        return (await this.customerRow(email).locator('td').nth(3).innerText()).trim();
    }

    /**
     * Opens a customer's Admin details and reads the registration fields.
     * @param email - Unique customer email to locate
     * @returns Promise<AdminCustomerDetails> - values displayed by the Admin form
     */
    async openCustomerDetails(email: string): Promise<AdminCustomerDetails> {
        const row = this.customerRow(email);
        await row.locator('a[title="Edit"]').click();

        const status = await this.page.locator('#input-status').inputValue();
        return {
            firstName: await this.page.locator('#input-firstname').inputValue(),
            lastName: await this.page.locator('#input-lastname').inputValue(),
            email: await this.page.locator('#input-email').inputValue(),
            status,
        };
    }

    private customerRow(email: string): Locator {
        return this.page.locator('table tbody tr').filter({ hasText: email });
    }
}

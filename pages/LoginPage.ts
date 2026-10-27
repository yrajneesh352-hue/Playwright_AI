import { Locator, Page } from '@playwright/test';

export class LoginPage {
    // Locators
    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly warningMessage: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.emailInput = page.locator('#input-email');
        this.passwordInput = page.locator('#input-password');
        this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
        this.warningMessage = page.locator('.alert-danger');
    }

    /**
     * Checks whether the login form is displayed.
     * @returns Promise<boolean> - true when the email and password fields are visible
     */
    async isLoginPageExists(): Promise<boolean> {
        try {
            await this.emailInput.waitFor({ state: 'visible' });
            await this.passwordInput.waitFor({ state: 'visible' });
            return true;
        } catch (error) {
            console.log(`Error checking the login page: ${error}`);
            return false;
        }
    }

    /**
     * Submits customer credentials.
     * @param email - Customer email address
     * @param password - Customer password
     */
    async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    /**
     * Checks whether an authentication warning is displayed.
     * @returns Promise<boolean> - true when the warning is visible
     */
    async isWarningVisible(): Promise<boolean> {
        try {
            return await this.warningMessage.isVisible();
        } catch (error) {
            console.log(`Error checking the login warning: ${error}`);
            return false;
        }
    }

    /**
     * Returns the displayed authentication warning.
     * @returns Promise<string> - Warning text
     */
    async getWarningMessage(): Promise<string> {
        return (await this.warningMessage.innerText()).trim();
    }

    /**
     * Checks whether the browser is blocking submission because a login field is invalid.
     * @returns Promise<boolean> - true when either login field fails native validation
     */
    async hasNativeValidationError(): Promise<boolean> {
        const emailIsInvalid = await this.emailInput.evaluate(
            (element: HTMLInputElement) => !element.validity.valid,
        );
        const passwordIsInvalid = await this.passwordInput.evaluate(
            (element: HTMLInputElement) => !element.validity.valid,
        );
        return emailIsInvalid || passwordIsInvalid;
    }
}

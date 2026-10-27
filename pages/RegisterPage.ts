import { Locator, Page } from '@playwright/test';

export type RegistrationDetails = {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
};

export class RegisterPage {
    // Locators
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly emailInput: Locator;
    private readonly telephoneInput: Locator;
    private readonly passwordInput: Locator;
    private readonly confirmPasswordInput: Locator;
    private readonly privacyPolicyCheckbox: Locator;
    private readonly continueButton: Locator;
    private readonly accountContinueLink: Locator;
    private readonly accountCreatedHeading: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.firstNameInput = page.locator('#input-firstname');
        this.lastNameInput = page.locator('#input-lastname');
        this.emailInput = page.locator('#input-email');
        this.telephoneInput = page.locator('#input-telephone');
        this.passwordInput = page.locator('#input-password');
        this.confirmPasswordInput = page.locator('#input-confirm');
        this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
        this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
        this.accountContinueLink = page.getByRole('link', { name: 'Continue', exact: true });
        this.accountCreatedHeading = page.getByRole('heading', { name: 'Your Account Has Been Created!', exact: true });
    }

    /**
     * Checks whether the registration form is displayed.
     * @returns Promise<boolean> - true when the first-name field is visible
     */
    async isRegistrationPageExists(): Promise<boolean> {
        try {
            await this.firstNameInput.waitFor({ state: 'visible' });
            return true;
        } catch (error) {
            console.log(`Error checking the registration page: ${error}`);
            return false;
        }
    }

    /**
     * Fills and submits the customer registration form.
     * @param details - Customer registration values
     */
    async completeRegistration(details: RegistrationDetails): Promise<void> {
        try {
            await this.firstNameInput.fill(details.firstName);
            await this.lastNameInput.fill(details.lastName);
            await this.emailInput.fill(details.email);
            await this.telephoneInput.fill(details.telephone);
            await this.passwordInput.fill(details.password);
            await this.confirmPasswordInput.fill(details.password);
            await this.privacyPolicyCheckbox.check();
            await this.continueButton.click();
        } catch (error) {
            console.log(`Error submitting the customer registration form: ${error}`);
            throw error;
        }
    }

    /**
     * Checks whether the account-created confirmation is displayed.
     * @returns Promise<boolean> - true when the confirmation heading is visible
     */
    async isAccountCreatedConfirmationVisible(): Promise<boolean> {
        try {
            await this.accountCreatedHeading.waitFor({ state: 'visible' });
            return true;
        } catch (error) {
            console.log(`Error checking the account-created confirmation: ${error}`);
            return false;
        }
    }

    /**
     * Continues from the account-created confirmation to the account area.
     */
    async clickContinue(): Promise<void> {
        await this.accountContinueLink.click();
    }
}

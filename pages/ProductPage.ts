import { Locator, Page } from '@playwright/test';

export class ProductPage {
    // Locators
    private readonly productHeading: Locator;
    private readonly productPrice: Locator;
    private readonly quantityInput: Locator;
    private readonly addToCartButton: Locator;
    private readonly successMessage: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.productHeading = page.locator('#content h1');
        this.productPrice = page.locator('#content .list-unstyled h2').first();
        this.quantityInput = page.locator('#input-quantity');
        this.addToCartButton = page.locator('#button-cart');
        this.successMessage = page.locator('.alert-success');
    }

    /**
     * Checks whether product details are displayed.
     * @param productName - Expected product name
     * @returns Promise<boolean> - true when the product heading matches
     */
    async isProductDetailsDisplayed(productName: string): Promise<boolean> {
        try {
            await this.productHeading.waitFor({ state: 'visible' });
            return await this.productHeading.isVisible() &&
                (await this.productHeading.innerText()).trim() === productName;
        } catch (error) {
            console.log(`Error checking product details for "${productName}": ${error}`);
            return false;
        }
    }

    /**
     * Returns the displayed product price.
     * @returns Promise<string> - Price text
     */
    async getProductPrice(): Promise<string> {
        return (await this.productPrice.innerText()).trim();
    }

    /**
     * Sets the requested product quantity.
     * @param quantity - Quantity to enter
     */
    async setQuantity(quantity: string): Promise<void> {
        await this.quantityInput.fill(quantity);
    }

    /**
     * Adds the product to the shopping cart.
     */
    async addToCart(): Promise<void> {
        try {
            await this.addToCartButton.click();
        } catch (error) {
            console.log(`Error adding the product to the cart: ${error}`);
            throw error;
        }
    }

    /**
     * Returns the product-added confirmation message.
     * @returns Promise<string> - Success message text
     */
    async getProductAddedMessage(): Promise<string> {
        return (await this.successMessage.innerText()).trim();
    }
}

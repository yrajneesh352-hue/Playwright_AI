import { Locator, Page } from '@playwright/test';

export class CartPage {
    private readonly page: Page;

    // Locators
    private readonly cartHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.cartHeading = page.getByRole('heading', { name: /^Shopping Cart/ });
    }

    /**
     * Checks whether the shopping cart page is displayed.
     * @returns Promise<boolean> - true when the cart heading is visible
     */
    async isShoppingCartPageExists(): Promise<boolean> {
        try {
            return await this.cartHeading.isVisible();
        } catch (error) {
            console.log(`Error checking the shopping cart page: ${error}`);
            return false;
        }
    }

    /**
     * Checks whether a product is present in the cart.
     * @param productName - Expected product name
     * @returns Promise<boolean> - true when the product row is visible
     */
    async hasProduct(productName: string): Promise<boolean> {
        try {
            return await this.productRow(productName).isVisible();
        } catch (error) {
            console.log(`Error checking for cart product "${productName}": ${error}`);
            return false;
        }
    }

    /**
     * Returns the quantity shown for a cart product.
     * @param productName - Product name in the cart
     * @returns Promise<string> - Cart quantity
     */
    async getProductQuantity(productName: string): Promise<string> {
        return await this.productRow(productName).locator('input[name^="quantity"]').inputValue();
    }

    /**
     * Returns the unit price shown for a cart product.
     * @param productName - Product name in the cart
     * @returns Promise<string> - Unit price text
     */
    async getProductPrice(productName: string): Promise<string> {
        return (await this.productRow(productName).locator('td').nth(4).innerText()).trim();
    }

    /**
     * Returns the line total shown for a cart product.
     * @param productName - Product name in the cart
     * @returns Promise<string> - Product line total
     */
    async getProductLineTotal(productName: string): Promise<string> {
        return (await this.productRow(productName).locator('td').nth(5).innerText()).trim();
    }

    /**
     * Returns the grand total from the cart totals table.
     * @returns Promise<string> - Cart total text
     */
    async getCartTotal(): Promise<string> {
        const totalRow = this.page.locator('#content .table-bordered tr').filter({ hasText: 'Total' }).last();
        return (await totalRow.locator('td').last().innerText()).trim();
    }

    /**
     * Updates the quantity for a product in the shopping cart.
     * @param productName - Product name in the cart
     * @param quantity - New product quantity
     */
    async updateProductQuantity(productName: string, quantity: string): Promise<void> {
        const row = this.productRow(productName);
        await row.locator('input[name^="quantity"]').fill(quantity);
        await row.locator('button[title="Update"]').click();
    }

    /**
     * Removes a product from the shopping cart.
     * @param productName - Product name in the cart
     */
    async removeProduct(productName: string): Promise<void> {
        await this.productRow(productName).locator('button[title="Remove"]').click();
    }

    /**
     * Checks whether the cart displays its empty-state message.
     */
    async isShoppingCartEmpty(): Promise<boolean> {
        return await this.page.getByText('Your shopping cart is empty!', { exact: true }).isVisible();
    }

    private productRow(productName: string): Locator {
        return this.page.locator('#content table tbody tr').filter({
            has: this.page.getByRole('link', { name: productName, exact: true }),
        });
    }
}

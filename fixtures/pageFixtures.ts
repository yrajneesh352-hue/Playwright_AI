import dotenv from 'dotenv';
import { test as base, expect } from '@playwright/test';
import { AccountPage } from '../pages/AccountPage';
import { AdminPage } from '../pages/AdminPage';
import { CartPage } from '../pages/CartPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { LogoutPage } from '../pages/LogoutPage';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';

dotenv.config();

const APP_URL = process.env.WEB_APP_URL;

type PageFixtures = {
    adminPage: AdminPage;
    homePage: HomePage;
    loginPage: LoginPage;
    registerPage: RegisterPage;
    accountPage: AccountPage;
    searchResultsPage: SearchResultsPage;
    productPage: ProductPage;
    cartPage: CartPage;
    logoutPage: LogoutPage;
};

export const test = base.extend<PageFixtures>({
    adminPage: async ({ page }, use) => {
        await use(new AdminPage(page));
    },
    homePage: async ({ page }, use) => {
        if (!APP_URL) {
            throw new Error('WEB_APP_URL must be set to open the OpenCart application.');
        }
        await page.goto(APP_URL);
        await use(new HomePage(page));
    },
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    },
    accountPage: async ({ page }, use) => {
        await use(new AccountPage(page));
    },
    searchResultsPage: async ({ page }, use) => {
        await use(new SearchResultsPage(page));
    },
    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    logoutPage: async ({ page }, use) => {
        await use(new LogoutPage(page));
    },
});

test.afterEach(async ({ page, context }) => {
    if (!page.isClosed()) {
        await page.close();
    }
    await context.close();
});

export { expect } from '@playwright/test';

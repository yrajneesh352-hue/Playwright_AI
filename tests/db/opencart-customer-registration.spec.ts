import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { executeQuery } from '../../utils/dbClient';
import type { RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

type CustomerRow = RowDataPacket & {
    firstname: string;
    lastname: string;
    email: string;
    status: number;
    date_added?: Date | string;
};

type ColumnRow = RowDataPacket & {
    Field: string;
};

test('Register customer and verify Admin and database records @master @regression @end-to-end @db @web', async ({
    homePage,
    registerPage,
    accountPage,
    adminPage,
    page,
}) => {
    const email = RandomDataUtil.getEmail().replace('@', `-${Date.now()}@`);
    const registrationDetails = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email,
        telephone: RandomDataUtil.getPhoneNumber(),
        password: RandomDataUtil.getPassword(),
    };
    const webAppUrl = process.env.WEB_APP_URL;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!webAppUrl) {
        throw new Error('WEB_APP_URL must be set to open the OpenCart application.');
    }
    if (!adminUsername || !adminPassword) {
        throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set to validate the customer in Admin.');
    }
    const adminUrl = process.env.ADMIN_APP_URL ||
        new URL('admin/', `${webAppUrl.replace(/\/+$/, '')}/`).toString();

    await test.step('Verify Admin and MySQL are reachable before creating test data', async () => {
        const databaseCheck = await executeQuery<(RowDataPacket & { ready: number })[]>(
            'SELECT 1 AS ready',
        );
        expect(databaseCheck[0]?.ready, 'The configured MySQL database should be reachable.')
            .toBe(1);

        await adminPage.login(adminUrl, adminUsername, adminPassword);
        await page.goto(webAppUrl);
    });

    await test.step('Register a unique customer through the storefront', async () => {
        await homePage.clickMyAccount();
        await homePage.clickRegister();
        expect(await registerPage.isRegistrationPageExists(), 'The registration form should be displayed.')
            .toBeTruthy();

        await registerPage.completeRegistration(registrationDetails);
        expect(
            await registerPage.isAccountCreatedConfirmationVisible(),
            'The storefront should confirm that the account was created.'
        ).toBeTruthy();

        await registerPage.clickContinue();
        expect(await accountPage.isMyAccountPageExists(), 'The new customer should reach My Account.')
            .toBeTruthy();
    });

    await test.step('Verify the customer in the Admin portal', async () => {
        await adminPage.login(adminUrl, adminUsername, adminPassword);
        await adminPage.searchCustomerByEmail(email);

        expect(await adminPage.customerExists(email), 'The registered email should appear in Admin Customers.')
            .toBeTruthy();
        expect(await adminPage.getCustomerListStatus(email), 'A newly registered customer should be enabled.')
            .toBe('Enabled');

        const adminCustomer = await adminPage.openCustomerDetails(email);
        expect(adminCustomer.firstName, 'Admin should show the registered first name.')
            .toBe(registrationDetails.firstName);
        expect(adminCustomer.lastName, 'Admin should show the registered last name.')
            .toBe(registrationDetails.lastName);
        expect(adminCustomer.email, 'Admin should show the registered email.')
            .toBe(registrationDetails.email);
        expect(adminCustomer.status, 'The Admin customer status should be enabled.')
            .toBe('1');
    });

    await test.step('Verify the same customer in the MySQL customer table', async () => {
        const dateAddedColumns = await executeQuery<ColumnRow[]>(
            'SHOW COLUMNS FROM oc_customer LIKE ?',
            ['date_added'],
        );
        const dateAddedColumnExists = dateAddedColumns.length > 0;
        const dateAddedField = dateAddedColumnExists ? ', date_added' : '';
        const customerRows = await executeQuery<CustomerRow[]>(
            `SELECT firstname, lastname, email, status${dateAddedField} FROM oc_customer WHERE email = ?`,
            [registrationDetails.email],
        );

        try {
            expect(customerRows, 'Exactly one database customer should match the generated email.')
                .toHaveLength(1);
            const [customer] = customerRows;
            expect(customer.firstname, 'The database first name should match the registration.')
                .toBe(registrationDetails.firstName);
            expect(customer.lastname, 'The database last name should match the registration.')
                .toBe(registrationDetails.lastName);
            expect(customer.email, 'The database email should match the registration.')
                .toBe(registrationDetails.email);
            expect(customer.status, 'A newly registered customer should have enabled status in the database.')
                .toBe(1);
            if (dateAddedColumnExists) {
                expect(customer.date_added, 'The date_added column should contain a registration timestamp.')
                    .toBeTruthy();
            }
        } finally {
            if (customerRows.length > 0) {
                await executeQuery('DELETE FROM oc_customer WHERE email = ?', [registrationDetails.email]);
            }
        }
    });
});

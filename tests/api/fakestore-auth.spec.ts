import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';

const dotenvValues = dotenv.config().parsed ?? {};

test.describe('FakeStore Authentication API Tests', () => {
    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USERNAME =
        process.env.FAKESTORE_USERNAME ??
        dotenvValues.FAKESTORE_USERNAME ??
        dotenvValues.USERNAME;
    const PASSWORD =
        process.env.FAKESTORE_PASSWORD ??
        dotenvValues.FAKESTORE_PASSWORD ??
        dotenvValues.PASSWORD;

    // ---------------------------------------------------------
    // POST - Authentication
    // ---------------------------------------------------------

    test('POST - Successful login returns a non-empty token @master @sanity @api', async ({ request }) => {
        if (!USERNAME || !PASSWORD) {
            throw new Error(
                'Set FAKESTORE_USERNAME and FAKESTORE_PASSWORD, or configure USERNAME and PASSWORD in .env.',
            );
        }

        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: USERNAME,
                password: PASSWORD,
            },
        });

        expect(response.status(), 'Valid credentials should return HTTP 201.').toBe(201);

        const responseBody: unknown = await response.json();
        expect(responseBody, 'The login response should contain a token string.')
            .toEqual(expect.objectContaining({ token: expect.any(String) }));

        const token = (responseBody as { token: string }).token;
        expect(token.trim().length, 'The authentication token should not be empty.').toBeGreaterThan(0);
    });

    test('POST - Invalid login returns an authentication error @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: 'invalid-user',
                password: 'invalid-password',
            },
        });

        expect(response.status(), 'Invalid credentials should return HTTP 401.').toBe(401);

        const errorMessage = await response.text();
        expect(errorMessage, 'The response should contain the expected authentication error.')
            .toBe('username or password is incorrect');
    });

    test('POST - Missing login credentials are rejected @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {},
        });

        expect(response.status(), 'Missing credentials should return HTTP 400.').toBe(400);
        expect(await response.text(), 'The response should explain which credentials are required.')
            .toBe('username and password are not provided in JSON format');
    });
});

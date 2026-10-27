import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import userSchema from '../../api/schemas/user_api_schema.json';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

type User = {
    id: number;
    email: string;
    username: string;
    password: string;
    name: {
        firstname: string;
        lastname: string;
    };
    address: {
        geolocation: {
            lat: string;
            long: string;
        };
        city: string;
        street: string;
        number: number;
        zipcode: string;
    };
    phone: string;
};

type UserPayload = Omit<User, 'id'>;

test.describe('FakeStore Users API Tests', () => {
    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USER_ID = 1;
    const USER_LIMIT = 5;
    const userData: UserPayload = {
        email: 'playwright.api.user@example.com',
        username: 'playwright-api-user',
        password: 'test-password-123',
        name: {
            firstname: 'Playwright',
            lastname: 'Tester',
        },
        address: {
            geolocation: {
                lat: '-37.3159',
                long: '81.1496',
            },
            city: 'Test City',
            street: 'Test Street',
            number: 123,
            zipcode: '12345-6789',
        },
        phone: '1-234-567-8901',
    };
    const updatedUserData: UserPayload = {
        ...userData,
        username: 'playwright-api-user-updated',
        name: {
            firstname: 'Updated',
            lastname: 'Tester',
        },
    };

    test('GET - All Users @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);

        expect(response.status(), 'The users endpoint should return HTTP 200.').toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The users response should be an array.').toBeTruthy();
        expect((responseBody as User[]).length, 'The users response should not be empty.')
            .toBeGreaterThan(0);
    });

    test('GET - User by ID @master @sanity @api', async ({ request }) => {
        const userRoute = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${userRoute}`);

        expect(response.status(), `User ${USER_ID} should be returned with HTTP 200.`).toBe(200);

        const user: User = await response.json();
        expect(user.id, 'The returned user ID should match the requested ID.').toBe(USER_ID);
    });

    test('GET - Users with Limit @master @sanity @api', async ({ request }) => {
        const usersRoute = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(USER_LIMIT));
        const response = await request.get(`${BASE_URL}${usersRoute}`);

        expect(response.status(), 'The users limit endpoint should return HTTP 200.').toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The limited users response should be an array.').toBeTruthy();
        expect((responseBody as User[]).length, `The response should contain exactly ${USER_LIMIT} users.`)
            .toBe(USER_LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Users sorted ${order} @master @sanity @api`, async ({ request }) => {
            const usersRoute = Routes.GET_USERS_SORTED.replace('{order}', order);
            const response = await request.get(`${BASE_URL}${usersRoute}`);

            expect(response.status(), `The ${order} users endpoint should return HTTP 200.`).toBe(200);

            const responseBody: unknown = await response.json();
            expect(Array.isArray(responseBody), 'The sorted users response should be an array.')
                .toBeTruthy();

            const users = responseBody as User[];
            expect(users.length, 'The sorted users response should not be empty.').toBeGreaterThan(0);
            const userIds = users.map((user) => user.id);
            const sortedIds = [...userIds].sort((firstId, secondId) =>
                order === 'asc' ? firstId - secondId : secondId - firstId
            );
            expect(userIds, `User IDs should follow ${order}ending order.`).toEqual(sortedIds);
        });
    }

    test('POST - Create User @master @sanity @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
            data: userData,
        });

        expect(response.status(), 'Creating a user should return HTTP 201.').toBe(201);

        const createdUser: User = await response.json();
        expect(createdUser.id, 'The created user should include a numeric ID.')
            .toEqual(expect.any(Number));
    });

    test('PUT - Update User @master @sanity @api', async ({ request }) => {
        const userRoute = Routes.UPDATE_USER.replace('{id}', String(USER_ID));
        const response = await request.put(`${BASE_URL}${userRoute}`, {
            data: updatedUserData,
        });

        expect(response.status(), 'Updating a user should return HTTP 200.').toBe(200);

        const updatedUser: UserPayload = await response.json();
        expect(updatedUser, 'The response should contain the updated user information.')
            .toMatchObject(updatedUserData);
    });

    test('DELETE - User @master @regression @api', async ({ request }) => {
        const userRoute = Routes.DELETE_USER.replace('{id}', String(USER_ID));
        const response = await request.delete(`${BASE_URL}${userRoute}`);

        expect(response.status(), 'Deleting a user should return HTTP 200.').toBe(200);

        const deletedUser: unknown = await response.json();
        expect(deletedUser, 'The delete response should describe the deleted user.')
            .toEqual(expect.objectContaining({ id: USER_ID }));
    });

    test('User response schema @master @sanity @api', async ({ request }) => {
        const userRoute = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${userRoute}`);
        expect(response.status(), `User ${USER_ID} schema response should return HTTP 200.`).toBe(200);

        const userResponse: unknown = await response.json();
        const validate = new Ajv().compile(userSchema);
        const valid = validate(userResponse);
        expect(valid, `User response should match its schema: ${JSON.stringify(validate.errors)}`)
            .toBe(true);
    });

    test('User CRUD workflow @master @regression @api', async ({ request }) => {
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
            data: userData,
        });
        expect(createResponse.status(), 'User creation in the workflow should return HTTP 201.')
            .toBe(201);

        const createdUser: User = await createResponse.json();
        expect(createdUser.id, 'The create response should provide an ID for subsequent requests.')
            .toEqual(expect.any(Number));

        const userRoute = Routes.UPDATE_USER.replace('{id}', String(createdUser.id));
        const updateResponse = await request.put(`${BASE_URL}${userRoute}`, {
            data: updatedUserData,
        });
        expect(updateResponse.status(), 'User update in the workflow should return HTTP 200.')
            .toBe(200);

        const updatedUser: UserPayload = await updateResponse.json();
        expect(updatedUser).toMatchObject(updatedUserData);

        const deleteRoute = Routes.DELETE_USER.replace('{id}', String(createdUser.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'User deletion in the workflow should return HTTP 200.')
            .toBe(200);
    });
});

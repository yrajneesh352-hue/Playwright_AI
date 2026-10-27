import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import cartSchema from '../../api/schemas/cart_api_schema.json';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

type CartProduct = {
    productId: number;
    quantity: number;
};

type Cart = {
    id: number;
    userId: number;
    date: string;
    products: CartProduct[];
};

type CartPayload = Omit<Cart, 'id'>;

test.describe('FakeStore Carts API Tests', () => {
    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const CART_ID = 1;
    const USER_ID = 1;
    const CART_LIMIT = 5;
    const CART_START_DATE = '2019-01-01';
    const CART_END_DATE = '2030-12-31';
    const cartData: CartPayload = {
        userId: USER_ID,
        date: '2026-10-25',
        products: [{ productId: 1, quantity: 1 }],
    };
    const updatedCartData: CartPayload = {
        ...cartData,
        products: [{ productId: 1, quantity: 2 }],
    };

    test('GET - All Carts @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);

        expect(response.status(), 'The carts endpoint should return HTTP 200.').toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The carts response should be an array.').toBeTruthy();
        expect((responseBody as Cart[]).length, 'The carts response should not be empty.')
            .toBeGreaterThan(0);
    });

    test('GET - Cart by ID @master @sanity @api', async ({ request }) => {
        const cartRoute = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
        const response = await request.get(`${BASE_URL}${cartRoute}`);

        expect(response.status(), `Cart ${CART_ID} should be returned with HTTP 200.`).toBe(200);

        const cart: Cart = await response.json();
        expect(cart.id, 'The returned cart ID should match the requested ID.').toBe(CART_ID);
    });

    test('GET - Carts by Date Range @master @sanity @api', async ({ request }) => {
        const cartsRoute = Routes.GET_CARTS_BY_DATE_RANGE
            .replace('{startdate}', encodeURIComponent(CART_START_DATE))
            .replace('{enddate}', encodeURIComponent(CART_END_DATE));
        const response = await request.get(`${BASE_URL}${cartsRoute}`);

        expect(response.status(), 'The carts date range endpoint should return HTTP 200.').toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The date-filtered carts response should be an array.')
            .toBeTruthy();

        const carts = responseBody as Cart[];
        expect(carts.length, 'The date range should include at least one cart.')
            .toBeGreaterThan(0);
        for (const [index, cart] of carts.entries()) {
            const date = new Date(cart.date).getTime();
            expect(Number.isNaN(date), `Cart at index ${index} should have a valid date.`).toBe(false);
            expect(date, `Cart at index ${index} should be on or after the range start.`)
                .toBeGreaterThanOrEqual(new Date(CART_START_DATE).getTime());
            expect(date, `Cart at index ${index} should be on or before the range end.`)
                .toBeLessThanOrEqual(new Date(`${CART_END_DATE}T23:59:59.999Z`).getTime());
        }
    });

    test('GET - Carts by User @master @sanity @api', async ({ request }) => {
        const cartsRoute = Routes.GET_USER_CART.replace('{userId}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${cartsRoute}`);

        expect(response.status(), `Carts for user ${USER_ID} should return HTTP 200.`).toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The user carts response should be an array.').toBeTruthy();

        const carts = responseBody as Cart[];
        expect(carts.length, `User ${USER_ID} should have at least one cart.`).toBeGreaterThan(0);
        for (const [index, cart] of carts.entries()) {
            expect(cart.userId, `Cart at index ${index} should belong to user ${USER_ID}.`)
                .toBe(USER_ID);
        }
    });

    test('GET - Carts with Limit @master @sanity @api', async ({ request }) => {
        const cartsRoute = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(CART_LIMIT));
        const response = await request.get(`${BASE_URL}${cartsRoute}`);

        expect(response.status(), 'The carts limit endpoint should return HTTP 200.').toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The limited carts response should be an array.')
            .toBeTruthy();
        expect((responseBody as Cart[]).length, `The response should contain exactly ${CART_LIMIT} carts.`)
            .toBe(CART_LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Carts sorted ${order} @master @sanity @api`, async ({ request }) => {
            const cartsRoute = Routes.GET_CARTS_SORTED.replace('{order}', order);
            const response = await request.get(`${BASE_URL}${cartsRoute}`);

            expect(response.status(), `The ${order} carts endpoint should return HTTP 200.`).toBe(200);

            const responseBody: unknown = await response.json();
            expect(Array.isArray(responseBody), 'The sorted carts response should be an array.')
                .toBeTruthy();

            const carts = responseBody as Cart[];
            expect(carts.length, 'The sorted carts response should not be empty.').toBeGreaterThan(0);
            const cartIds = carts.map((cart) => cart.id);
            const sortedIds = [...cartIds].sort((firstId, secondId) =>
                order === 'asc' ? firstId - secondId : secondId - firstId
            );
            expect(cartIds, `Cart IDs should follow ${order}ending order.`).toEqual(sortedIds);
        });
    }

    test('POST - Create Cart @master @sanity @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
            data: cartData,
        });

        expect(response.status(), 'Creating a cart should return HTTP 201.').toBe(201);

        const createdCart: Cart = await response.json();
        expect(createdCart.id, 'The created cart should include a numeric ID.')
            .toEqual(expect.any(Number));
        expect(createdCart.userId).toBe(cartData.userId);
        expect(createdCart.products).toEqual(cartData.products);
    });

    test('PUT - Update Cart @master @sanity @api', async ({ request }) => {
        const cartRoute = Routes.UPDATE_CART.replace('{id}', String(CART_ID));
        const response = await request.put(`${BASE_URL}${cartRoute}`, {
            data: updatedCartData,
        });

        expect(response.status(), 'Updating a cart should return HTTP 200.').toBe(200);

        const updatedCart: Cart = await response.json();
        expect(updatedCart.id, 'The updated cart ID should match the requested ID.').toBe(CART_ID);
        expect(updatedCart.products, 'The response should reflect the updated product quantity.')
            .toEqual(updatedCartData.products);
    });

    test('DELETE - Cart @master @regression @api', async ({ request }) => {
        const cartRoute = Routes.DELETE_CART.replace('{id}', String(CART_ID));
        const response = await request.delete(`${BASE_URL}${cartRoute}`);

        expect(response.status(), 'Deleting a cart should return HTTP 200.').toBe(200);

        const deletedCart: unknown = await response.json();
        expect(deletedCart, 'The delete response should describe the deleted cart.')
            .toEqual(expect.objectContaining({ id: CART_ID }));
    });

    test('Cart response schema @master @sanity @api', async ({ request }) => {
        const cartRoute = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
        const response = await request.get(`${BASE_URL}${cartRoute}`);
        expect(response.status(), `Cart ${CART_ID} schema response should return HTTP 200.`).toBe(200);

        const cartResponse: unknown = await response.json();
        const validate = new Ajv().compile(cartSchema);
        const valid = validate(cartResponse);
        expect(valid, `Cart response should match its schema: ${JSON.stringify(validate.errors)}`)
            .toBe(true);
    });

    test('Cart CRUD workflow @master @regression @api', async ({ request }) => {
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
            data: cartData,
        });
        expect(createResponse.status(), 'Cart creation in the workflow should return HTTP 201.')
            .toBe(201);

        const createdCart: Cart = await createResponse.json();
        expect(createdCart.id, 'The create response should provide an ID for subsequent requests.')
            .toEqual(expect.any(Number));
        expect(createdCart.userId).toBe(cartData.userId);
        expect(createdCart.products).toEqual(cartData.products);

        const cartRoute = Routes.UPDATE_CART.replace('{id}', String(createdCart.id));
        const updateResponse = await request.put(`${BASE_URL}${cartRoute}`, {
            data: updatedCartData,
        });
        expect(updateResponse.status(), 'Cart update in the workflow should return HTTP 200.')
            .toBe(200);

        const updatedCart: Cart = await updateResponse.json();
        expect(updatedCart.id, 'The workflow update should use the ID returned by create.')
            .toBe(createdCart.id);
        expect(updatedCart.products, 'The workflow should preserve the updated quantity.')
            .toEqual(updatedCartData.products);

        const deleteRoute = Routes.DELETE_CART.replace('{id}', String(createdCart.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'Cart deletion in the workflow should return HTTP 200.')
            .toBe(200);
    });
});

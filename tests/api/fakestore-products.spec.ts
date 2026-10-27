import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

type Product = {
    id: number;
    title: string;
    price: number;
    category: string;
    image: string;
};

test.describe('FakeStore Products API Tests', () => {
    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const PRODUCT_ID = 1;
    const PRODUCT_LIMIT = 5;
    const PRODUCT_CATEGORY = 'electronics';

    // ---------------------------------------------------------
    // GET - All Products
    // ---------------------------------------------------------

    test('GET - All Products @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);

        expect(response.status(), 'The products endpoint should return HTTP 200.').toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The products response should be an array.').toBeTruthy();

        const products = responseBody as Product[];
        expect(products.length, 'The products response should contain at least one product.')
            .toBeGreaterThan(0);

        for (const [index, product] of products.entries()) {
            expect(product.id, `Product at index ${index} should have a numeric ID.`).toEqual(expect.any(Number));
            expect(product.title, `Product at index ${index} should have a title.`).toEqual(expect.any(String));
            expect(product.price, `Product at index ${index} should have a numeric price.`).toEqual(expect.any(Number));
            expect(product.category, `Product at index ${index} should have a category.`).toEqual(expect.any(String));
            expect(product.image, `Product at index ${index} should have an image URL.`).toEqual(expect.any(String));
        }
    });

    test('GET - Product by ID @master @sanity @api', async ({ request }) => {
        const productRoute = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
        const response = await request.get(`${BASE_URL}${productRoute}`);

        expect(response.status(), `Product ${PRODUCT_ID} should be returned with HTTP 200.`).toBe(200);

        const product: Product = await response.json();
        expect(product.id, 'The returned product ID should match the requested ID.').toBe(PRODUCT_ID);
        expect(product.title, 'The product should have a non-empty title.')
            .toEqual(expect.any(String));
        expect(product.title.trim().length, 'The product title should not be empty.').toBeGreaterThan(0);
        expect(product.price, 'The product price should be numeric.').toEqual(expect.any(Number));
        expect(product.category, 'The product should have a category.')
            .toEqual(expect.any(String));
        expect(product.category.trim().length, 'The product category should not be empty.').toBeGreaterThan(0);
        expect(product.image, 'The product should have an image URL.')
            .toEqual(expect.any(String));
        expect(product.image.trim().length, 'The product image URL should not be empty.').toBeGreaterThan(0);
    });

    test('GET - Products with Limit @master @sanity @api', async ({ request }) => {
        const productsRoute = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(PRODUCT_LIMIT));
        const response = await request.get(`${BASE_URL}${productsRoute}`);

        expect(response.status(), 'The products limit endpoint should return HTTP 200.').toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The limited products response should be an array.').toBeTruthy();

        const products = responseBody as Product[];
        expect(products.length, `The response should contain exactly ${PRODUCT_LIMIT} products.`)
            .toBe(PRODUCT_LIMIT);
    });

    test('GET - Products sorted ascending @master @sanity @api', async ({ request }) => {
        const productsRoute = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'asc');
        const response = await request.get(`${BASE_URL}${productsRoute}`);

        expect(response.status(), 'The sorted products endpoint should return HTTP 200.').toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The sorted products response should be an array.').toBeTruthy();

        const products = responseBody as Product[];
        expect(products.length, 'The sorted products response should not be empty.').toBeGreaterThan(0);

        const productIds = products.map((product) => product.id);
        const ascendingProductIds = [...productIds].sort((firstId, secondId) => firstId - secondId);
        expect(productIds, 'Product IDs should be ordered from lowest to highest.')
            .toEqual(ascendingProductIds);
    });

    test('GET - Products sorted descending @master @sanity @api', async ({ request }) => {
        const productsRoute = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'desc');
        const response = await request.get(`${BASE_URL}${productsRoute}`);

        expect(response.status(), 'The sorted products endpoint should return HTTP 200.').toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The sorted products response should be an array.').toBeTruthy();

        const products = responseBody as Product[];
        expect(products.length, 'The sorted products response should not be empty.').toBeGreaterThan(0);

        const productIds = products.map((product) => product.id);
        const descendingProductIds = [...productIds].sort((firstId, secondId) => secondId - firstId);
        expect(productIds, 'Product IDs should be ordered from highest to lowest.')
            .toEqual(descendingProductIds);
    });

    test('GET - All Product Categories @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);

        expect(response.status(), 'The product categories endpoint should return HTTP 200.').toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The product categories response should be an array.').toBeTruthy();

        const categories = responseBody as string[];
        expect(categories.length, 'The product categories response should not be empty.').toBeGreaterThan(0);
    });

    test('GET - Products by Category @master @sanity @api', async ({ request }) => {
        const productsRoute = Routes.GET_PRODUCTS_BY_CATEGORY.replace(
            '{category}',
            encodeURIComponent(PRODUCT_CATEGORY)
        );
        const response = await request.get(`${BASE_URL}${productsRoute}`);

        expect(response.status(), `Products in ${PRODUCT_CATEGORY} should be returned with HTTP 200.`)
            .toBe(200);

        const responseBody: unknown = await response.json();
        expect(Array.isArray(responseBody), 'The category products response should be an array.').toBeTruthy();

        const products = responseBody as Product[];
        expect(products.length, `The response should contain products in ${PRODUCT_CATEGORY}.`)
            .toBeGreaterThan(0);
        for (const [index, product] of products.entries()) {
            expect(
                product.category,
                `Product at index ${index} should belong to the ${PRODUCT_CATEGORY} category.`
            ).toBe(PRODUCT_CATEGORY);
        }
    });
});

import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import productSchema from '../../api/schemas/product_api_schema.json';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

type ProductPayload = {
    title: string;
    price: number;
    description: string;
    image: string;
    category: string;
};

type ProductResponse = ProductPayload & {
    id: number;
};

test.describe('FakeStore Product CRUD API Tests', () => {
    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const PRODUCT_ID = 1;
    const productData: ProductPayload = {
        title: 'Playwright API Test Product',
        price: 29.99,
        description: 'A deterministic product for API test coverage.',
        image: 'https://i.pravatar.cc',
        category: 'electronics',
    };
    const updatedProductData: ProductPayload = {
        ...productData,
        title: 'Updated Playwright API Test Product',
        price: 34.99,
    };

    test('POST - Create Product @master @sanity @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
            data: productData,
        });

        expect(response.status(), 'Creating a product should return HTTP 201.').toBe(201);

        const createdProduct: ProductResponse = await response.json();
        expect(createdProduct.id, 'The created product should include a numeric ID.')
            .toEqual(expect.any(Number));
        expect(createdProduct).toMatchObject(productData);
    });

    test('PUT - Update Product @master @sanity @api', async ({ request }) => {
        const productRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(PRODUCT_ID));
        const response = await request.put(`${BASE_URL}${productRoute}`, {
            data: updatedProductData,
        });

        expect(response.status(), 'Updating a product should return HTTP 200.').toBe(200);

        const updatedProduct: ProductResponse = await response.json();
        expect(updatedProduct.id, 'The updated product ID should match the requested ID.')
            .toBe(PRODUCT_ID);
        expect(updatedProduct, 'The response should contain the updated product information.')
            .toMatchObject(updatedProductData);
    });

    test('DELETE - Product @master @regression @api', async ({ request }) => {
        const productRoute = Routes.DELETE_PRODUCT.replace('{id}', String(PRODUCT_ID));
        const response = await request.delete(`${BASE_URL}${productRoute}`);

        expect(response.status(), 'Deleting a product should return HTTP 200.').toBe(200);

        const deletedProduct: unknown = await response.json();
        expect(deletedProduct, 'The delete response should describe the deleted product.')
            .toEqual(expect.objectContaining({ id: PRODUCT_ID }));
    });

    test('Product response schema @master @sanity @api', async ({ request }) => {
        const productRoute = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
        const response = await request.get(`${BASE_URL}${productRoute}`);
        expect(response.status(), `Product ${PRODUCT_ID} schema response should return HTTP 200.`)
            .toBe(200);

        const productResponse: unknown = await response.json();
        const validate = new Ajv().compile(productSchema);
        const valid = validate(productResponse);
        expect(valid, `Product response should match its schema: ${JSON.stringify(validate.errors)}`)
            .toBe(true);
    });

    test('Product CRUD workflow @master @regression @api', async ({ request }) => {
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
            data: productData,
        });
        expect(createResponse.status(), 'Product creation in the workflow should return HTTP 201.')
            .toBe(201);

        const createdProduct: ProductResponse = await createResponse.json();
        expect(createdProduct.id, 'The create response should provide an ID for subsequent requests.')
            .toEqual(expect.any(Number));

        const productRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(createdProduct.id));
        const updateResponse = await request.put(`${BASE_URL}${productRoute}`, {
            data: updatedProductData,
        });
        expect(updateResponse.status(), 'Product update in the workflow should return HTTP 200.')
            .toBe(200);

        const updatedProduct: ProductResponse = await updateResponse.json();
        expect(updatedProduct.id, 'The workflow update should use the ID returned by create.')
            .toBe(createdProduct.id);
        expect(updatedProduct).toMatchObject(updatedProductData);

        const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(createdProduct.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'Product deletion in the workflow should return HTTP 200.')
            .toBe(200);
    });
});

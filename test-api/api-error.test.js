const request = require('supertest');
const app = require('../server');

jest.mock('../contractClient', () => {
    const contractMock = {
        getPackage: jest.fn().mockRejectedValue(new Error("Contract failure")),
        getPackageHistory: jest.fn().mockRejectedValue(new Error("Contract failure")),
        getPackageLastStatus: jest.fn().mockRejectedValue(new Error("Contract failure")),
        owner: jest.fn().mockRejectedValue(new Error("Contract failure")),
        createPackage: jest.fn().mockRejectedValue(new Error("Contract failure")),
        updatePackageStatus: jest.fn().mockRejectedValue(new Error("Contract failure"))
    };
    return jest.fn(() => contractMock);
});

describe('API Blockchain REST - Error handling tests', () => {
    it('GET /package/:id -> 500', async () => {
        const res = await request(app).get('/package/1');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });

    it('GET /package/:id/history -> 500', async () => {
        const res = await request(app).get('/package/1/history');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });

    it('GET /package/:id/last -> 500', async () => {
        const res = await request(app).get('/package/1/last');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });

    it('GET /owner -> 500', async () => {
        const res = await request(app).get('/owner');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });

    it('POST /package -> 500', async () => {
        const res = await request(app)
            .post('/package')
            .send({ id: '1', origin: 'Madrid', destination: 'Barcelona' });
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });

    it('PUT /package/:id/status -> 500', async () => {
        const res = await request(app)
            .put('/package/1/status')
            .send({ status: 'DELIVERED', location: 'Barcelona' });
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

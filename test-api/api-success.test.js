
const request = require('supertest');
const app = require('../server');

jest.mock('../contractClient', () => ({
    getPackage: jest.fn().mockResolvedValue(['1', 'Madrid', 'Barcelona']),
    getPackageHistory: jest.fn().mockResolvedValue([
        { status: 'CREATED', location: 'Madrid', timestamp: 1717000000 },
        { status: 'IN_TRANSIT', location: 'Zaragoza', timestamp: 1717003600 },
        { status: 'DELIVERED', location: 'Barcelona', timestamp: 1717010000 }
    ]),
    getPackageLastStatus: jest.fn().mockResolvedValue(['DELIVERED', 'Barcelona', 1717010000]),
    owner: jest.fn().mockResolvedValue('0xMockOwnerAddress'),
    createPackage: jest.fn().mockResolvedValue({
        hash: '0xmockhashcreate',
        wait: jest.fn().mockResolvedValue({})
    }),
    updatePackageStatus: jest.fn().mockResolvedValue({
        hash: '0xmockhashupdate',
        wait: jest.fn().mockResolvedValue({})
    })
}));

const contract = require('../contractClient');

describe('API Blockchain REST - Contract interactions', () => {

    it('GET /package/:id', async () => {
        const res = await request(app).get('/package/1');
        expect(contract.getPackage).toHaveBeenCalledWith('1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: '1',
            origin: 'Madrid',
            destination: 'Barcelona',
        });
    });

    it('GET /package/:id/history', async () => {
        const res = await request(app).get('/package/1/history');
        expect(contract.getPackageHistory).toHaveBeenCalledWith('1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: '1',
            history: [
                { status: 'CREATED', location: 'Madrid', timestamp: '1717000000' },
                { status: 'IN_TRANSIT', location: 'Zaragoza', timestamp: '1717003600' },
                { status: 'DELIVERED', location: 'Barcelona', timestamp: '1717010000' }
            ]
        });
    });

    it('GET /package/:id/last', async () => {
        const res = await request(app).get('/package/1/last');
        expect(contract.getPackageLastStatus).toHaveBeenCalledWith('1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: '1',
            status: 'DELIVERED',
            location: 'Barcelona',
            timestamp: '1717010000'
        });
    });

    it('GET /owner', async () => {
        const res = await request(app).get('/owner');
        expect(contract.owner).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ owner: '0xMockOwnerAddress' });
    });

    it('POST /package', async () => {
        const res = await request(app)
            .post('/package')
            .send({ id: '1', origin: 'Madrid', destination: 'Barcelona' });
        expect(contract.createPackage).toHaveBeenCalledWith('1', 'Madrid', 'Barcelona');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            message: 'Package created successfully',
            txHash: '0xmockhashcreate'
        });
    });

    it('PUT /package/:id/status - ok', async () => {
        const res = await request(app)
            .put('/package/1/status')
            .send({ status: 'DELIVERED', location: 'Barcelona' });
        expect(contract.updatePackageStatus).toHaveBeenCalledWith('1', 'DELIVERED', 'Barcelona');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            message: 'Package status updated',
            txHash: '0xmockhashupdate'
        });
    });

    it('PUT /package/:id/status - error 400', async () => {
        const res = await request(app)
            .put('/package/1/status')
            .send({ status: '', location: '' });
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: 'Status and location are required.' });
    });
});

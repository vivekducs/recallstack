// backend/tests/health.test.js
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

jest.mock('../src/config/database', () => ({
  $queryRaw: jest.fn()
}));

describe('GET /api/health', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 ok and connected state when database is online', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([1]);

    const res = await request(app).get('/api/health');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('database', 'connected');
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should return 503 error and disconnected state when database check fails', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('Connection error'));

    const res = await request(app).get('/api/health');
    
    expect(res.statusCode).toEqual(503);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('database', 'disconnected');
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});

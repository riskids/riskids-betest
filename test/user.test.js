const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const AccountLogin = require('../src/models/AccountLogin');
const { CacheService } = require('../src/services/cacheService');

// Mock all dependencies
jest.mock('../src/models/User');
jest.mock('../src/models/AccountLogin');
jest.mock('../src/services/cacheService');

describe('API Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Setup mock data
    const mockUser = {
      userId: 'user123',
      fullName: 'John Doe',
      accountNumber: '123456',
      emailAddress: 'john@example.com',
      registrationNumber: '987654321'
    };

    const mockAccountLogin = {
      accountId: 'acc123',
      userName: 'johndoe',
      password: 'hashedpassword',
      userId: 'user123',
      lastLoginDateTime: new Date()
    };

    // Mock implementations
    User.findOne.mockImplementation(async (query) => {
      if (query.accountNumber === '123456') return mockUser;
      if (query.registrationNumber === '987654321') return mockUser;
      if (query.userId === 'user123') return mockUser;
      return null;
    });

    AccountLogin.findOne.mockImplementation(async (query) => {
      if (query.userName === 'johndoe') return mockAccountLogin;
      return null;
    });

    CacheService.getByAccountNumber.mockResolvedValue(null);
    CacheService.getByRegistrationNumber.mockResolvedValue(null);
    CacheService.cacheUser.mockResolvedValue(true);

    // Get auth token for tests
    const loginRes = await request(app)
      .post('/api/login')
      .send({ userName: 'johndoe', password: 'password' });
    
    authToken = loginRes.body.data.token;
  });

  describe('Authentication', () => {
    test('POST /api/login - should authenticate user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ userName: 'johndoe', password: 'password' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
    });

    test('POST /api/logout - should logout user', async () => {
      const res = await request(app)
        .post('/api/logout')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('User Operations', () => {
    test('POST /api/users - should create new user', async () => {
      const newUser = {
        fullName: 'Jane Smith',
        accountNumber: '654321',
        emailAddress: 'jane@example.com',
        registrationNumber: '123456789',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/users')
        .send(newUser);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toBeDefined();
    });

    test('GET /api/users/account/:accountNumber - should get user by account number', async () => {
      const res = await request(app)
        .get('/api/users/account/123456')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.accountNumber).toBe('123456');
    });

    test('GET /api/users/registration/:registrationNumber - should get user by registration number', async () => {
      const res = await request(app)
        .get('/api/users/registration/987654321')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.registrationNumber).toBe('987654321');
    });

    test('GET /api/users/inactive - should get inactive accounts', async () => {
      const res = await request(app)
        .get('/api/users/inactive')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.accounts)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should return 401 for unauthorized access', async () => {
      const res = await request(app)
        .get('/api/users/account/123456');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    test('should return 404 for not found', async () => {
      const res = await request(app)
        .get('/api/users/account/000000')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });
  });
});

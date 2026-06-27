const request = require('supertest');
const app = require('../../server');
const User = require('../models/User');

// 测试用户认证相关API
describe('Auth API', () => {
  // 测试注册功能
  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('注册成功');
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('应该返回错误如果用户名已存在', async () => {
      // 先注册一个用户
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User'
        });

      // 再次尝试使用相同的用户名注册
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'new@example.com',
          password: 'password123',
          name: 'New User'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('用户名或邮箱已存在');
    });
  });

  // 测试登录功能
  describe('POST /api/auth/login', () => {
    it('应该成功登录用户', async () => {
      // 先注册一个用户
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123',
          name: 'Login User'
        });

      // 尝试登录
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('应该返回错误如果邮箱或密码错误', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('邮箱或密码错误');
    });
  });

  // 测试获取个人信息功能
  describe('GET /api/auth/profile', () => {
    it('应该成功获取个人信息', async () => {
      // 先注册并登录用户
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'profileuser',
          email: 'profile@example.com',
          password: 'password123',
          name: 'Profile User'
        });

      const token = registerResponse.body.token;

      // 使用token获取个人信息
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('profile@example.com');
    });

    it('应该返回错误如果未授权', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('未授权');
    });
  });
});
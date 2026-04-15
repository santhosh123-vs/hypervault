import request from 'supertest';
import app from '../../src/app';
import '../setup';

describe('POST /users/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    await request(app).post('/users/register').send({ email: 'dup@test.com', password: 'password123' });

    const res = await request(app)
      .post('/users/register')
      .send({ email: 'dup@test.com', password: 'password456' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('already registered');
  });

  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject short password', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ email: 'short@test.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /users/login', () => {
  beforeEach(async () => {
    await request(app).post('/users/register').send({ email: 'login@test.com', password: 'password123' });
  });

  it('should return JWT on valid login', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'login@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe('string');
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'login@test.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-existent user', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

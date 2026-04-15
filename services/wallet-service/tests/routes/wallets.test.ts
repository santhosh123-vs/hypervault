import request from 'supertest';
import { verify, createPublicKey } from 'crypto';
import app from '../../src/app';
import '../setup';

// Helper: register + login, return token
async function getAuthToken(email = 'wallet-user@test.com'): Promise<string> {
  await request(app).post('/users/register').send({ email, password: 'password123' });
  const res = await request(app).post('/users/login').send({ email, password: 'password123' });
  return res.body.data.token;
}

describe('POST /wallets', () => {
  it('should create wallet and return publicKey', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/wallets')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.walletId).toBeDefined();
    expect(res.body.data.publicKey).toMatch(/^[0-9a-f]+$/);
  });

  it('should never return privateKey in response', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/wallets')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.data.privateKey).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('encryptedPrivateKey');
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).post('/wallets');
    expect(res.status).toBe(401);
  });
});

describe('GET /wallets/me', () => {
  it('should return user wallets without encrypted fields', async () => {
    const token = await getAuthToken();
    await request(app).post('/wallets').set('Authorization', `Bearer ${token}`);
    await request(app).post('/wallets').set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/wallets/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);

    // Ensure no sensitive fields leaked
    for (const w of res.body.data) {
      expect(w.encryptedPrivateKey).toBeUndefined();
      expect(w.kdfSalt).toBeUndefined();
      expect(w.publicKey).toBeDefined();
      expect(w.balance).toBe('0');
    }
  });

  it('should return empty array for user with no wallets', async () => {
    const token = await getAuthToken('no-wallets@test.com');
    const res = await request(app)
      .get('/wallets/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /wallets/:walletId/balance', () => {
  it('should return balance for owned wallet', async () => {
    const token = await getAuthToken();
    const createRes = await request(app).post('/wallets').set('Authorization', `Bearer ${token}`);
    const walletId = createRes.body.data.walletId;

    const res = await request(app)
      .get(`/wallets/${walletId}/balance`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.balance).toBe('0');
  });

  it('should reject access to another user wallet', async () => {
    const token1 = await getAuthToken('owner@test.com');
    const token2 = await getAuthToken('intruder@test.com');
    const createRes = await request(app).post('/wallets').set('Authorization', `Bearer ${token1}`);
    const walletId = createRes.body.data.walletId;

    const res = await request(app)
      .get(`/wallets/${walletId}/balance`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
  });

  it('should return 404 for non-existent wallet', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .get('/wallets/000000000000000000000000/balance')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /wallets/:walletId/sign', () => {
  it('should sign a message and return valid signature', async () => {
    const token = await getAuthToken();
    const createRes = await request(app).post('/wallets').set('Authorization', `Bearer ${token}`);
    const { walletId, publicKey } = createRes.body.data;

    const message = 'hello world';
    const res = await request(app)
      .post(`/wallets/${walletId}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.signature).toMatch(/^[0-9a-f]+$/);

    // Verify the signature is cryptographically valid
    const pubKeyDer = Buffer.from(publicKey, 'hex');
    const pubKeyObj = createPublicKey({ key: pubKeyDer, format: 'der', type: 'spki' });
    const isValid = verify(null, Buffer.from(message), pubKeyObj, Buffer.from(res.body.data.signature, 'hex'));
    expect(isValid).toBe(true);
  });

  it('should reject signing for wallet not owned by user', async () => {
    const token1 = await getAuthToken('signer@test.com');
    const token2 = await getAuthToken('thief@test.com');
    const createRes = await request(app).post('/wallets').set('Authorization', `Bearer ${token1}`);
    const walletId = createRes.body.data.walletId;

    const res = await request(app)
      .post(`/wallets/${walletId}/sign`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ message: 'steal' });

    expect(res.status).toBe(403);
  });

  it('should reject empty message', async () => {
    const token = await getAuthToken();
    const createRes = await request(app).post('/wallets').set('Authorization', `Bearer ${token}`);
    const walletId = createRes.body.data.walletId;

    const res = await request(app)
      .post(`/wallets/${walletId}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: '' });

    expect(res.status).toBe(400);
  });
});

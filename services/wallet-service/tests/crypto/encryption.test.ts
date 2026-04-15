import { encrypt, decrypt, generateKdfSalt } from '../../src/crypto/encryption';

const MASTER_KEY = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4';

describe('AES-256-GCM Encryption', () => {
  it('should encrypt and decrypt roundtrip correctly', () => {
    const plaintext = 'hello-private-key-data';
    const salt = generateKdfSalt();
    const encrypted = encrypt(plaintext, MASTER_KEY, salt);
    const decrypted = decrypt(encrypted, MASTER_KEY, salt);
    expect(decrypted).toBe(plaintext);
  });

  it('should return ciphertext, iv, and authTag as hex', () => {
    const salt = generateKdfSalt();
    const result = encrypt('test', MASTER_KEY, salt);
    expect(result.ciphertext).toMatch(/^[0-9a-f]+$/);
    expect(result.iv).toMatch(/^[0-9a-f]+$/);
    expect(result.authTag).toMatch(/^[0-9a-f]+$/);
  });

  it('should generate different IV each call', () => {
    const salt = generateKdfSalt();
    const enc1 = encrypt('same-data', MASTER_KEY, salt);
    const enc2 = encrypt('same-data', MASTER_KEY, salt);
    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });

  it('should fail to decrypt with wrong master key', () => {
    const salt = generateKdfSalt();
    const encrypted = encrypt('secret', MASTER_KEY, salt);
    expect(() => decrypt(encrypted, 'wrong-key-that-is-long-enough!!!', salt)).toThrow();
  });

  it('should fail to decrypt with tampered ciphertext', () => {
    const salt = generateKdfSalt();
    const encrypted = encrypt('secret', MASTER_KEY, salt);
    encrypted.ciphertext = 'ff' + encrypted.ciphertext.slice(2);
    expect(() => decrypt(encrypted, MASTER_KEY, salt)).toThrow();
  });

  it('should fail to decrypt with wrong salt', () => {
    const salt1 = generateKdfSalt();
    const salt2 = generateKdfSalt();
    const encrypted = encrypt('secret', MASTER_KEY, salt1);
    expect(() => decrypt(encrypted, MASTER_KEY, salt2)).toThrow();
  });

  it('should generate 16-byte salt as 32 hex chars', () => {
    const salt = generateKdfSalt();
    expect(salt).toMatch(/^[0-9a-f]{32}$/);
  });
});

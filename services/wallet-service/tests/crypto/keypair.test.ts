import { generateEd25519KeyPair } from '../../src/crypto/keypair';

describe('Ed25519 KeyPair Generation', () => {
  it('should return publicKey and privateKey as hex strings', () => {
    const pair = generateEd25519KeyPair();
    expect(pair.publicKey).toBeDefined();
    expect(pair.privateKey).toBeDefined();
    expect(typeof pair.publicKey).toBe('string');
    expect(typeof pair.privateKey).toBe('string');
    // Hex validation
    expect(pair.publicKey).toMatch(/^[0-9a-f]+$/);
    expect(pair.privateKey).toMatch(/^[0-9a-f]+$/);
  });

  it('should generate different keys each call', () => {
    const pair1 = generateEd25519KeyPair();
    const pair2 = generateEd25519KeyPair();
    expect(pair1.publicKey).not.toBe(pair2.publicKey);
    expect(pair1.privateKey).not.toBe(pair2.privateKey);
  });

  it('should generate keys of consistent length', () => {
    const pair = generateEd25519KeyPair();
    // Ed25519 SPKI DER public key is 44 bytes = 88 hex chars
    expect(pair.publicKey.length).toBe(88);
    // Ed25519 PKCS8 DER private key is 48 bytes = 96 hex chars
    expect(pair.privateKey.length).toBe(96);
  });
});

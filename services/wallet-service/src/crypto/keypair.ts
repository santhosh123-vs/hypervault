import { generateKeyPairSync } from 'crypto';

export interface Ed25519KeyPair {
  publicKey: string;  // hex
  privateKey: string; // hex
}

export function generateEd25519KeyPair(): Ed25519KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });

  return {
    publicKey: publicKey.toString('hex'),
    privateKey: privateKey.toString('hex'),
  };
}

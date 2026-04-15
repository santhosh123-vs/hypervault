import { scryptSync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK = 8;
const SCRYPT_PARALLEL = 1;

export interface EncryptedData {
  ciphertext: string; // hex
  iv: string;         // hex
  authTag: string;    // hex
}

export function generateKdfSalt(): string {
  return randomBytes(SALT_LENGTH).toString('hex');
}

function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return scryptSync(masterKey, salt, KEY_LENGTH, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK,
    p: SCRYPT_PARALLEL,
  });
}

export function encrypt(plaintext: string, masterKey: string, kdfSalt: string): EncryptedData {
  const salt = Buffer.from(kdfSalt, 'hex');
  const key = deriveKey(masterKey, salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decrypt(data: EncryptedData, masterKey: string, kdfSalt: string): string {
  const salt = Buffer.from(kdfSalt, 'hex');
  const key = deriveKey(masterKey, salt);
  const iv = Buffer.from(data.iv, 'hex');
  const authTag = Buffer.from(data.authTag, 'hex');
  const ciphertext = Buffer.from(data.ciphertext, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`FATAL: Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return val;
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hypervault',
  jwtSecret: requireEnv('JWT_SECRET'),
  masterEncryptionKey: requireEnv('MASTER_ENCRYPTION_KEY'),
  bcryptRounds: 12,
  jwtExpiresIn: '1h',
} as const;

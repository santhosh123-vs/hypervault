import mongoose from 'mongoose';
import { config } from './config';
import app from './app';

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log('[wallet-service] connected to MongoDB');

  app.listen(config.port, () => {
    console.log(`[wallet-service] listening on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error('[wallet-service] fatal startup error:', err);
  process.exit(1);
});

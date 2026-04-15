import express from 'express';
import pinoHttp from 'pino-http';
import pino from 'pino';
import userRoutes from './routes/users';
import walletRoutes from './routes/wallets';
import { errorHandler } from './middleware/errorHandler';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = express();

app.use(express.json());
app.use(pinoHttp({ logger, autoLogging: process.env.NODE_ENV !== 'test' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wallet-service' });
});

app.use('/users', userRoutes);
app.use('/wallets', walletRoutes);

app.use(errorHandler);

export default app;

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wallet-service' });
});

app.listen(PORT, () => {
  console.log(`[wallet-service] listening on port ${PORT}`);
});

export default app;

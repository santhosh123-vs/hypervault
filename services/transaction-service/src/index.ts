import express from 'express';

const app = express();
const PORT = process.env.PORT || 3002;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'transaction-service' });
});

app.listen(PORT, () => {
  console.log(`[transaction-service] listening on port ${PORT}`);
});

export default app;

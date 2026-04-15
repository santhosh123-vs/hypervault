import express from 'express';

const app = express();
const PORT = process.env.PORT || 3003;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'p2p-sync-service' });
});

app.listen(PORT, () => {
  console.log(`[p2p-sync-service] listening on port ${PORT}`);
});

export default app;

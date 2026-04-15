# HyperVault

P2P stablecoin wallet backend with microservices architecture, Hyperswarm networking, and end-to-end encrypted transactions.

## Architecture

```
┌─────────────────┐
│   API Gateway    │  JWT auth, rate limiting, request routing
│   :3000          │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
┌───▼───┐ ┌──▼────────┐ ┌──▼──────────┐
│Wallet │ │Transaction │ │ P2P Sync    │
│Service│ │ Service    │ │ Service     │
│:3001  │ │ :3002      │ │ :3003       │
│MongoDB│ │ MySQL      │ │ Hyperswarm  │
└───────┘ └────────────┘ └─────────────┘
```

## Quick Start

```bash
cp .env.example .env
docker compose up -d
```

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **API Gateway**: Express + Helmet + Zod + JWT
- **Wallet Service**: Express + MongoDB (Mongoose)
- **Transaction Service**: Express + MySQL (Prisma)
- **P2P Sync**: Hyperswarm + Hypercore
- **Cache/Sessions**: Redis
- **Containerization**: Docker Compose
- **Testing**: Jest + Supertest

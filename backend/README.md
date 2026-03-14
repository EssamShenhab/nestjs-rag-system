# NestJS RAG System

A NestJS implementation of a RAG (Retrieval-Augmented Generation) system for document processing, semantic search, and AI-powered question answering.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20 |
| Framework | NestJS 11 |
| Database | MySQL 8.0 (TypeORM 0.3) |
| Vector DB | Qdrant v1.17 |
| LLM | OpenAI / JinaAI |
| Document Processing | LangChain, pdf-parse |
| Containerization | Docker / Docker Compose |

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Start Docker services (MySQL + Qdrant):
```bash
cd docker && docker compose up -d
```

4. Run the development server:
```bash
npm run start:dev
```

## Database Migrations

TypeORM migrations are used to version-control the database schema.
```bash
# Generate a migration after entity changes
npm run migration:generate src/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

> Never use `synchronize: true` in production — always use migrations instead.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/` | Health check |
| POST | `/api/v1/data/upload/:project_id` | Upload a document |
| POST | `/api/v1/data/process/:project_id` | Process and chunk a document |
| POST | `/api/v1/nlp/index/push/:project_id` | Index chunks into vector DB |
| GET | `/api/v1/nlp/index/info/:project_id` | Get vector collection info |
| POST | `/api/v1/nlp/index/search/:project_id` | Semantic search |
| POST | `/api/v1/nlp/index/answer/:project_id` | RAG question answering |

## RAG Pipeline

```
Upload → Process → Chunk → Embed → Store in Qdrant → Search → LLM → Answer
```
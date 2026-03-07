# NestJS RAG System

A document processing and retrieval system built with NestJS that enables uploading documents, chunking them for semantic search, and storing embeddings in a vector database for RAG (Retrieval-Augmented Generation) workflows.

## Overview

This system provides a REST API for:
- Uploading documents (PDF/TXT)
- Processing and chunking documents into smaller text segments
- Managing projects and their associated assets
- Storing document chunks in a MySQL database
- Preparing for vector search (Qdrant integration planned)

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | NestJS |
| Database | MySQL (TypeORM) |
| Vector DB | Qdrant (client ready, implementation pending) |
| LLM | OpenAI (client ready, implementation pending) |
| Document Processing | LangChain, pdf-parse |
| Validation | class-validator |

## Project Structure

```
src/
├── asset/              # Asset management (stored files)
├── chunk/              # Document chunk storage and retrieval
├── documents/          # File upload endpoints
├── models/             # Enums and shared models
├── process/            # Document processing and chunking
├── project/            # Project management
├── stores/             # External service integrations
│   ├── vectordb/       # Qdrant vector database
│   └── llm/            # OpenAI language models
├── config/             # Configuration and validation
└── main.ts             # Application entry point
```

## Setup Instructions

### Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0
- npm or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
APP_NAME=simple-RAG
APP_VERSION=0.1
OPENAI_API_KEY=your_openai_api_key

# File upload settings
FILE_ALLOWED_TYPES=["application/pdf","text/plain"]
FILE_MAX_SIZE=10
FILE_DEFAULT_CHUNK_SIZE=512000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=mysql-nestjs-rag
```

4. Start MySQL (using docker-compose):
```bash
docker-compose up -d
```

5. Run the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/` | Returns app name and version |

### Document Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/data/upload/:project_id` | Upload a document file |

**Request:**
- `project_id` (path): Project identifier
- `file` (form-data): File to upload (PDF or TXT)

**Response:**
```json
{
  "signal": "file_upload_success",
  "file_id": "uuid-here"
}
```

### Document Processing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/data/process/:project_id` | Process uploaded file, create chunks |

**Request Body:**
```json
{
  "file_id": "uuid",
  "chunk_size": 100,
  "overlap_size": 20
}
```

**Response:**
```json
{
  "signal": "processing_success",
  "inserted_chunks": 5
}
```

## RAG Pipeline Overview

```
1. Upload Document
   ↓
2. Store in project directory with UUID
   ↓
3. Process File
   ↓
4. Parse document (PDF/TXT)
   ↓
5. Split into chunks with overlap
   ↓
6. Store chunks in MySQL database
   ↓
7. [Future] Generate embeddings
   ↓
8. [Future] Store in Qdrant vector DB
   ↓
9. [Future] Query and retrieve relevant chunks
   ↓
10. [Future] Send to LLM with context
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server with auto-reload |
| `npm run start:debug` | Start with debugger enabled |
| `npm run build` | Build production bundle |
| `npm run start:prod` | Run production build |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage |

## Future Improvements

- [ ] Implement Qdrant vector database integration
- [ ] Implement OpenAI embedding generation
- [ ] Add vector search/retrieval endpoints
- [ ] Implement RAG (Retrieval-Augmented Generation) pipeline
- [ ] Add document deletion and cleanup
- [ ] Implement chunk search by similarity
- [ ] Add project-specific vector collections
- [ ] Support more document formats (DOCX, HTML)

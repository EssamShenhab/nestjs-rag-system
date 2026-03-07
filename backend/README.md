# NestJS RAG System

A Backend API for a Retrieval-Augmented Generation (RAG) system built with NestJS, TypeORM, and LangChain.

---

## Project Overview

This is a backend service that enables document ingestion, processing, and chunking for RAG workflows. The system handles file uploads, extracts content, splits documents into chunks, and prepares them for embedding and vector storage.

**Note**: The core RAG functionality (vector database integration and LLM generation) is currently a work in progress. The system currently supports document ingestion and chunking.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        API Layer (Controllers)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Documents   │  │   Process    │  │    Other     │              │
│  │  Controller  │  │ Controller   │  │  Endpoints   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘              │
│         │                 │                                         │
└─────────┼─────────────────┼──────────────────────────────────────────┘
          │                 │
┌─────────┴─────────────────┴──────────────────────────────────────────┐
│                       Service Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Documents    │  │   Process    │  │    Other     │              │
│  │  Service     │  │  Service     │  │   Services   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘              │
│         │                 │                                         │
└─────────┼─────────────────┼──────────────────────────────────────────┘
          │                 │
┌─────────┴─────────────────┴──────────────────────────────────────────┐
│                    Data/Storage Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  TypeORM     │  │  LangChain   │  │   External   │              │
│  │  (MySQL)     │  │   (Chunking) │  │  Services    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. Upload Document
   ┌─────────┐
   │ File    │ ──────────▶ Project Directory
   │ Upload  │ ──────────▶ Asset Tracking (MySQL)
   └─────────┘

2. Process Document
   ┌─────────┐
   │ LangChain│ ─────────▶ Document Loader (PDF/TXT)
   │ Load     │ ─────────▶ Text Splitter (Recursive)
   └─────────┘

3. Store Chunks
   ┌─────────┐
   │ Chunks  │ ──────────▶ Database (MySQL)
   └─────────┘
```

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | NestJS 11.0.1 |
| **Language** | TypeScript 5.7.3 |
| **ORM** | TypeORM 0.3.28 |
| **Database** | MySQL 8.0 |
| **LangChain** | @langchain/core, @langchain/community, @langchain/textsplitters |
| **Vector DB** | Qdrant (client library included, integration pending) |
| **LLM** | OpenAI SDK (library included, integration pending) |
| **File Processing** | pdf-parse, @langchain/community |
| **Validation** | class-validator, class-transformer, joi |
| **Documentation** | Swagger (OpenAPI) |
| **Testing** | Jest |

---

## Directory and Module Structure

```
src/
├── app.module.ts                    # Root module
├── main.ts                          # Application entry point
├── app.controller.ts                # Root controller (health check)
├── app.service.ts                   # Root service
│
├── config/                          # Configuration management
│   ├── app.config.ts                # Configuration factory
│   ├── config.interface.ts          # TypeScript interfaces
│   └── validation.ts                # Joi validation schema
│
├── models/                          # Shared models and enums
│   └── enums/
│       ├── processing.enum.ts       # File types (PDF, TXT)
│       ├── asset-type.enum.ts       # Asset types
│       ├── database.enum.ts         # Database collection names
│       └── response-signal.enum.ts  # API response signals
│
├── project/                         # Project management module
│   ├── dto/                         # Data Transfer Objects
│   │   ├── create-project.dto.ts
│   │   └── update-project.dto.ts
│   ├── entities/
│   │   └── project.entity.ts        # Project entity (TypeORM)
│   ├── project.service.ts           # Project business logic
│   ├── project.controller.ts        # Project API endpoints
│   └── project.module.ts            # Project feature module
│
├── documents/                       # Document upload module
│   ├── dto/
│   │   └── upload-document.dto.ts
│   ├── pipes/
│   │   └── upload-file-validation.pipe.ts  # File validation
│   ├── documents.service.ts         # Document upload logic
│   ├── documents.controller.ts      # Upload API endpoint
│   └── documents.module.ts          # Documents feature module
│
├── process/                         # Document processing module
│   ├── dto/
│   │   ├── process-request.dto.ts
│   │   ├── create-process.dto.ts
│   │   └── update-process.dto.ts
│   ├── entities/
│   │   └── process.entity.ts        # (empty class)
│   ├── process.service.ts           # LangChain processing logic
│   ├── process.controller.ts        # Process API endpoint
│   └── process.module.ts            # Process feature module
│
├── chunk/                           # Chunk management module
│   ├── dto/
│   │   ├── create-chunk.dto.ts
│   │   └── update-chunk.dto.ts
│   ├── entities/
│   │   └── chunk.entity.ts          # Chunk entity (TypeORM)
│   ├── chunk.service.ts             # Chunk CRUD operations
│   ├── chunk.module.ts              # Chunk feature module
│
├── asset/                           # Asset tracking module
│   ├── dto/
│   │   ├── create-asset.dto.ts
│   │   └── update-asset.dto.ts
│   ├── entities/
│   │   └── asset.entity.ts          # Asset entity (TypeORM)
│   ├── asset.service.ts             # Asset CRUD operations
│   └── asset.module.ts              # Asset feature module
│
├── stores/                          # External service integrations
│   ├── vectordb/                    # Vector database layer
│   │   ├── interfaces/
│   │   │   └── vectordb.interface.ts  # (empty interface)
│   │   ├── providers/
│   │   │   └── qdrant.provider.ts   # (empty provider)
│   │   ├── vectordb.service.ts      # (empty service)
│   │   └── vectordb.module.ts       # VectorDB feature module
│   │
│   └── llm/                         # LLM provider layer
│       └── llm.module.ts            # (empty module)
│
└── assets/                          # Local file storage (created at runtime)
    ├── files/                       # Uploaded documents
    │   └── {project_id}/           # Per-project subdirectories
    └── database/                    # Database files
```

### Module Dependencies

```
AppModule
├── ConfigModule (global)
├── TypeOrmModule (global, MySQL)
├── ProjectModule
│   └── TypeOrmModule.forFeature([Project])
├── AssetModule
│   └── TypeOrmModule.forFeature([Asset])
├── DocumentsModule
│   ├── ProjectModule
│   ├── AssetModule
│   └── MulterModule (file upload)
├── ProcessModule
│   ├── ProjectModule
│   └── LangChain dependencies
├── ChunkModule
│   └── TypeOrmModule.forFeature([Chunk])
└── VectordbModule
```

---

## API Endpoints

### Root
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/` | Health check with app info (name, version) |

### Document Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/data/upload/:project_id` | Upload a document to a project |

**Request Body**: `multipart/form-data` with `file` field

**Success Response**:
```json
{
  "signal": "file_upload_success",
  "file_id": "uuid-here"
}
```

**Error Responses**:
- `file_type_not_supported` - File type not allowed
- `file_size_exceeded` - File exceeds maximum size

### Document Processing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/data/process/:project_id` | Process uploaded file into chunks |

**Request Body**:
```json
{
  "file_id": "string",
  "chunk_size": 100,
  "overlap_size": 20,
  "do_reset": 0
}
```

**Response**:
```json
{
  "signal": "processing_success",
  "inserted_chunks": 15
}
```

**Error Responses**:
- `project_not_found` - Project does not exist
- `file_type_not_supported` - Unsupported file extension
- `processing_failed` - No chunks could be generated

---

## Development Setup

### Prerequisites

- Node.js 18+
- MySQL 8.0
- npm or yarn

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

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
APP_NAME=simple-RAG
APP_VERSION=0.1
OPENAI_API_KEY=your-openai-api-key

FILE_ALLOWED_TYPES=["application/pdf","text/plain"]
FILE_MAX_SIZE=10
FILE_DEFAULT_CHUNK_SIZE=512000

DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=your-mysql-password
DB_NAME=mysql-nestjs-rag
```

### Running the Application

**Development mode**:
```bash
npm run start:dev
```

**Production mode**:
```bash
# Build first
npm run build

# Start production
npm run start:prod
```

### Docker Setup

```bash
cd docker
cp .env.example .env
docker-compose up -d
```

The MySQL database will start on the configured port.

---

## The RAG Pipeline (Current & Planned)

### Current Implementation

#### 1. Document Ingestion
- Files uploaded via `POST /api/v1/data/upload/:project_id`
- Files stored locally in `src/assets/files/{project_id}/`
- Asset metadata recorded in MySQL database
- File types supported: PDF, TXT

#### 2. Document Processing
- Triggered via `POST /api/v1/data/process/:project_id`
- Uses LangChain's `PDFLoader` and `TextLoader`
- Text is split using `RecursiveCharacterTextSplitter`
- Chunks stored in MySQL database with order tracking

#### 3. Chunk Storage
- Chunks stored in `chunks` table with:
  - UUID
  - Text content
  - Metadata (page, source info)
  - Order within document
  - Project and asset references

### Planned Implementation

#### 4. Embedding Generation
- LLM provider integration (OpenAI) to generate embeddings
- Embeddings stored alongside chunk metadata
- Optional: Use local embedding models

#### 5. Vector Database Integration
- Qdrant integration for fast similarity search
- Index chunks with their embeddings
- Support for metadata filtering

#### 6. Retrieval Flow
- User query → embedding generation
- Vector similarity search in Qdrant
- Retrieve top-k relevant chunks

#### 7. Generation Layer
- Retrieve context from chunks
- Send to LLM with prompt
- Return generated response

---

## Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| File Upload | ✅ Complete | PDF and TXT support |
| File Validation | ✅ Complete | Type and size validation |
| Local Storage | ✅ Complete | Per-project directories |
| Asset Tracking | ✅ Complete | MySQL storage |
| Document Loading | ✅ Complete | LangChain loaders |
| Text Chunking | ✅ Complete | Recursive splitter |
| Chunk Storage | ✅ Complete | MySQL with UUIDs |
| Project Management | ✅ Complete | CRUD operations |
| Vector Database | ⚠️ Stub | Interface defined, no implementation |
| LLM Integration | ⚠️ Stub | Module exists, no implementation |
| RAG Pipeline | ❌ Missing | Requires vector + LLM layers |

---

## Known Limitations

### Current Limitations

1. **No Vector Database Integration**
   - The `VectordbService` is empty
   - No Qdrant client configuration
   - Vector search unavailable

2. **No LLM Integration**
   - The `LlmModule` is empty
   - No OpenAI client configuration
   - Generation layer not implemented

3. **Local File Storage**
   - Files stored locally, not scalable
   - No cloud storage (S3, GCS) integration
   - No file backup mechanism

4. **No Authentication**
   - No API key or user authentication
   - No role-based access control
   - Project isolation only by ID

5. **Error Handling**
   - Missing try-catch in some services
   - Generic error messages
   - No retry mechanism for failures

6. **No Monitoring**
   - No logging integration
   - No metrics collection
   - No health check for external services

### Data Model Limitations

1. **Chunk UUID Mismatch**
   - Entity uses `chunkUuid` (camelCase) but DB column uses `chunkUuid` (mixed case)
   - Inconsistent naming in queries

2. **No Delete Cascade**
   - Deleting a project doesn't cascade to chunks/assets
   - Manual cleanup required

3. **No Full-Text Search**
   - Only metadata filtering available
   - No vector search capability

---

## Suggested Future Improvements

### 1. External Service Integration

#### Vector Database (Qdrant)
```typescript
// Stages to implement:
1. Configure Qdrant client in vectordb.provider.ts
2. Implement collection creation/mapping
3. Add vector upsert functionality
4. Implement similarity search
5. Add metadata filtering
```

#### LLM Provider (OpenAI)
```typescript
// Stages to implement:
1. Configure OpenAI client in llm.provider.ts
2. Implement embedding generation service
3. Add prompt template management
4. Implement RAG pipeline
5. Add streaming responses
```

### 2. Enhanced File Storage
- AWS S3 / Google Cloud Storage integration
- File versioning support
- Pre-signed URLs for downloads
- Automatic cleanup of old files

### 3. Authentication & Security
- JWT-based authentication
- API key generation
- Project-level access control
- Rate limiting

### 4. Monitoring & Observability
- Winston/Pino for structured logging
- Prometheus metrics
- Health check endpoint for external services
- Request tracing

### 5. Data Model Improvements
```sql
-- Add proper foreign key constraints
ALTER TABLE chunks ADD CONSTRAINT fk_chunk_project
  FOREIGN KEY (chunk_project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Add full-text index for search
ALTER TABLE chunks ADD FULLTEXT INDEX ft_chunk_text (chunkText);
```

### 6. API Enhancements
- GET endpoints for projects, documents, chunks
- DELETE endpoints for resource cleanup
- PUT endpoints for partial updates
- Search endpoint with filters

### 7. Background Processing
- Queue system (BullMQ) for async processing
- Batch embedding generation
- Progress tracking for large files
- Dead letter queues for failures

### 8. Testing
- Unit tests for all services
- Integration tests for workflows
- E2E tests for API endpoints
- Mock services for external dependencies

---

## Running Tests

```bash
# Unit tests
npm run test

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## License

UNLICENSED

---

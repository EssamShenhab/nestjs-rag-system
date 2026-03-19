# Docker Setup for NestJS RAG System

This directory contains the Docker setup for the NestJS RAG application, including all necessary services for development and monitoring.

## Services

- **NestJS Application**: Main application running on Node.js
- **Nginx**: Reverse proxy for the NestJS application
- **MySQL 8.0**: Relational database for storing chunks and assets
- **MySQL Exporter**: Exports MySQL metrics for Prometheus
- **Qdrant**: Vector database for similarity search
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboard for metrics
- **Node Exporter**: System metrics collection

## Setup Instructions

### 1. Set up environment files

```bash
cd docker/env
cp .env.example.app .env.app
cp .env.example.mysql .env.mysql
cp .env.example.grafana .env.grafana
cp .env.example.mysql-exporter .env.mysql-exporter
```

### 2. Start the services

```bash
cd docker
docker compose up --build -d
```

To start only specific services:

```bash
docker compose up -d mysql qdrant
```

If you encounter connection issues, start the database services first:

```bash
# Start databases first
docker compose up -d mysql qdrant
# Wait for databases to be healthy
sleep 30
# Start the application services
docker compose up nestjs nginx prometheus grafana node-exporter --build -d
```

To delete all containers and volumes:

```bash
docker compose down -v --remove-orphans
```

### 3. Access the services

- NestJS Application: http://localhost:5000
- NestJS Swagger Docs: http://localhost:5000/api
- Nginx: http://localhost
- Prometheus: http://localhost:9090
- Grafana: http://localhost:4000
- Qdrant UI: http://localhost:6333/dashboard

## Volume Management

```bash
# List all volumes
docker volume ls

# Inspect a volume
docker volume inspect <volume_name>

# List files in a volume
docker run --rm -v <volume_name>:/data busybox ls -l /data

# Remove a volume
docker volume rm <volume_name>

# Prune unused volumes
docker volume prune

# Backup a volume
docker run --rm -v <volume_name>:/volume -v $(pwd):/backup alpine tar cvf /backup/backup.tar /volume

# Restore a volume from backup
docker run --rm -v <volume_name>:/volume -v $(pwd):/backup alpine sh -c "cd /volume && tar xvf /backup/backup.tar --strip 1"

# Remove all volumes
docker volume rm $(docker volume ls -q)
```

> For MySQL specifically, use `mysqldump` and `mysql` for reliable backups of live databases.

## Monitoring

### NestJS Metrics

NestJS exposes Prometheus metrics at `/metrics` using `@willsoto/nestjs-prometheus`. Metrics include request counts, latencies, and status codes.

### Visualizing Metrics in Grafana

1. Log into Grafana at http://localhost:4000 (default: admin/admin_password)
2. Add Prometheus as a data source (URL: http://prometheus:9090)
3. Import dashboards:

| Dashboard | URL |
|-----------|-----|
| Node Exporter | https://grafana.com/grafana/dashboards/1860 |
| MySQL | https://grafana.com/grafana/dashboards/7362 |
| Qdrant | https://grafana.com/grafana/dashboards/24603-qdrant-prometheus-metrics-only-by-divakar-r |

## Troubleshooting

### Connection Errors

**Database not ready:**
```
QueryFailedError: Table doesn't exist
```
Start MySQL first and wait for the healthcheck to pass before starting NestJS.

**Qdrant unreachable:**
```
Failed to connect to Qdrant
```
Ensure `QDRANT_HOST=qdrant` in `.env.app` when running inside Docker.

**Check service status:**
```bash
docker compose ps
docker compose logs --tail=100 nestjs
docker compose logs --tail=100 mysql
```

**Restart a service:**
```bash
docker compose restart nestjs
```

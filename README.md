# Bifrost Portal

> Web UI (React/Next.js), FastAPI backend, GraphQL API

## Overview

The Portal provides a unified user experience for interacting with the Bifrost lakehouse platform. It combines a modern React frontend with a powerful FastAPI backend and flexible GraphQL API.

## Components

### 🎨 Frontend (Next.js + React)
- **Dashboard**: Overview of jobs, data, and system health
- **Data Catalog**: Browse tables, schemas, and metadata
- **Job Management**: Submit, monitor, and manage Spark/Trino jobs
- **Query Editor**: Interactive SQL editor with autocomplete
- **Lineage Visualization**: Data flow and dependency graphs
- **User Management**: RBAC and permissions

### ⚡ Backend (FastAPI)
- **REST API**: RESTful endpoints for all operations
- **GraphQL API**: Flexible data querying
- **WebSocket**: Real-time job updates and notifications
- **Authentication**: Integration with bifrost-auth
- **Job Orchestration**: Spark and Trino job submission

## Architecture

```
bifrost-portal/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and helpers
│   │   └── styles/           # CSS/Tailwind styles
│   ├── public/               # Static assets
│   ├── package.json
│   └── next.config.js
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routes
│   │   ├── graphql/          # GraphQL schema and resolvers
│   │   ├── core/             # Core business logic
│   │   ├── models/           # Data models
│   │   ├── services/         # External service clients
│   │   └── main.py           # Application entry point
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── helm/
│   └── bifrost-portal/       # Helm chart
└── docker-compose.yml        # Local development
```

## Prerequisites

### Development
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Production
- Kubernetes 1.24+
- PostgreSQL (for application state)

## Local Development

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Access the app at `http://localhost:3000`

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Documentation

### REST API
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### GraphQL API
- GraphQL Playground: `http://localhost:8000/graphql`

### Example GraphQL Query

```graphql
query GetTables {
  tables(catalog: "iceberg", schema: "default") {
    name
    type
    columns {
      name
      type
    }
    rowCount
    sizeBytes
  }
}
```

### Example REST Endpoint

```bash
# Submit a Spark job
curl -X POST http://localhost:8000/api/v1/jobs/spark \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-etl-job",
    "mainClass": "com.example.ETLJob",
    "jarFile": "s3://bifrost-apps/etl-job.jar",
    "executor": {
      "instances": 3,
      "memory": "4g",
      "cores": 2
    }
  }'
```

## Configuration

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/bifrost
BIFROST_CORE_API=http://bifrost-core:8080
KEYCLOAK_URL=http://bifrost-auth:8080
SECRET_KEY=your-secret-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql
```

## Features

### 📊 Dashboard
- Real-time job monitoring
- System health metrics
- Recent activity feed
- Storage usage statistics

### 📁 Data Catalog
- Browse catalogs, schemas, and tables
- View table metadata and statistics
- Preview data samples
- Search and filter

### 🚀 Job Management
- Submit Spark and Trino jobs
- Monitor job progress
- View logs and metrics
- Job history and rerun

### ✏️ SQL Editor
- Syntax highlighting
- Autocomplete for tables and columns
- Query history
- Save and share queries
- Export results (CSV, JSON, Parquet)

### 🔍 Data Lineage
- Visual dependency graphs
- Column-level lineage
- Impact analysis
- Time-based lineage

## Deployment

### Kubernetes with Helm

```bash
# Install portal
helm install bifrost-portal ./helm/bifrost-portal \
  --namespace bifrost-portal \
  --create-namespace \
  --set backend.image.tag=v1.0.0 \
  --set frontend.image.tag=v1.0.0

# Upgrade
helm upgrade bifrost-portal ./helm/bifrost-portal \
  --namespace bifrost-portal
```

### Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: bifrost-portal
  namespace: bifrost-portal
spec:
  rules:
  - host: bifrost.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: bifrost-portal-backend
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: bifrost-portal-frontend
            port:
              number: 3000
```

## Testing

### Backend Tests

```bash
cd backend
pytest
pytest --cov=app tests/
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:e2e
```

## Building for Production

### Backend

```bash
cd backend
docker build -t bifrost-portal-backend:latest .
docker push ghcr.io/bifrost/portal-backend:latest
```

### Frontend

```bash
cd frontend
npm run build
docker build -t bifrost-portal-frontend:latest .
docker push ghcr.io/bifrost/portal-frontend:latest
```

## Monitoring

The portal exposes metrics for monitoring:
- `/metrics` - Prometheus metrics
- Health check: `/health`
- Readiness: `/ready`

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md)

## License

Apache 2.0

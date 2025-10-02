# Reactive Mirror API Documentation

## Overview

Reactive Mirror provides a production-ready backend for test coverage tracking with atomic operations, idempotency, and comprehensive observability.

## Base URL

```
https://[your-project-id].supabase.co/functions/v1
```

## Authentication

All endpoints use Bearer token authentication:

```bash
Authorization: Bearer <your-service-role-key>
```

## Endpoints

### POST /runs

Submit a test run with coverage metrics and oracle decisions.

**Features:**
- Atomic upsert with `run_id` idempotency
- Automatic project creation
- Duplicate oracle prevention per run

**Request:**

```bash
curl -X POST "$BASE_URL/runs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{
    "run": {
      "run_id": "gh-1234-abcdef",
      "project": "acme/vehicle-fw",
      "commit": "abcdef1",
      "branch": "main",
      "created_at": "2025-10-02T12:34:56Z",
      "ci": {
        "provider": "github_actions",
        "workflow": "CI Tests",
        "run_url": "https://github.com/acme/vehicle-fw/actions/runs/1234"
      }
    },
    "manifest": {
      "schema": "mirror.run-manifest.v1",
      "counts": { "events": 1247 },
      "artifacts": [
        { "path": "logs/mqtt.jsonl", "sha256": "abc..." }
      ],
      "tooling": {
        "evaluator": "mirror-eval@0.2.0",
        "plugin": "pytest-mirror@0.1.0"
      }
    },
    "coverage": {
      "requirement": 0.64,
      "temporal": 0.41,
      "interface": 0.89,
      "risk": 0.71
    },
    "decisions": [
      {
        "oracle": "S02P01-INV-001",
        "result": "pass",
        "satisfies": ["S02P01:4.2.1"],
        "evidence": ["logs/inventory.txt"],
        "message": "All required services discovered"
      },
      {
        "oracle": "GNSS-UNIQ-LOCK",
        "result": "fail",
        "message": "Multiple GNSS providers detected",
        "evidence": ["mdns.txt"]
      }
    ]
  }'
```

**Response (201 Created):**

```json
{
  "run_id": "gh-1234-abcdef",
  "dashboard_url": "/runs/gh-1234-abcdef"
}
```

**Response (200 OK - Idempotent):**

```json
{
  "run_id": "gh-1234-abcdef",
  "dashboard_url": "/runs/gh-1234-abcdef",
  "idempotent": true
}
```

---

### GET /runs

List recent test runs with optional project filtering.

**Query Parameters:**
- `project` (optional): Filter by project slug
- `limit` (optional): Max results (default: 20, max: 100)

**Request:**

```bash
curl "$BASE_URL/runs?project=acme/vehicle-fw&limit=10" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Response (200 OK):**

```json
[
  {
    "run_id": "gh-1234-abcdef",
    "project": "acme/vehicle-fw",
    "commit": "abcdef1",
    "branch": "main",
    "created_at": "2025-10-02T12:34:56Z",
    "ci": {
      "provider": "github_actions",
      "workflow": "CI Tests",
      "run_url": "https://github.com/..."
    },
    "coverage": {
      "requirement": 0.64,
      "temporal": 0.41,
      "interface": 0.89,
      "risk": 0.71
    }
  }
]
```

---

### GET /run-detail/{run_id}

Get detailed information about a specific run.

**Request:**

```bash
curl "$BASE_URL/run-detail/gh-1234-abcdef" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Response (200 OK):**

```json
{
  "run": {
    "run_id": "gh-1234-abcdef",
    "project": "acme/vehicle-fw",
    "commit": "abcdef1",
    "branch": "main",
    "created_at": "2025-10-02T12:34:56Z",
    "ci": { ... }
  },
  "manifest": {
    "schema": "mirror.run-manifest.v1",
    "counts": { "events": 1247 },
    "artifacts": [...],
    "tooling": { ... }
  },
  "coverage": {
    "requirement": 0.64,
    "temporal": 0.41,
    "interface": 0.89,
    "risk": 0.71
  }
}
```

---

### GET /run-decisions/{run_id}

Get oracle decisions for a specific run.

**Request:**

```bash
curl "$BASE_URL/run-decisions/gh-1234-abcdef" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Response (200 OK):**

```json
[
  {
    "oracle": "S02P01-INV-001",
    "result": "pass",
    "satisfies": ["S02P01:4.2.1"],
    "evidence": ["logs/inventory.txt"],
    "message": "All required services discovered"
  },
  {
    "oracle": "GNSS-UNIQ-LOCK",
    "result": "fail",
    "message": "Multiple GNSS providers detected",
    "evidence": ["mdns.txt"]
  }
]
```

**Result Types:**
- `pass`: Oracle validation succeeded
- `fail`: Oracle validation failed
- `skip`: Oracle was skipped
- `error`: Oracle execution error

---

### GET /coverage-badge/{project}

Get an SVG coverage badge for embedding in READMEs.

**Caching:** `public, max-age=60, stale-while-revalidate=300`

**Request:**

```bash
curl "$BASE_URL/coverage-badge/acme%2Fvehicle-fw" \
  -H "Authorization: Bearer $ANON_KEY"
```

**Response (200 OK):**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="20">
  <!-- SVG badge showing: coverage | 64% / 41% -->
</svg>
```

**Usage in Markdown:**

```markdown
![Coverage](https://[project-id].supabase.co/functions/v1/coverage-badge/acme%2Fvehicle-fw)
```

---

## GitHub Actions Integration

```yaml
name: Tests & Mirror Upload

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests with Mirror
        run: |
          pytest --mirror-capture
      
      - name: Upload to Reactive Mirror
        if: always()
        run: |
          cat > payload.json <<JSON
          {
            "run": {
              "run_id": "${{ github.run_id }}-${{ github.run_attempt }}",
              "project": "${{ github.repository }}",
              "commit": "${{ github.sha }}",
              "branch": "${{ github.ref_name }}",
              "created_at": "$(date -u +%FT%TZ)",
              "ci": {
                "provider": "github_actions",
                "workflow": "${{ github.workflow }}",
                "run_url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
              }
            },
            "manifest": $(cat .mirror/report/run-manifest.json),
            "coverage": $(cat .mirror/report/coverage.json),
            "decisions": $(cat .mirror/report/decisions.json)
          }
          JSON
          
          curl -sS -X POST "${{ secrets.MIRROR_API_URL }}/runs" \
            -H "Authorization: Bearer ${{ secrets.MIRROR_SERVICE_KEY }}" \
            -H "Content-Type: application/json" \
            --data-binary @payload.json
```

---

## Security

- **Service Role Key**: Only use in server-side contexts (edge functions, CI/CD)
- **Anon Key**: Safe for browser and public GET endpoints
- **RLS Policies**: All tables have public read access, writes require service role
- **Idempotency**: Safe to retry POST /runs with same `run_id`
- **Atomic Operations**: Race-condition safe with database-level constraints

---

## Database Schema

```sql
-- Projects are auto-created on first run
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Runs store coverage + manifest
CREATE TABLE runs (
  id BIGSERIAL PRIMARY KEY,
  run_id TEXT UNIQUE NOT NULL,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  commit TEXT,
  branch TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  ci JSONB NOT NULL DEFAULT '{}',
  manifest JSONB,
  coverage JSONB,
  decisions_count INT NOT NULL DEFAULT 0
);

-- Decisions are oracle validation results
CREATE TABLE decisions (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  oracle TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('pass','fail','skip','error')),
  satisfies TEXT[] NOT NULL DEFAULT '{}',
  evidence TEXT[] NOT NULL DEFAULT '{}',
  message TEXT,
  UNIQUE(run_id, oracle)  -- Idempotency per oracle
);

-- Read-optimized view
CREATE VIEW public_runs AS
SELECT r.run_id, p.slug AS project, r.commit, r.branch, 
       r.created_at, r.ci, r.coverage, r.decisions_count
FROM runs r
JOIN projects p ON p.id = r.project_id;
```

---

## Error Handling

**400 Bad Request:**
```json
{ "error": "bad_json" }
```

**401 Unauthorized:**
```json
{ "error": "unauthorized" }
```

**404 Not Found:**
```json
{ "error": "not_found" }
```

**500 Internal Server Error:**
```json
{ "error": "db_error" }
```

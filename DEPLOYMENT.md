# Reactive Mirror - Deployment Guide

Complete guide to deploying and configuring Reactive Mirror in production.

## Prerequisites

- Lovable Cloud enabled (provides Supabase backend)
- GitHub repository connected (for CI/CD)
- Python 3.12+ (for test integration)

## Step 0: Environment Setup

Your Lovable Cloud project automatically provides these environment variables:

```bash
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

For CI/CD, you'll need to add these as GitHub Secrets:

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (from Lovable Cloud dashboard)

## Step 1: Database Verification

The database schema is automatically created via migrations. Verify it's applied:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('projects', 'runs', 'decisions');

-- Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
```

Expected tables:
- `projects` (with unique slug)
- `runs` (with unique run_id)
- `decisions` (with unique run_id, oracle pair)
- `public_runs` view

## Step 2: Edge Functions Deployment

Edge functions are automatically deployed when you push to GitHub. They're configured in `supabase/config.toml`:

```toml
# Public read endpoints (no JWT required)
[functions.run-detail]
verify_jwt = false

[functions.run-decisions]
verify_jwt = false

[functions.coverage-badge]
verify_jwt = false

[functions.runs]
verify_jwt = false  # GET is public, POST requires service role
```

### Available Endpoints

Base URL: `https://[project-id].supabase.co/functions/v1`

- `POST /runs` - Submit test run (requires service role key)
- `GET /runs?project=...&page=1&pageSize=20` - List runs
- `GET /run-detail/:id` - Get run details
- `GET /run-decisions/:id` - Get oracle decisions
- `GET /coverage-badge/:project` - Get SVG badge

## Step 3: Test the API

### Seed a Test Run

```bash
export BASE="https://[project-id].supabase.co/functions/v1"
export TOKEN="[service-role-key]"

curl -X POST "$BASE/runs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: $TOKEN" \
  -d '{
    "run": {
      "run_id": "test-seed-001",
      "project": "demo/reactive-mirror",
      "commit": "abc123",
      "branch": "main",
      "created_at": "2025-10-02T12:00:00Z",
      "ci": {
        "provider": "github_actions",
        "workflow": "Tests",
        "run_url": "https://github.com/demo/reactive-mirror/actions/runs/1"
      }
    },
    "manifest": {
      "schema": "mirror.run-manifest.v1",
      "counts": { "events": 150 },
      "artifacts": [],
      "tooling": { "pytest": "8.3.2" }
    },
    "coverage": {
      "requirement": 0.75,
      "temporal": 0.60,
      "interface": 0.90,
      "risk": 0.82
    },
    "decisions": [
      {
        "oracle": "S02P01-INV-001",
        "result": "pass",
        "satisfies": ["S02P01:4.2.1"],
        "evidence": ["logs/inventory.txt"],
        "message": "All services discovered"
      }
    ]
  }'
```

### Verify Endpoints

```bash
# List runs
curl "$BASE/runs?project=demo/reactive-mirror&page=1&pageSize=5"

# Get run detail
curl "$BASE/run-detail/test-seed-001"

# Get decisions
curl "$BASE/run-decisions/test-seed-001"

# Get badge (check headers)
curl -I "$BASE/coverage-badge/demo%2Freactive-mirror"
```

## Step 4: CI/CD Integration

### Setup GitHub Actions

1. Copy `.github/workflows/mirror-upload.yml` to your test repository
2. Add GitHub secrets (see Step 0)
3. Create `scripts/build_mirror_payload.py` in your test repo
4. Update workflow to match your test setup

### Required Files in Test Repository

```
your-test-repo/
├── .github/
│   └── workflows/
│       └── mirror-upload.yml
├── scripts/
│   └── build_mirror_payload.py
├── .mirror/
│   └── report/
│       ├── run-manifest.json
│       ├── coverage.json
│       └── decisions.json
└── requirements.txt
```

### Payload Format

The `build_mirror_payload.py` script expects:

**`.mirror/report/coverage.json`:**
```json
{
  "requirement": 0.75,
  "temporal": 0.60,
  "interface": 0.90,
  "risk": 0.82
}
```

**`.mirror/report/decisions.json`:**
```json
[
  {
    "oracle": "oracle-name",
    "result": "pass",
    "satisfies": ["REQ-001"],
    "evidence": ["path/to/evidence.txt"],
    "message": "Optional message"
  }
]
```

## Step 5: README Badge

Add to your test repository README:

```markdown
# Your Project

![Test Coverage](https://[project-id].supabase.co/functions/v1/coverage-badge/owner%2Frepo)

[View detailed coverage →](https://your-app.lovable.app/dashboard)
```

## Step 6: Production Checklist

### Security
- ✅ RLS policies enabled on all tables
- ✅ Service role key stored in GitHub Secrets (never committed)
- ✅ Public endpoints have input validation
- ✅ Coverage bounds enforced at database level

### Performance
- ✅ Indexes on hot paths (project_id, created_at)
- ✅ Unique constraints for idempotency
- ✅ ETag caching on badge endpoint
- ✅ Pagination on list endpoints

### Reliability
- ✅ Atomic upsert operations (race-safe)
- ✅ Trigger auto-syncs decisions_count
- ✅ Error handling with descriptive messages
- ✅ Idempotency keys prevent duplicates

### Observability
- ✅ Function logs in Lovable Cloud dashboard
- ✅ Database query logs in Lovable Cloud
- ✅ CI run URLs linked in run metadata

## Step 7: Monitoring

### Check Function Logs

View in Lovable Cloud dashboard:
1. Open Cloud tab
2. Navigate to Edge Functions
3. Select function name
4. View recent logs

### Check Database Activity

```sql
-- Recent runs
SELECT run_id, project, branch, created_at 
FROM runs 
ORDER BY created_at DESC 
LIMIT 10;

-- Coverage stats
SELECT 
  AVG((coverage->>'requirement')::numeric) as avg_req,
  AVG((coverage->>'temporal')::numeric) as avg_temp
FROM runs;

-- Decision pass rate
SELECT 
  result,
  COUNT(*) as count
FROM decisions
GROUP BY result;
```

## Step 8: Common Issues

### 401 Unauthorized
- Verify service role key is correct
- Check `apikey` header is included
- Ensure key is not expired

### 400 Bad Request
- Validate payload format matches schema
- Check coverage values are between 0 and 1
- Ensure all required fields are present

### 500 Internal Server Error
- Check function logs in Lovable Cloud
- Verify database constraints aren't violated
- Ensure RLS policies allow the operation

### Badge Not Updating
- Check project slug encoding (use `%2F` for `/`)
- Verify runs exist for the project
- Clear browser cache (304 responses are cached)

## Advanced Configuration

### Rate Limiting

Configure in Lovable Cloud dashboard:
- Edge Functions → Settings
- Set per-minute limits for `/runs` endpoint

### Custom Domains

1. Go to Lovable project → Settings → Domains
2. Add your custom domain
3. Update badge URLs in README

### Backup Strategy

Lovable Cloud provides automatic daily backups. For additional safety:

```bash
# Export run data
curl "$BASE/runs?pageSize=100" > backup-runs.json

# Database dump (via Lovable Cloud dashboard)
# Cloud → Database → Backups → Download
```

## Support

- **Documentation**: [API.md](./API.md)
- **Lovable Docs**: https://docs.lovable.dev
- **Issues**: GitHub Issues in this repository

#!/bin/bash
# Smoke test script for Reactive Mirror API
# Usage: ./scripts/test_api.sh

set -e

# Configuration
BASE="${SUPABASE_URL:-https://hvwnpeaktvusoqbjojxk.supabase.co}/functions/v1"
TOKEN="${SUPABASE_SERVICE_ROLE_KEY}"
PROJECT="demo/reactive-mirror"
RUN_ID="test-$(date +%s)"

echo "🧪 Testing Reactive Mirror API"
echo "Base URL: $BASE"
echo "Project: $PROJECT"
echo "Run ID: $RUN_ID"
echo ""

# Step 1: Submit a test run
echo "📤 Step 1: Submitting test run..."
RESPONSE=$(curl -sS -X POST "$BASE/runs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: $TOKEN" \
  -d '{
    "run": {
      "run_id": "'"$RUN_ID"'",
      "project": "'"$PROJECT"'",
      "commit": "abc123",
      "branch": "main",
      "created_at": "'"$(date -u +%FT%TZ)"'",
      "ci": {
        "provider": "test_script",
        "workflow": "Smoke Test"
      }
    },
    "manifest": {
      "schema": "mirror.run-manifest.v1",
      "counts": { "events": 42 },
      "artifacts": [],
      "tooling": { "test": "1.0.0" }
    },
    "coverage": {
      "requirement": 0.75,
      "temporal": 0.60,
      "interface": 0.90,
      "risk": 0.82
    },
    "decisions": [
      {
        "oracle": "TEST-ORACLE-001",
        "result": "pass",
        "satisfies": ["REQ-001"],
        "evidence": ["test.log"],
        "message": "Smoke test passed"
      },
      {
        "oracle": "TEST-ORACLE-002",
        "result": "fail",
        "message": "Expected failure for testing"
      }
    ]
  }')

echo "$RESPONSE" | jq '.' || echo "$RESPONSE"
echo ""

# Step 2: List runs
echo "📋 Step 2: Listing runs..."
curl -sS "$BASE/runs?project=$PROJECT&page=1&pageSize=5" | jq '.' || true
echo ""

# Step 3: Get run detail
echo "🔍 Step 3: Getting run detail..."
curl -sS "$BASE/run-detail/$RUN_ID" | jq '.' || true
echo ""

# Step 4: Get decisions
echo "⚖️  Step 4: Getting decisions..."
curl -sS "$BASE/run-decisions/$RUN_ID" | jq '.' || true
echo ""

# Step 5: Get badge
echo "🏷️  Step 5: Getting coverage badge..."
ENCODED_PROJECT=$(echo "$PROJECT" | sed 's/\//%2F/g')
curl -sS -I "$BASE/coverage-badge/$ENCODED_PROJECT" | grep -E "HTTP|Cache-Control|ETag" || true
echo ""

echo "✅ API smoke test complete!"
echo ""
echo "View results at: https://your-app.lovable.app/runs/$RUN_ID"

# Reactive Mirror

**Google Maps for Testing** - Navigate your system behavior with proof-grade test coverage.

![Coverage](https://hvwnpeaktvusoqbjojxk.supabase.co/functions/v1/coverage-badge/reactive-mirror)

Reactive Mirror transforms test execution into an explorable, auditable coverage map. Instead of walls of green checkmarks, you get:

- **Living Coverage Map**: Requirements → Tests → Evidence → Proof
- **Temporal Oracles**: Prove timing guarantees, not just code paths
- **Compliance-Ready**: Signed manifests, audit trails, standards mapping
- **AI-Assisted Gaps**: Intelligent oracle suggestions for untested scenarios

## Quick Start

```bash
# Install the pytest plugin
pip install pytest-mirror

# Run tests with Mirror capture
pytest --mirror-capture

# Upload results to your dashboard
python scripts/build_mirror_payload.py
curl -X POST "$SUPABASE_URL/functions/v1/runs" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  --data-binary @payload.json
```

## Features

✅ **Production-Ready Backend**
- Atomic operations, idempotency, race-condition safe
- ETag caching, pagination, signed manifests
- Lovable Cloud powered (zero external dependencies)

✅ **Industry Standards**
- ITxPT, AUTOSAR, ISO26262, DO-178C mapping
- Risk-weighted coverage metrics
- Audit-grade proof generation

✅ **Developer Experience**
- Beautiful React dashboard with live updates
- GitHub Actions integration
- Coverage badges for READMEs
- One-command deployment

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete setup walkthrough
- [API Reference](./API.md) - Full endpoint documentation
- [GitHub Actions](./.github/workflows/mirror-upload.yml) - CI/CD integration

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Pytest    │────▶│ Event JSONL  │────▶│  Evaluator  │
│  + Plugin   │     │  (Envelopes) │     │   + YAML    │
└─────────────┘     └──────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │◀────│  Cloud API   │◀────│  Decisions  │
│  Dashboard  │     │  (Edge Fns)  │     │  + Manifest │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Deployment Status

🟢 **Backend**: Lovable Cloud  
🟢 **Database**: PostgreSQL + RLS  
🟢 **Functions**: 4 edge functions deployed  
🟢 **Security**: Audit-grade compliance  

## Tech Stack

Built with:
- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL with RLS
- **Functions**: Edge Functions (Deno)

## How to Edit This Code

**Use Lovable**

Visit the [Lovable Project](https://lovable.dev/projects/523d81ff-0de0-4830-b61c-bb4b1cee87ca) and start prompting.

**Use your preferred IDE**

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

**Edit directly in GitHub**

Navigate to files and click the "Edit" button (pencil icon).

**Use GitHub Codespaces**

Click "Code" → "Codespaces" → "New codespace"

## Deployment

Simply open [Lovable](https://lovable.dev/projects/523d81ff-0de0-4830-b61c-bb4b1cee87ca) and click Share → Publish.

For custom domains, navigate to Project → Settings → Domains.

Read more: [Custom domains](https://docs.lovable.dev/features/custom-domain)

## Contributing

This project is built on [Lovable](https://lovable.dev) - AI-powered full-stack development.

## License

MIT License - See LICENSE for details.

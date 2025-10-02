#!/usr/bin/env python3
"""
Build Reactive Mirror payload from test artifacts.

This script collects pytest results, coverage data, and oracle decisions,
then constructs a JSON payload ready to POST to the Mirror API.

Usage:
    python scripts/build_mirror_payload.py
    
Environment variables:
    GITHUB_RUN_ID: CI run identifier
    GITHUB_RUN_ATTEMPT: CI run attempt number
    GITHUB_REPOSITORY: Repository name (owner/repo)
    GITHUB_SHA: Commit SHA
    GITHUB_REF_NAME: Branch name
    GITHUB_WORKFLOW: Workflow name
    GITHUB_SERVER_URL: GitHub server URL
    CI_PROVIDER: Override CI provider name (default: github_actions)
"""

import json
import os
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional


def hash_file(filepath: Path) -> str:
    """Calculate SHA256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for block in iter(lambda: f.read(65536), b''):
            sha256.update(block)
    return sha256.hexdigest()


def load_manifest(mirror_dir: Path) -> Dict[str, Any]:
    """Load run manifest from .mirror/report/run-manifest.json"""
    manifest_path = mirror_dir / 'run-manifest.json'
    if manifest_path.exists():
        with open(manifest_path) as f:
            return json.load(f)
    
    # Generate minimal manifest if not found
    return {
        'schema': 'mirror.run-manifest.v1',
        'counts': {'events': 0},
        'artifacts': [],
        'tooling': {}
    }


def load_coverage(mirror_dir: Path) -> Dict[str, float]:
    """Load coverage metrics from .mirror/report/coverage.json"""
    coverage_path = mirror_dir / 'coverage.json'
    if coverage_path.exists():
        with open(coverage_path) as f:
            return json.load(f)
    
    # Return minimal coverage if not found
    return {
        'requirement': 0.0,
        'temporal': 0.0,
        'interface': 0.0,
        'risk': 0.0
    }


def load_decisions(mirror_dir: Path) -> List[Dict[str, Any]]:
    """Load oracle decisions from .mirror/report/decisions.json"""
    decisions_path = mirror_dir / 'decisions.json'
    if decisions_path.exists():
        with open(decisions_path) as f:
            return json.load(f)
    
    return []


def collect_artifacts(mirror_dir: Path) -> List[Dict[str, str]]:
    """Collect and hash artifact files."""
    artifacts = []
    artifacts_dir = mirror_dir / 'artifacts'
    
    if artifacts_dir.exists():
        for artifact_file in artifacts_dir.rglob('*'):
            if artifact_file.is_file():
                rel_path = artifact_file.relative_to(mirror_dir)
                artifacts.append({
                    'path': str(rel_path),
                    'sha256': hash_file(artifact_file)
                })
    
    return artifacts


def get_ci_metadata() -> Dict[str, Any]:
    """Extract CI metadata from environment variables."""
    provider = os.getenv('CI_PROVIDER', 'github_actions')
    
    if provider == 'github_actions':
        run_id = os.getenv('GITHUB_RUN_ID', 'local')
        run_attempt = os.getenv('GITHUB_RUN_ATTEMPT', '1')
        return {
            'run_id': f"{run_id}-{run_attempt}",
            'project': os.getenv('GITHUB_REPOSITORY', 'local/project'),
            'commit': os.getenv('GITHUB_SHA', 'unknown'),
            'branch': os.getenv('GITHUB_REF_NAME', 'main'),
            'ci': {
                'provider': 'github_actions',
                'workflow': os.getenv('GITHUB_WORKFLOW', 'Tests'),
                'run_url': f"{os.getenv('GITHUB_SERVER_URL', 'https://github.com')}/{os.getenv('GITHUB_REPOSITORY', '')}/actions/runs/{run_id}"
            }
        }
    
    # Generic CI or local dev
    return {
        'run_id': os.getenv('RUN_ID', f"local-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"),
        'project': os.getenv('PROJECT', 'local/project'),
        'commit': os.getenv('COMMIT', 'HEAD'),
        'branch': os.getenv('BRANCH', 'main'),
        'ci': {
            'provider': provider,
            'workflow': os.getenv('WORKFLOW', 'Tests')
        }
    }


def build_payload(mirror_dir: Path = Path('.mirror/report')) -> Dict[str, Any]:
    """Build complete Mirror API payload."""
    ci_meta = get_ci_metadata()
    manifest = load_manifest(mirror_dir)
    coverage = load_coverage(mirror_dir)
    decisions = load_decisions(mirror_dir)
    
    # Enhance manifest with collected artifacts
    collected_artifacts = collect_artifacts(mirror_dir)
    if collected_artifacts:
        manifest['artifacts'] = collected_artifacts
    
    # Update event count if decisions exist
    if decisions and manifest['counts']['events'] == 0:
        manifest['counts']['events'] = len(decisions)
    
    return {
        'run': {
            'run_id': ci_meta['run_id'],
            'project': ci_meta['project'],
            'commit': ci_meta['commit'],
            'branch': ci_meta['branch'],
            'created_at': datetime.now(timezone.utc).isoformat(),
            'ci': ci_meta.get('ci')
        },
        'manifest': manifest,
        'coverage': coverage,
        'decisions': decisions
    }


def main():
    """Main entry point."""
    mirror_dir = Path('.mirror/report')
    
    if not mirror_dir.exists():
        print(f"Warning: {mirror_dir} not found. Creating minimal payload...")
        mirror_dir.mkdir(parents=True, exist_ok=True)
    
    payload = build_payload(mirror_dir)
    
    # Write to payload.json
    output_file = Path('payload.json')
    with open(output_file, 'w') as f:
        json.dump(payload, f, indent=2)
    
    print(f"✓ Payload written to {output_file}")
    print(f"  Run ID: {payload['run']['run_id']}")
    print(f"  Project: {payload['run']['project']}")
    print(f"  Decisions: {len(payload['decisions'])}")
    print(f"  Coverage: {payload['coverage']['requirement']:.1%} req, {payload['coverage']['temporal']:.1%} temporal")


if __name__ == '__main__':
    main()

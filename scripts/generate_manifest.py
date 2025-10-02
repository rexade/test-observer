"""Generate signed manifest with SHA256 hashes of artifacts."""
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import List, Dict


def sha256_file(filepath: Path) -> str:
    """Compute SHA256 hash of a file."""
    h = hashlib.sha256()
    with filepath.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def generate_manifest(
    artifacts_dir: str,
    output_path: str = "reports/manifest.json",
    sign: bool = False
) -> Dict:
    """Generate manifest with artifact hashes."""
    artifacts_path = Path(artifacts_dir)
    entries = []
    
    # Walk through all files in artifacts directory
    for root, _, files in os.walk(artifacts_path):
        for filename in files:
            filepath = Path(root) / filename
            relative_path = filepath.relative_to(artifacts_path)
            
            entries.append({
                "name": filename,
                "path": str(relative_path),
                "sha256": sha256_file(filepath),
                "size": filepath.stat().st_size
            })
    
    # Build manifest
    manifest = {
        "schema": "mirror.manifest.v1",
        "artifacts": entries
    }
    
    # Write manifest
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(manifest, indent=2))
    
    print(f"✓ Manifest written: {output_path}")
    print(f"  {len(entries)} artifacts cataloged")
    
    # Optional: Sign with cosign (keyless)
    if sign:
        try:
            sig_path = f"{output_path}.sig"
            subprocess.check_call(
                ["cosign", "sign-blob", "--yes", "--output-signature", sig_path, str(output)],
                env={**os.environ, "COSIGN_EXPERIMENTAL": "1"}
            )
            print(f"✓ Signed manifest: {sig_path}")
        except (FileNotFoundError, subprocess.CalledProcessError) as e:
            print(f"⚠ Cosign signing failed: {e}")
            print("  Install cosign for signature support: https://github.com/sigstore/cosign")
    
    return manifest


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_manifest.py <artifacts_dir> [output_path] [--sign]")
        sys.exit(1)
    
    artifacts_dir = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("--") else "reports/manifest.json"
    sign = "--sign" in sys.argv
    
    generate_manifest(artifacts_dir, output_path, sign)

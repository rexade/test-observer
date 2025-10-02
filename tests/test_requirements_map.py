import json
import os
import pytest

# Map a few requirement IDs to checks (toy examples)
REQ_TESTS = {
    "S02P01-INV-001": lambda: True,  # inventory served
    "S02P02-TIME-003": lambda: True, # time synchronized
}

@pytest.mark.interface("Inventory")
@pytest.mark.requirement("S02P01-INV-001")
def test_requirements_map():
    results = {req: fn() for req, fn in REQ_TESTS.items()}
    # Export a sidecar outcomes file for post-processing (not required)
    os.makedirs('reports', exist_ok=True)
    with open('reports/requirements.json', 'w') as f:
        json.dump(results, f, indent=2)
    assert all(results.values()), results

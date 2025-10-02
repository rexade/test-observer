# Requirements Tracking

This project implements comprehensive requirements tracking with per-module coverage visibility.

## Overview

Every test can be mapped to one or more requirements using pytest markers. The system automatically:
- Tracks which requirements are covered by passing tests
- Groups requirements by module and interface
- Calculates risk-weighted coverage
- Displays per-module coverage in the dashboard

## Marking Tests with Requirements

Use the `@pytest.mark.requirement()` decorator to map tests to requirement IDs:

```python
import pytest

@pytest.mark.interface("Inventory")
@pytest.mark.requirement("S02P01-INV-4.3.4")
def test_inventory_xstatus_format():
    """Verify xstatus field is ≤64 bytes"""
    assert len(xstatus) <= 64
```

### Multiple Requirements

A single test can satisfy multiple requirements:

```python
@pytest.mark.requirement("S02P01-INV-001")
@pytest.mark.requirement("S02P01-INV-7.1")
def test_service_discovery():
    """Verify mDNS service with required TXT fields"""
    # ...
```

## Automatic Property Export

The `conftest.py` hook automatically converts markers to junit properties, so you don't need to manually call `record_property()`. Just add the markers and run pytest as usual:

```bash
pytest --junitxml=reports/junit.xml
```

## Coverage Calculation

The `scripts/compute_quadrants.py` script processes the junit.xml and extracts:
- Which requirements were tested
- Pass/fail status for each requirement
- Coverage by module and interface

This data is sent to the API via `scripts/build_mirror_payload.py` which includes:
```json
{
  "coverage": {
    "requirement": 0.85,
    "temporal": 0.36,
    "interface": 0.91,
    "risk": 0.82,
    "by_requirement": [
      {"id": "S02P01-INV-001", "result": "pass"},
      {"id": "S02P02-TIME-003", "result": "pass"}
    ]
  }
}
```

## Requirements Registry

Requirements are stored in the `requirements` table with:
- `req_id`: Unique identifier (e.g., "S02P01-INV-4.3.4")
- `title`: Short description
- `description`: Detailed requirement text
- `module`: Module name (e.g., "VehicleToIP")
- `interface`: Interface name (e.g., "Inventory", "Time")
- `risk_weight`: Importance multiplier (0.0-1.0)

Example:
```sql
INSERT INTO requirements (req_id, title, module, interface, risk_weight) VALUES
  ('S02P01-INV-4.3.4', 'xstatus format and size', 'VehicleToIP', 'Inventory', 1.0),
  ('S02P02-TIME-003', 'SNTP offset tolerance', 'TimeService', 'Time', 1.0);
```

## Per-Module Coverage View

The dashboard shows coverage grouped by module:

```
VehicleToIP (Inventory)  ██████████████░░░░  8/10 reqs  80%
TimeService (Time)       ████████████████░░  4/5 reqs   80%
FMStoIP (FMStoIP)        ██████░░░░░░░░░░░░  3/8 reqs   37%
```

Risk-weighted coverage prioritizes critical requirements, so you can see at a glance which high-risk areas need attention.

## Adding New Requirements

1. **Define the requirement** in the database:
```sql
INSERT INTO requirements (project_id, req_id, title, module, interface, risk_weight)
VALUES (1, 'S02P03-FMS-2.1', 'FMS MQTT topics', 'FMStoIP', 'FMStoIP', 1.0);
```

2. **Mark your test**:
```python
@pytest.mark.requirement("S02P03-FMS-2.1")
def test_fms_mqtt_topics():
    # test implementation
```

3. **Run tests and push** - the requirement coverage will appear in the next run.

## Migration Helper

Use `scripts/update_test_markers.py` to scan existing tests and suggest markers to add.

## Best Practices

- **One requirement per test** is cleanest, but multiple are allowed
- Use **consistent naming** for modules and interfaces
- Set **risk_weight** based on failure impact (1.0 = critical, 0.5 = moderate, 0.3 = minor)
- Keep **requirement IDs** stable - they're used as primary keys in run_requirements
- Add **all tests** to the requirement map over time, not just critical ones

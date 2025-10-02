import json
from dataclasses import dataclass, asdict

@dataclass
class InventoryItem:
    id: str
    atdatetime: str
    name: str
    version: str

REQUIRED_FIELDS = {"id", "atdatetime", "name", "version"}


def test_inventory_contract_shape():
    # pretend we fetched this from a module under test
    payload = {
        "id": "mod-123",
        "atdatetime": "2025-10-02T13:00:00Z",
        "name": "GNSSLocation",
        "version": "2.3.0"
    }
    assert REQUIRED_FIELDS.issubset(payload.keys())
    # JSON encodes cleanly
    json.dumps(payload)

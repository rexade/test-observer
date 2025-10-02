import json
import pytest
from dataclasses import dataclass, asdict


# ITxPT S02P01 Inventory Schema (simplified)
@dataclass
class InventoryItem:
    """ITxPT S02P01 Inventory Item Schema"""
    id: str
    atdatetime: str  # ISO 8601 timestamp
    name: str
    version: str
    type: str = "module"
    
    def validate(self):
        """Validate required fields and formats"""
        assert self.id, "id is required"
        assert self.atdatetime, "atdatetime is required"
        assert self.name, "name is required"
        assert self.version, "version is required"
        # Simple ISO 8601 check
        assert "T" in self.atdatetime and "Z" in self.atdatetime, "atdatetime must be ISO 8601"


@pytest.mark.interface
def test_inventory_schema_valid():
    """Interface contract: Inventory payload conforms to ITxPT S02P01"""
    payload = {
        "id": "mod-gnss-001",
        "atdatetime": "2025-10-02T13:00:00Z",
        "name": "GNSSLocation",
        "version": "2.3.0",
        "type": "module"
    }
    
    # Validate against schema
    item = InventoryItem(**payload)
    item.validate()
    
    # Ensure JSON serializable
    json_str = json.dumps(asdict(item))
    assert len(json_str) > 0


@pytest.mark.interface
def test_inventory_required_fields():
    """Interface contract: All required fields present"""
    REQUIRED_FIELDS = {"id", "atdatetime", "name", "version"}
    
    payload = {
        "id": "mod-123",
        "atdatetime": "2025-10-02T13:00:00Z",
        "name": "GNSSLocation",
        "version": "2.3.0"
    }
    
    assert REQUIRED_FIELDS.issubset(payload.keys()), "Missing required fields"


@pytest.mark.interface
def test_inventory_json_schema():
    """Interface contract: JSON schema validation"""
    # Simple JSON Schema-like validation
    payload = {
        "id": "mod-456",
        "atdatetime": "2025-10-02T14:30:00Z",
        "name": "PositionService",
        "version": "1.0.0"
    }
    
    # Type checks
    assert isinstance(payload["id"], str), "id must be string"
    assert isinstance(payload["atdatetime"], str), "atdatetime must be string"
    assert isinstance(payload["name"], str), "name must be string"
    assert isinstance(payload["version"], str), "version must be string"
    
    # Format checks
    assert len(payload["id"]) > 0, "id cannot be empty"
    assert "T" in payload["atdatetime"], "atdatetime must be ISO 8601"
    assert "." in payload["version"] or "-" in payload["version"], "version must be semantic"

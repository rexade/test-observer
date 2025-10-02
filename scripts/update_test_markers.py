#!/usr/bin/env python3
"""
Helper script to add requirement markers to existing tests.
This is a one-time migration helper - you can delete it after use.

Usage:
  python scripts/update_test_markers.py

This will scan your tests and suggest markers to add.
"""

import re
from pathlib import Path

# Mapping of test names to requirement IDs (customize this)
TEST_TO_REQUIREMENT = {
    "test_inventory_contract_shape": "S02P01-INV-001",
    "test_inventory_required_fields": "S02P01-INV-4.3.4",
    "test_inventory_schema_valid": "S02P01-INV-4.3.4",
    "test_inventory_xsd_validation": "S02P01-INV-4.3.4",
    "test_inventory_json_schema": "S02P01-INV-4.3.4",
    "test_sntp_response_under_200ms": "S02P02-TIME-003",
    "test_database_query_latency": "S02P02-TIME-003",
    "test_api_response_time": "S02P02-TIME-003",
    "test_requirements_map": "S02P01-INV-001",  # example
}

def main():
    tests_dir = Path("tests")
    
    print("Scanning tests for marker suggestions...\n")
    
    for test_file in tests_dir.glob("test_*.py"):
        content = test_file.read_text()
        
        # Find all test functions
        test_funcs = re.findall(r'def (test_\w+)\(', content)
        
        for func_name in test_funcs:
            if func_name in TEST_TO_REQUIREMENT:
                req_id = TEST_TO_REQUIREMENT[func_name]
                
                # Check if marker already exists
                func_pattern = rf'def {func_name}\('
                func_match = re.search(func_pattern, content)
                if func_match:
                    # Look backwards for decorators
                    before_func = content[:func_match.start()]
                    lines_before = before_func.split('\n')
                    
                    # Check last few lines for markers
                    has_requirement = any('@pytest.mark.requirement' in line for line in lines_before[-5:])
                    has_interface = any('@pytest.mark.interface' in line for line in lines_before[-5:])
                    
                    if not has_requirement:
                        print(f"📝 {test_file.name}::{func_name}")
                        print(f"   Add: @pytest.mark.requirement('{req_id}')")
                        
                        if not has_interface:
                            # Suggest interface based on req_id
                            if 'INV' in req_id:
                                print(f"   Add: @pytest.mark.interface('Inventory')")
                            elif 'TIME' in req_id:
                                print(f"   Add: @pytest.mark.interface('Time')")
                        print()

if __name__ == '__main__':
    main()

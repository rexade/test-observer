"""Compute coverage quadrants from pytest junit XML output."""
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
import json
import sys


def extract_markers(testcase: ET.Element) -> set[str]:
    """Extract pytest markers from testcase element."""
    marks = set()
    
    # Try to get markers from properties (if pytest-junitxml configured)
    for prop in testcase.findall(".//properties/property"):
        if prop.attrib.get("name") == "markers":
            marks.update(prop.attrib.get("value", "").split(","))
    
    # Fallback: infer from classname/name
    text = (
        testcase.attrib.get("classname", "") + 
        "::" + 
        testcase.attrib.get("name", "")
    ).lower()
    
    for marker in ("interface", "temporal", "risk", "requirement"):
        if marker in text:
            marks.add(marker)
    
    return marks


def compute_quadrants(junit_path: str) -> dict:
    """Parse junit.xml and compute coverage quadrants."""
    tree = ET.parse(junit_path)
    
    total = 0
    passed = 0
    quadrants = Counter()
    by_requirement = defaultdict(lambda: {"pass": 0, "fail": 0})
    
    for testcase in tree.iter("testcase"):
        total += 1
        
        # Check if test failed
        failed = (
            testcase.find("failure") is not None or 
            testcase.find("error") is not None
        )
        
        if not failed:
            passed += 1
        
        # Extract markers
        marks = extract_markers(testcase)
        
        # Count by quadrant
        if "interface" in marks:
            quadrants["interface"] += 1
        if "temporal" in marks:
            quadrants["temporal"] += 1
        if "risk" in marks:
            quadrants["risk"] += 1
        
        # Track requirement coverage
        for prop in testcase.findall(".//properties/property"):
            if prop.attrib.get("name") == "requirement_id":
                req_id = prop.attrib.get("value")
                status = "pass" if not failed else "fail"
                by_requirement[req_id][status] += 1
                quadrants["requirement"] += 1
    
    # Compute normalized scores [0..1]
    pass_rate = passed / total if total > 0 else 0.0
    
    return {
        "total": total,
        "passed": passed,
        "pass_rate": pass_rate,
        "quadrants": {
            "requirement": quadrants.get("requirement", 0) / total if total > 0 else 0.0,
            "temporal": quadrants.get("temporal", 0) / total if total > 0 else 0.0,
            "interface": quadrants.get("interface", 0) / total if total > 0 else 0.0,
            "risk": quadrants.get("risk", 0) / total if total > 0 else 0.5,
        },
        "requirements": dict(by_requirement),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python compute_quadrants.py <junit.xml>")
        sys.exit(1)
    
    result = compute_quadrants(sys.argv[1])
    print(json.dumps(result, indent=2))

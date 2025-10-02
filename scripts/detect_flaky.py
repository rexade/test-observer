"""Detect flaky tests by tracking outcome history across runs."""
import json
import os
import xml.etree.ElementTree as ET
from collections import deque, defaultdict
from pathlib import Path
from typing import Dict, List


HISTORY_FILE = Path("reports/test_history.json")
FLAKY_FILE = Path("reports/flaky_tests.json")
WINDOW_SIZE = 10  # Track last N test runs


def parse_junit(junit_path: str) -> List[tuple[str, str]]:
    """Extract test outcomes from junit XML."""
    tree = ET.parse(junit_path)
    results = []
    
    for testcase in tree.iter("testcase"):
        classname = testcase.attrib.get("classname", "")
        name = testcase.attrib.get("name", "")
        test_id = f"{classname}.{name}"
        
        # Determine outcome
        if testcase.find("failure") is not None:
            outcome = "fail"
        elif testcase.find("error") is not None:
            outcome = "error"
        elif testcase.find("skipped") is not None:
            outcome = "skip"
        else:
            outcome = "pass"
        
        results.append((test_id, outcome))
    
    return results


def update_history(junit_path: str) -> Dict[str, List[str]]:
    """Update test outcome history."""
    # Load existing history
    history = defaultdict(lambda: deque(maxlen=WINDOW_SIZE))
    
    if HISTORY_FILE.exists():
        stored = json.loads(HISTORY_FILE.read_text())
        for test_id, outcomes in stored.items():
            history[test_id] = deque(outcomes, maxlen=WINDOW_SIZE)
    
    # Add new outcomes
    for test_id, outcome in parse_junit(junit_path):
        history[test_id].append(outcome)
    
    # Save updated history
    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    HISTORY_FILE.write_text(
        json.dumps({k: list(v) for k, v in history.items()}, indent=2)
    )
    
    return history


def detect_flaky(history: Dict[str, deque]) -> Dict[str, float]:
    """Detect flaky tests based on outcome variability."""
    flaky_tests = {}
    
    for test_id, outcomes in history.items():
        if len(outcomes) < 4:
            # Need at least 4 runs to detect flakiness
            continue
        
        # Count transitions between different outcomes
        transitions = sum(
            1 for a, b in zip(outcomes, list(outcomes)[1:]) 
            if a != b
        )
        
        # Flakiness score: ratio of transitions to total runs
        flakiness = transitions / (len(outcomes) - 1)
        
        # Only flag if flakiness > 20% (i.e., at least 1 flip in 5 runs)
        if flakiness > 0.2:
            flaky_tests[test_id] = round(flakiness, 3)
    
    return flaky_tests


def main(junit_path: str):
    """Main entry point."""
    print(f"Analyzing test outcomes from {junit_path}...")
    
    # Update history
    history = update_history(junit_path)
    print(f"✓ Updated history for {len(history)} tests")
    
    # Detect flaky tests
    flaky = detect_flaky(history)
    
    # Save flaky test report
    FLAKY_FILE.write_text(json.dumps(flaky, indent=2))
    
    if flaky:
        print(f"\n⚠ Detected {len(flaky)} flaky tests:")
        for test_id, score in sorted(flaky.items(), key=lambda x: -x[1])[:10]:
            print(f"  - {test_id}: {score:.1%} flakiness")
    else:
        print("✓ No flaky tests detected")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python detect_flaky.py <junit.xml>")
        sys.exit(1)
    
    main(sys.argv[1])

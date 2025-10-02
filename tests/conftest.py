"""
pytest configuration to automatically map markers to junit properties.
This enables requirement tracing without per-test boilerplate.
"""

def pytest_runtest_makereport(item, call):
    """
    Hook that runs after each test to extract markers and add them as junit properties.
    Only processes after the test call phase (not setup/teardown).
    """
    # Only tag after the test actually ran
    if call.when != "call":
        return
    
    # Extract requirement marker and add as property
    for marker in item.iter_markers(name="requirement"):
        if marker.args:
            item.user_properties.append(("requirement_id", marker.args[0]))
            break
    
    # Extract interface marker and add as property
    for marker in item.iter_markers(name="interface"):
        if marker.args:
            item.user_properties.append(("interface", marker.args[0]))
            break
    
    # Extract module marker if present
    for marker in item.iter_markers(name="module"):
        if marker.args:
            item.user_properties.append(("module", marker.args[0]))
            break

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
    rid = next((m.args[0] for m in item.iter_markers(name="requirement")), None)
    if rid:
        item.user_properties.append(("requirement_id", rid))
    
    # Extract interface marker and add as property
    iface = next((m.args[0] for m in item.iter_markers(name="interface")), None)
    if iface:
        item.user_properties.append(("interface", iface))
    
    # Extract module marker if present
    module = next((m.args[0] for m in item.iter_markers(name="module")), None)
    if module:
        item.user_properties.append(("module", module))

import time

def test_addition():
    assert 1 + 1 == 2


def test_timing_guarantee():
    # simple temporal oracle demo: operation completes within 50ms
    start = time.perf_counter()
    sum(range(1000))
    elapsed_ms = (time.perf_counter() - start) * 1000
    assert elapsed_ms < 50, f"Operation too slow: {elapsed_ms:.2f}ms"

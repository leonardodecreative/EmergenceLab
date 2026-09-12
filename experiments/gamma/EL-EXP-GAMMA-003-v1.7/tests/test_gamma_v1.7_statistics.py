#!/usr/bin/env python3
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "runners"))
from gamma_v1_7_aggregate import exact_two_sided_sign_test


def main() -> None:
    assert exact_two_sided_sign_test([1.0] * 30)["twoSidedPValue"] == 2.0 / (2 ** 30)
    tied = exact_two_sided_sign_test([0.0] * 30)
    assert tied["effectiveN"] == 0 and tied["twoSidedPValue"] == 1.0
    balanced = exact_two_sided_sign_test([1.0, -1.0] * 15)
    assert math.isclose(balanced["twoSidedPValue"], 1.0)
    print("PASS exact sign-test reference cases")


if __name__ == "__main__":
    main()


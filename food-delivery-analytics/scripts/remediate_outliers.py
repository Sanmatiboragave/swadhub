"""Apply remediation for flagged outliers: options to cap or mark for review.
"""
from pathlib import Path
import json
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
SQL_DIR = ROOT / "data" / "sql_ready"
VALID_DIR = ROOT / "data" / "validation"


def load_flags():
    f = VALID_DIR / "suggested_fixes.json"
    if not f.exists():
        print("no suggested_fixes.json found")
        return []
    data = json.loads(f.read_text(encoding="utf-8"))
    return data.get("order_outliers", [])


def remediate(cap=True):
    flags = load_flags()
    if not flags:
        return
    orders_p = SQL_DIR / "orders.csv"
    if not orders_p.exists():
        print("orders.csv not found in sql_ready — run data_cleaning_extended first")
        return
    orders = pd.read_csv(orders_p)
    flagged_ids = {int(f["order_id"]): f for f in flags}

    # compute IQR upper bound to cap if needed
    s = orders["total_amount"].dropna()
    q1 = s.quantile(0.25)
    q3 = s.quantile(0.75)
    iqr = q3 - q1
    upper = q3 + 1.5 * iqr

    out_rows = []
    for oid, info in flagged_ids.items():
        mask = orders["order_id"] == oid
        if not mask.any():
            continue
        if cap:
            orders.loc[mask, "total_amount"] = min(float(info["total_amount"]), float(upper))
            orders.loc[mask, "remediation"] = "capped_to_upper"
        else:
            orders.loc[mask, "remediation"] = "manual_review"
        out_rows.append(int(oid))

    out = SQL_DIR / "orders_remediated.csv"
    orders.to_csv(out, index=False)
    print(f"wrote remediated orders to {out}; remediated ids: {out_rows}")


if __name__ == "__main__":
    remediate(cap=True)

from pathlib import Path
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


ROOT = Path(__file__).resolve().parents[2]
CLEAN_DIR = ROOT / "food-delivery-analytics" / "data" / "cleaned"
VALID_DIR = ROOT / "food-delivery-analytics" / "data" / "validation"
FIG_DIR = VALID_DIR / "figures"


def ensure_dirs():
    FIG_DIR.mkdir(parents=True, exist_ok=True)


def load_validation():
    rpt = VALID_DIR / "validation_report.json"
    if rpt.exists():
        with open(rpt, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return {}


def load_cleaned():
    files = ["customers.csv", "orders.csv", "order_items.csv", "restaurants.csv", "reviews.csv"]
    dfs = {}
    for f in files:
        p = CLEAN_DIR / f
        if p.exists():
            dfs[f.replace('.csv','')] = pd.read_csv(p)
    return dfs


def orders_over_time(orders: pd.DataFrame):
    orders["order_timestamp"] = pd.to_datetime(orders["order_timestamp"], errors="coerce")
    daily = orders.set_index("order_timestamp").resample("D").size()
    plt.figure(figsize=(10,4))
    daily.plot()
    plt.title("Orders per day")
    plt.tight_layout()
    out = FIG_DIR / "orders_per_day.png"
    plt.savefig(out)
    plt.close()
    print(f"wrote {out}")


def order_value_dist(orders: pd.DataFrame):
    plt.figure(figsize=(6,4))
    sns.histplot(orders["total_amount"].dropna(), bins=50)
    plt.title("Order total amount distribution")
    out = FIG_DIR / "order_value_dist.png"
    plt.tight_layout()
    plt.savefig(out)
    plt.close()
    print(f"wrote {out}")


def top_restaurants(orders: pd.DataFrame):
    top = orders["restaurant_id"].value_counts().head(10)
    out = VALID_DIR / "top_10_restaurants.csv"
    top.to_csv(out, header=["order_count"]) if not out.exists() else top.to_csv(out)
    print(f"wrote {out}")
    return top


def flag_order_outliers(orders: pd.DataFrame, k=1.5):
    col = "total_amount"
    s = orders[col].dropna()
    q1 = s.quantile(0.25)
    q3 = s.quantile(0.75)
    iqr = q3 - q1
    lower = q1 - k * iqr
    upper = q3 + k * iqr
    mask = (orders[col] < lower) | (orders[col] > upper)
    flagged = orders[mask].copy()
    flagged["flag_reason"] = np.where(flagged[col] > upper, "high_outlier", "low_outlier")
    print(f"flagged {len(flagged)} outlier orders")
    return flagged[["order_id", col, "flag_reason"]]


def main():
    ensure_dirs()
    validation = load_validation()
    print("validation report keys:", list(validation.keys()))

    dfs = load_cleaned()
    for name, df in dfs.items():
        print(f"{name}: rows={len(df)}, columns={df.shape[1]}")
        print(df.head(2).to_string(index=False))

    if "orders" in dfs:
        orders_over_time(dfs["orders"])
        order_value_dist(dfs["orders"])
        top_restaurants(dfs["orders"])
        flagged = flag_order_outliers(dfs["orders"]) 
        fixes = VALID_DIR / "suggested_fixes.json"
        flagged.to_dict(orient="records")
        with open(fixes, "w", encoding="utf-8") as fh:
            json.dump({"order_outliers": flagged.to_dict(orient="records")}, fh, indent=2)
        print(f"wrote suggested fixes: {fixes}")


if __name__ == "__main__":
    main()

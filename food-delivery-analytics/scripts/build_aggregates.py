"""Compute aggregation tables from sql_ready CSVs and write to data/aggregates."""
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SQL_DIR = ROOT / "data" / "sql_ready"
AGG_DIR = ROOT / "data" / "aggregates"


def ensure_dirs():
    AGG_DIR.mkdir(parents=True, exist_ok=True)


def load_orders():
    # prefer remediated version
    p = SQL_DIR / "orders_remediated.csv"
    if not p.exists():
        p = SQL_DIR / "orders.csv"
    return pd.read_csv(p, parse_dates=["order_timestamp"], infer_datetime_format=True)


def daily_metrics(orders: pd.DataFrame):
    df = orders.copy()
    df["date"] = pd.to_datetime(df["order_timestamp"]).dt.date
    daily = df.groupby("date").agg(orders_count=("order_id","count"),
                                     revenue=("total_amount","sum"),
                                     avg_order=("total_amount","mean"))
    out = AGG_DIR / "daily_orders.csv"
    daily.to_csv(out)
    print(f"wrote {out}")
    return daily


def revenue_by_restaurant(orders: pd.DataFrame):
    r = orders.groupby("restaurant_id").agg(order_count=("order_id","count"), revenue=("total_amount","sum"))
    r = r.sort_values("revenue", ascending=False)
    out = AGG_DIR / "revenue_by_restaurant.csv"
    r.to_csv(out)
    print(f"wrote {out}")
    return r


def top_customers(orders: pd.DataFrame, top_n=50):
    t = orders.groupby("customer_id").agg(order_count=("order_id","count"), spend=("total_amount","sum"))
    t = t.sort_values("spend", ascending=False).head(top_n)
    out = AGG_DIR / "top_customers.csv"
    t.to_csv(out)
    print(f"wrote {out}")
    return t


def avg_order_value_by_day(orders: pd.DataFrame):
    df = orders.copy()
    df["date"] = pd.to_datetime(df["order_timestamp"]).dt.date
    a = df.groupby("date").agg(avg_order_value=("total_amount","mean"))
    out = AGG_DIR / "avg_order_value_by_day.csv"
    a.to_csv(out)
    print(f"wrote {out}")
    return a


def main():
    ensure_dirs()
    orders = load_orders()
    daily_metrics(orders)
    revenue_by_restaurant(orders)
    top_customers(orders)
    avg_order_value_by_day(orders)


if __name__ == "__main__":
    main()

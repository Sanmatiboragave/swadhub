"""Extended data cleaning: address normalization, phone/email validation,
numeric range checks, and export SQL-ready CSVs.
"""
from pathlib import Path
import re
import json
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
CLEAN_DIR = ROOT / "data" / "cleaned"
SQL_DIR = ROOT / "data" / "sql_ready"
VALID_DIR = ROOT / "data" / "validation"


def ensure_dirs():
    SQL_DIR.mkdir(parents=True, exist_ok=True)


_street_map = {
    r"\bstreet\b": "st",
    r"\bavenue\b": "ave",
    r"\broad\b": "rd",
    r"\bdrive\b": "dr",
    r"\bapartment\b": "apt",
}


def normalize_address(addr):
    if pd.isna(addr):
        return addr
    s = str(addr).strip().lower()
    s = re.sub(r"\s+", " ", s)
    for k, v in _street_map.items():
        s = re.sub(k, v, s)
    return s


def validate_email(email):
    if pd.isna(email):
        return None
    e = str(email).strip().lower()
    if re.match(r"[^@\s]+@[^@\s]+\.[^@\s]+", e):
        return e
    return None


def validate_phone(phone):
    if pd.isna(phone):
        return None
    s = re.sub(r"[^0-9+]", "", str(phone))
    # very basic check: keep if 7-15 digits
    digits = re.sub(r"[^0-9]", "", s)
    if 7 <= len(digits) <= 15:
        return s
    return None


def clamp_ratings(df):
    if "rating" in df.columns:
        df["rating"] = pd.to_numeric(df["rating"], errors="coerce")
        df.loc[df["rating"] < 1, "rating"] = 1
        df.loc[df["rating"] > 5, "rating"] = 5
    return df


def clamp_prices(df, cols):
    for c in cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")
            df.loc[df[c] < 0, c] = 0.0
    return df


def export_sql_ready(df: pd.DataFrame, name: str, index=False):
    out = SQL_DIR / f"{name}.csv"
    df.to_csv(out, index=index)
    return out


def process():
    ensure_dirs()
    # customers
    cust_p = CLEAN_DIR / "customers.csv"
    if cust_p.exists():
        c = pd.read_csv(cust_p)
        c["email"] = c.get("email").apply(validate_email) if "email" in c.columns else c.get("email")
        c["phone"] = c.get("phone").apply(validate_phone) if "phone" in c.columns else c.get("phone")
        c["city"] = c.get("city").astype(str).str.lower().str.strip()
        export_sql_ready(c, "customers")
        print(f"exported customers -> {SQL_DIR / 'customers.csv'}")

    # orders
    orders_p = CLEAN_DIR / "orders.csv"
    if orders_p.exists():
        o = pd.read_csv(orders_p)
        if "delivery_address" in o.columns:
            o["delivery_address_norm"] = o["delivery_address"].apply(normalize_address)
        o = clamp_prices(o, ["subtotal", "delivery_fee", "tax_amount", "total_amount", "discount_amount"])
        export_sql_ready(o, "orders")
        print(f"exported orders -> {SQL_DIR / 'orders.csv'}")

    # restaurants
    r_p = CLEAN_DIR / "restaurants.csv"
    if r_p.exists():
        r = pd.read_csv(r_p)
        r = clamp_ratings(r)
        export_sql_ready(r, "restaurants")
        print(f"exported restaurants -> {SQL_DIR / 'restaurants.csv'}")

    # order_items
    oi_p = CLEAN_DIR / "order_items.csv"
    if oi_p.exists():
        oi = pd.read_csv(oi_p)
        oi = clamp_prices(oi, ["unit_price", "total_price", "discount"]) if not oi.empty else oi
        export_sql_ready(oi, "order_items")
        print(f"exported order_items -> {SQL_DIR / 'order_items.csv'}")


if __name__ == "__main__":
    process()

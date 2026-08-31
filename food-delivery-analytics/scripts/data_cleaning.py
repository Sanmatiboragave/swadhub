import os
import re
import json
from pathlib import Path
import pandas as pd


RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
CLEAN_DIR = Path(__file__).resolve().parents[1] / "data" / "cleaned"
VALID_DIR = Path(__file__).resolve().parents[1] / "data" / "validation"


def ensure_dirs():
    CLEAN_DIR.mkdir(parents=True, exist_ok=True)
    VALID_DIR.mkdir(parents=True, exist_ok=True)


def standardize_email(email):
    if pd.isna(email):
        return email
    email = str(email).strip().lower()
    return email if re.match(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) else None


def standardize_phone(phone):
    if pd.isna(phone):
        return phone
    s = re.sub(r"[^0-9+]", "", str(phone))
    # keep local numbers as-is if short
    if len(s) < 7:
        return s
    return s


def summarize_df(df: pd.DataFrame):
    summary = {
        "rows": int(len(df)),
        "columns": int(df.shape[1]),
        "duplicates": int(df.duplicated().sum()),
        "missing_by_column": {},
    }
    for col in df.columns:
        missing = int(df[col].isna().sum())
        pct = round(100 * missing / max(1, len(df)), 2)
        summary["missing_by_column"][col] = {"missing": missing, "pct": pct}
    return summary


def clean_customers(path: Path):
    df = pd.read_csv(path)
    df = df.drop_duplicates()
    # Trim whitespace for string columns
    for c in df.select_dtypes(["object"]).columns:
        df[c] = df[c].astype(str).str.strip().replace({'nan': pd.NA})

    if "email" in df.columns:
        df["email"] = df["email"].apply(standardize_email)

    if "phone" in df.columns:
        df["phone"] = df["phone"].apply(standardize_phone)

    # Parse dates where present
    for dcol in ["date_of_birth", "signup_date", "last_order_date"]:
        if dcol in df.columns:
            df[dcol] = pd.to_datetime(df[dcol], errors="coerce")

    out = CLEAN_DIR / path.name
    df.to_csv(out, index=False)
    return df


def clean_generic(path: Path):
    df = pd.read_csv(path)
    df = df.drop_duplicates()
    for c in df.select_dtypes(["object"]).columns:
        df[c] = df[c].astype(str).str.strip().replace({'nan': pd.NA})
    # Try to coerce obvious date columns
    for col in df.columns:
        if col.endswith("date") or col.endswith("_date"):
            df[col] = pd.to_datetime(df[col], errors="coerce")
    out = CLEAN_DIR / path.name
    df.to_csv(out, index=False)
    return df


def run_cleaning(raw_dir: Path = RAW_DIR):
    ensure_dirs()
    report = {}
    files = sorted([p for p in raw_dir.glob("*.csv")])
    if not files:
        print(f"No raw CSVs found in {raw_dir}")
        return

    for f in files:
        key = f.stem
        try:
            if key == "customers":
                df = clean_customers(f)
            else:
                df = clean_generic(f)
            report[key] = summarize_df(df)
            print(f"cleaned {f.name}: {len(df)} rows")
        except Exception as e:
            report[key] = {"error": str(e)}
            print(f"error cleaning {f.name}: {e}")

    # Write validation report
    out_json = VALID_DIR / "validation_report.json"
    with open(out_json, "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2, default=str)
    print(f"wrote validation report: {out_json}")


if __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser(description="Clean raw CSVs and produce cleaned CSVs + validation report")
    p.add_argument("--raw-dir", default=str(RAW_DIR), help="path to raw CSVs")
    p.add_argument("--out-dir", default=str(CLEAN_DIR), help="output cleaned dir (ignored, uses project layout)")
    args = p.parse_args()
    run_cleaning(Path(args.raw_dir))

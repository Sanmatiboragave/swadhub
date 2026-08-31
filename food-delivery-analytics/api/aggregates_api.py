from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import pandas as pd
import sqlite3
import json
from typing import List
from pydantic import BaseModel

app = FastAPI(title="Aggregates API")

# Allow CORS for local dashboard/testing (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT = Path(__file__).resolve().parents[1]
AGG_DIR = ROOT / "data" / "aggregates"

# Mount dashboard static files at /dashboard
dashboard_dir = ROOT / "dashboard"
if dashboard_dir.exists():
    app.mount("/dashboard", StaticFiles(directory=str(dashboard_dir), html=True), name="dashboard")

# Simple SQLite DB for demo orders
DB_PATH = ROOT / "data" / "orders.db"


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT,
            customer_email TEXT,
            customer_phone TEXT,
            delivery_address TEXT,
            subtotal REAL,
            delivery_fee REAL,
            tax_amount REAL,
            total_amount REAL,
            payment_method TEXT,
            status TEXT DEFAULT 'placed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            item_id TEXT,
            name TEXT,
            qty INTEGER,
            unit_price REAL,
            total_price REAL,
            FOREIGN KEY(order_id) REFERENCES orders(order_id)
        )
        """
    )
    conn.commit()
    conn.close()

    # additional tables for users, sessions, carts, payments
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            email TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS carts (
            token TEXT PRIMARY KEY,
            cart_json TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS payments (
            payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            amount REAL,
            method TEXT,
            status TEXT,
            transaction_ref TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    conn.close()


init_db()


def ensure_orders_userid_column():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(orders)")
    cols = [r[1] for r in cur.fetchall()]
    if 'user_id' not in cols:
        try:
            cur.execute("ALTER TABLE orders ADD COLUMN user_id INTEGER")
            conn.commit()
        except Exception:
            pass
    conn.close()


ensure_orders_userid_column()


class OrderItem(BaseModel):
    id: str
    name: str
    qty: int
    price: float


class CheckoutPayload(BaseModel):
    customer_name: str
    customer_email: str = None
    customer_phone: str = None
    delivery_address: str = None
    payment_method: str = "card"
    items: List[OrderItem]


@app.get("/order/menu")
def get_menu():
    # Try to load menu from SQL-ready food_items, fallback to demo menu file
    csv_p = ROOT / "data" / "sql_ready" / "food_items.csv"
    if csv_p.exists():
        df = pd.read_csv(csv_p)
        items = df[["food_id", "food_name", "price", "cuisine"]].head(100).to_dict(orient="records")
        return items
    # fallback small menu
    demo = [
        {"id": "m1", "name": "Margherita Pizza", "desc": "Classic tomato, mozzarella, basil", "price": 9.5},
        {"id": "m2", "name": "Spicy Chicken Wings", "desc": "6 pcs, hot & crispy", "price": 7.0},
    ]
    return demo


@app.post("/order/checkout")
def checkout(payload: CheckoutPayload, token: str = None):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    subtotal = sum([it.qty * it.price for it in payload.items])
    delivery_fee = 3.99
    tax = round(subtotal * 0.07, 2)
    total = round(subtotal + delivery_fee + tax, 2)
    # if token corresponds to user session, attach user_id
    user_id = None
    if token:
        cur.execute("SELECT user_id FROM sessions WHERE token=?", (token,))
        r = cur.fetchone()
        if r:
            user_id = r[0]

    if user_id is not None:
        cur.execute(
            "INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, subtotal, delivery_fee, tax_amount, total_amount, payment_method, user_id) VALUES (?,?,?,?,?,?,?,?,?,?)",
            (payload.customer_name, payload.customer_email, payload.customer_phone, payload.delivery_address, subtotal, delivery_fee, tax, total, payload.payment_method, user_id),
        )
    else:
        cur.execute(
            "INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, subtotal, delivery_fee, tax_amount, total_amount, payment_method) VALUES (?,?,?,?,?,?,?,?,?)",
            (payload.customer_name, payload.customer_email, payload.customer_phone, payload.delivery_address, subtotal, delivery_fee, tax, total, payload.payment_method),
        )
    order_id = cur.lastrowid
    for it in payload.items:
        cur.execute(
            "INSERT INTO order_items (order_id, item_id, name, qty, unit_price, total_price) VALUES (?,?,?,?,?,?)",
            (order_id, it.id, it.name, it.qty, it.price, it.qty * it.price),
        )
    conn.commit()
    conn.close()
    return {"order_id": order_id, "status": "placed", "total": total}


@app.get('/user/orders')
def user_orders(token: str = None):
    if not token:
        raise HTTPException(status_code=401, detail='missing token')
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT user_id FROM sessions WHERE token=?', (token,))
    r = cur.fetchone()
    if not r:
        conn.close()
        raise HTTPException(status_code=401, detail='invalid session')
    user_id = r[0]
    cur.execute('SELECT order_id, customer_name, total_amount, status, created_at FROM orders WHERE user_id=? ORDER BY created_at DESC', (user_id,))
    orders = []
    rows = cur.fetchall()
    for row in rows:
        oid = row[0]
        cur.execute('SELECT item_id, name, qty, unit_price, total_price FROM order_items WHERE order_id=?', (oid,))
        items = [ { 'item_id': it[0], 'name': it[1], 'qty': it[2], 'unit_price': it[3], 'total_price': it[4] } for it in cur.fetchall() ]
        orders.append({ 'order_id': oid, 'customer_name': row[1], 'total': row[2], 'status': row[3], 'created_at': row[4], 'items': items })
    conn.close()
    return { 'orders': orders }


@app.get("/order/status/{order_id}")
def order_status(order_id: int):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT order_id, customer_name, total_amount, status, created_at FROM orders WHERE order_id=?", (order_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="order not found")
    return {"order_id": row[0], "customer_name": row[1], "total": row[2], "status": row[3], "created_at": row[4]}


@app.post("/auth/register")
def register(username: str, password: str, email: str = None):
    import hashlib
    ph = hashlib.sha256(password.encode('utf-8')).hexdigest()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (username, password_hash, email) VALUES (?,?,?)", (username, ph, email))
        conn.commit()
        uid = cur.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="username already exists")
    conn.close()
    return {"user_id": uid, "username": username}


@app.post("/auth/login")
def login(username: str, password: str):
    import hashlib, secrets
    ph = hashlib.sha256(password.encode('utf-8')).hexdigest()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT user_id FROM users WHERE username=? AND password_hash=?", (username, ph))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=401, detail="invalid credentials")
    user_id = row[0]
    token = secrets.token_hex(16)
    cur.execute("INSERT INTO sessions (token, user_id) VALUES (?,?)", (token, user_id))
    conn.commit()
    conn.close()
    return {"token": token}


@app.get("/cart")
def get_cart(token: str = None):
    # token may be passed as query param or header in frontend
    from fastapi import Request
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    if not token:
        conn.close()
        return {"cart": {}}
    # if token maps to a session, prefer storing cart by user_id
    cur.execute("SELECT user_id FROM sessions WHERE token=?", (token,))
    s = cur.fetchone()
    storage_key = token
    if s:
        storage_key = f"user:{s[0]}"
    cur.execute("SELECT cart_json FROM carts WHERE token=?", (storage_key,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return {"cart": {}}
    return {"cart": json.loads(row[0])}


@app.post("/cart")
def save_cart(payload: dict):
    # payload should include token and cart
    token = payload.get('token')
    cart = payload.get('cart', {})
    if not token:
        raise HTTPException(status_code=400, detail="missing token")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    # if token corresponds to a logged-in user, store cart under user:{user_id}
    cur.execute("SELECT user_id FROM sessions WHERE token=?", (token,))
    s = cur.fetchone()
    storage_key = token
    if s:
        storage_key = f"user:{s[0]}"
    cur.execute("REPLACE INTO carts (token, cart_json, updated_at) VALUES (?,?,CURRENT_TIMESTAMP)", (storage_key, json.dumps(cart)))
    conn.commit()
    conn.close()
    return {"saved": True, "key": storage_key}


@app.post("/payment/process")
def process_payment(order_id: int, amount: float, method: str = "card"):
    # simulate payment with small failure chance, record transaction and return receipt id
    import secrets, random
    tx = secrets.token_hex(8)
    status = 'success' if random.random() > 0.1 else 'failed'
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO payments (order_id, amount, method, status, transaction_ref) VALUES (?,?,?,?,?)", (order_id, amount, method, status, tx))
    pid = cur.lastrowid
    conn.commit()
    conn.close()
    return {"status": status, "transaction_ref": tx, "payment_id": pid}


@app.get('/payment/receipt/{payment_id}')
def payment_receipt(payment_id: int):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT payment_id, order_id, amount, method, status, transaction_ref, created_at FROM payments WHERE payment_id=?', (payment_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail='payment not found')
    return {
        'payment_id': row[0], 'order_id': row[1], 'amount': row[2], 'method': row[3], 'status': row[4], 'transaction_ref': row[5], 'created_at': row[6]
    }


def read_csv(name: str):
    p = AGG_DIR / name
    if not p.exists():
        raise HTTPException(status_code=404, detail=f"{name} not found")
    return pd.read_csv(p)


@app.get("/aggregates/daily")
def aggregates_daily():
    df = read_csv("daily_orders.csv")
    return df.to_dict(orient="records")


@app.get("/aggregates/top-restaurants")
def aggregates_top_restaurants():
    df = read_csv("revenue_by_restaurant.csv")
    return df.head(50).to_dict(orient="records")


@app.get("/aggregates/top-customers")
def aggregates_top_customers():
    df = read_csv("top_customers.csv")
    return df.to_dict(orient="records")


@app.get("/aggregates/download/{filename}")
def download_aggregate(filename: str):
    p = AGG_DIR / filename
    if not p.exists():
        raise HTTPException(status_code=404, detail="file not found")
    return FileResponse(p)

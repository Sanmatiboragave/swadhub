# Importing SQL-ready CSVs into Postgres

This file contains suggested DDL and COPY commands to import the `data/sql_ready` CSVs into a Postgres database.

Notes
- Replace `<DB_NAME>`, `<DB_USER>`, and `<SCHEMA>` below with your values.
- Run `psql` as a user with proper privileges, or use `pgadmin`/`pgcli`.
- CSVs in `data/sql_ready/` are comma-separated, with header row.

Example DDL (simple):

```sql
CREATE TABLE IF NOT EXISTS customers (
  customer_id bigint PRIMARY KEY,
  first_name text,
  last_name text,
  email text,
  phone text,
  gender text,
  date_of_birth date,
  city text,
  signup_date timestamptz,
  customer_segment text,
  preferred_cuisine text,
  total_orders integer,
  total_spend numeric,
  average_order_value numeric,
  last_order_date timestamptz
);

CREATE TABLE IF NOT EXISTS restaurants (
  restaurant_id bigint PRIMARY KEY,
  restaurant_name text,
  description text,
  city text,
  area text,
  cuisine text,
  rating numeric,
  number_of_reviews integer,
  average_price numeric,
  delivery_time_minutes integer,
  distance_km numeric,
  commission_rate numeric,
  restaurant_status text
);

CREATE TABLE IF NOT EXISTS orders (
  order_id bigint PRIMARY KEY,
  customer_id bigint,
  restaurant_id bigint,
  order_timestamp timestamptz,
  order_status text,
  subtotal numeric,
  discount_amount numeric,
  delivery_fee numeric,
  tax_amount numeric,
  total_amount numeric,
  payment_method text,
  delivery_address text,
  estimated_delivery_time timestamptz,
  actual_delivery_time timestamptz,
  cancellation_reason text
);

CREATE TABLE IF NOT EXISTS order_items (
  order_id bigint,
  food_id bigint,
  quantity integer,
  unit_price numeric,
  discount numeric,
  total_price numeric
);
```

COPY commands (run in `psql`):

```sql
\copy customers FROM 'path/to/food-delivery-analytics/data/sql_ready/customers.csv' WITH (FORMAT csv, HEADER true)
\copy restaurants FROM 'path/to/food-delivery-analytics/data/sql_ready/restaurants.csv' WITH (FORMAT csv, HEADER true)
\copy orders FROM 'path/to/food-delivery-analytics/data/sql_ready/orders_remediated.csv' WITH (FORMAT csv, HEADER true)
\copy order_items FROM 'path/to/food-delivery-analytics/data/sql_ready/order_items.csv' WITH (FORMAT csv, HEADER true)
```

Optional: create indexes after import for performance:

```sql
CREATE INDEX idx_orders_timestamp ON orders (order_timestamp);
CREATE INDEX idx_orders_restaurant ON orders (restaurant_id);
CREATE INDEX idx_orders_customer ON orders (customer_id);
```

If you want, I can generate an Alembic migration file to manage schema creation programmatically.

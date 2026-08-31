-- Initial schema placeholder for Phase 2. Detailed CREATE TABLE statements will be added in Phase 2.
-- PostgreSQL schema for Food Delivery Analytics (Phase 2)
-- Includes tables, primary/foreign keys, constraints and common indexes
-- Run with: psql -d yourdb -f schema.sql

-- Extensions (optional but useful)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ORDER STATUS domain values (enforced through CHECK)

-- Customers
CREATE TABLE IF NOT EXISTS customers (
	customer_id BIGSERIAL PRIMARY KEY,
	first_name TEXT,
	last_name TEXT,
	email TEXT UNIQUE,
	phone TEXT,
	gender VARCHAR(16),
	date_of_birth DATE,
	city TEXT,
	signup_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
	customer_segment TEXT,
	preferred_cuisine TEXT,
	total_orders INTEGER DEFAULT 0,
	total_spend NUMERIC(12,2) DEFAULT 0.00,
	average_order_value NUMERIC(10,2) DEFAULT 0.00,
	last_order_date TIMESTAMP WITH TIME ZONE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers (city);

-- Addresses (multiple per customer)
CREATE TABLE IF NOT EXISTS addresses (
	address_id BIGSERIAL PRIMARY KEY,
	customer_id BIGINT REFERENCES customers(customer_id) ON DELETE CASCADE,
	label TEXT,
	address_line TEXT,
	area TEXT,
	city TEXT,
	state TEXT,
	postal_code TEXT,
	latitude NUMERIC(9,6),
	longitude NUMERIC(9,6),
	is_primary BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses (customer_id);

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
	restaurant_id BIGSERIAL PRIMARY KEY,
	restaurant_name TEXT NOT NULL,
	description TEXT,
	city TEXT,
	area TEXT,
	latitude NUMERIC(9,6),
	longitude NUMERIC(9,6),
	cuisine TEXT,
	rating NUMERIC(3,2) DEFAULT 0.00,
	number_of_reviews INTEGER DEFAULT 0,
	average_price NUMERIC(8,2) DEFAULT 0.00,
	delivery_time_minutes INTEGER,
	distance_km NUMERIC(6,2),
	commission_rate NUMERIC(5,4) DEFAULT 0.20,
	restaurant_status VARCHAR(32) DEFAULT 'open',
	opening_time TIME,
	closing_time TIME,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants (city);
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants (restaurant_name);

-- Restaurant categories and mapping
CREATE TABLE IF NOT EXISTS restaurant_categories (
	category_id SERIAL PRIMARY KEY,
	name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurant_category_map (
	restaurant_id BIGINT REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
	category_id INT REFERENCES restaurant_categories(category_id) ON DELETE CASCADE,
	PRIMARY KEY (restaurant_id, category_id)
);

-- Food categories
CREATE TABLE IF NOT EXISTS food_categories (
	food_category_id SERIAL PRIMARY KEY,
	name TEXT UNIQUE NOT NULL
);

-- Food items
CREATE TABLE IF NOT EXISTS food_items (
	food_id BIGSERIAL PRIMARY KEY,
	restaurant_id BIGINT REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
	food_name TEXT NOT NULL,
	food_category_id INT REFERENCES food_categories(food_category_id),
	cuisine TEXT,
	vegetarian BOOLEAN DEFAULT FALSE,
	price NUMERIC(10,2) NOT NULL,
	rating NUMERIC(3,2) DEFAULT 0.00,
	calories INTEGER,
	preparation_time_minutes INTEGER,
	available BOOLEAN DEFAULT TRUE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_restaurant ON food_items (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_name ON food_items USING gin (to_tsvector('english', food_name));

-- Food images
CREATE TABLE IF NOT EXISTS food_images (
	image_id BIGSERIAL PRIMARY KEY,
	food_id BIGINT REFERENCES food_items(food_id) ON DELETE CASCADE,
	image_url TEXT,
	alt_text TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Delivery partners
CREATE TABLE IF NOT EXISTS delivery_partners (
	partner_id BIGSERIAL PRIMARY KEY,
	name TEXT,
	phone TEXT,
	vehicle_type TEXT,
	rating NUMERIC(3,2) DEFAULT 0.00,
	active BOOLEAN DEFAULT TRUE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
	coupon_id BIGSERIAL PRIMARY KEY,
	code TEXT UNIQUE NOT NULL,
	discount_type VARCHAR(16) CHECK (discount_type IN ('percentage','fixed')),
	discount_value NUMERIC(8,2),
	min_order_value NUMERIC(10,2) DEFAULT 0.00,
	usage_limit INTEGER DEFAULT NULL,
	start_date DATE,
	end_date DATE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
	order_id BIGSERIAL PRIMARY KEY,
	customer_id BIGINT REFERENCES customers(customer_id) ON DELETE SET NULL,
	restaurant_id BIGINT REFERENCES restaurants(restaurant_id) ON DELETE SET NULL,
	order_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
	order_status VARCHAR(32) NOT NULL,
	subtotal NUMERIC(12,2) DEFAULT 0.00,
	discount_amount NUMERIC(12,2) DEFAULT 0.00,
	delivery_fee NUMERIC(8,2) DEFAULT 0.00,
	tax_amount NUMERIC(8,2) DEFAULT 0.00,
	total_amount NUMERIC(12,2) DEFAULT 0.00,
	payment_method VARCHAR(32),
	payment_id BIGINT,
	delivery_address_id BIGINT REFERENCES addresses(address_id) ON DELETE SET NULL,
	estimated_delivery_time TIMESTAMP WITH TIME ZONE,
	actual_delivery_time TIMESTAMP WITH TIME ZONE,
	cancellation_reason TEXT,
	coupon_id BIGINT REFERENCES coupons(coupon_id),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders (order_timestamp);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
	order_item_id BIGSERIAL PRIMARY KEY,
	order_id BIGINT REFERENCES orders(order_id) ON DELETE CASCADE,
	food_id BIGINT REFERENCES food_items(food_id) ON DELETE SET NULL,
	quantity INTEGER NOT NULL DEFAULT 1,
	unit_price NUMERIC(10,2) NOT NULL,
	discount NUMERIC(10,2) DEFAULT 0.00,
	total_price NUMERIC(12,2) NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orderitems_order ON order_items (order_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
	payment_id BIGSERIAL PRIMARY KEY,
	order_id BIGINT REFERENCES orders(order_id) ON DELETE CASCADE UNIQUE,
	method VARCHAR(32),
	status VARCHAR(32),
	amount NUMERIC(12,2),
	transaction_reference TEXT,
	payment_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reviews (restaurants / food)
CREATE TABLE IF NOT EXISTS reviews (
	review_id BIGSERIAL PRIMARY KEY,
	customer_id BIGINT REFERENCES customers(customer_id) ON DELETE SET NULL,
	restaurant_id BIGINT REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
	food_id BIGINT REFERENCES food_items(food_id) ON DELETE CASCADE,
	rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
	review_text TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews (restaurant_id);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
	favorite_id BIGSERIAL PRIMARY KEY,
	customer_id BIGINT REFERENCES customers(customer_id) ON DELETE CASCADE,
	restaurant_id BIGINT REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
	food_id BIGINT REFERENCES food_items(food_id) ON DELETE CASCADE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
	UNIQUE (customer_id, restaurant_id, food_id)
);

-- Image searches (AI image-based feature)
CREATE TABLE IF NOT EXISTS image_searches (
	image_search_id BIGSERIAL PRIMARY KEY,
	customer_id BIGINT REFERENCES customers(customer_id) ON DELETE SET NULL,
	image_path TEXT,
	predicted_food TEXT,
	confidence_score NUMERIC(4,3),
	search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
	selected_food_id BIGINT REFERENCES food_items(food_id),
	restaurant_id BIGINT REFERENCES restaurants(restaurant_id),
	converted_to_order BOOLEAN DEFAULT FALSE,
	order_id BIGINT REFERENCES orders(order_id),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_imagesearch_timestamp ON image_searches (search_timestamp);

-- Deliveries
CREATE TABLE IF NOT EXISTS deliveries (
	delivery_id BIGSERIAL PRIMARY KEY,
	order_id BIGINT REFERENCES orders(order_id) ON DELETE CASCADE UNIQUE,
	partner_id BIGINT REFERENCES delivery_partners(partner_id) ON DELETE SET NULL,
	assigned_at TIMESTAMP WITH TIME ZONE,
	pickup_time TIMESTAMP WITH TIME ZONE,
	delivered_time TIMESTAMP WITH TIME ZONE,
	delivery_distance_km NUMERIC(8,3),
	delivery_status VARCHAR(32),
	delivery_fee NUMERIC(8,2),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_partner ON deliveries (partner_id);

-- Customer sessions
CREATE TABLE IF NOT EXISTS customer_sessions (
	session_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	customer_id BIGINT REFERENCES customers(customer_id) ON DELETE SET NULL,
	session_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
	session_end TIMESTAMP WITH TIME ZONE,
	platform VARCHAR(64),
	device_info JSONB,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Useful views or materialized views can be added later for KPIs

-- Notes / comments for derived metrics (calculated in analytics layer):
-- delivery_delay = EXTRACT(EPOCH FROM (actual_delivery_time - estimated_delivery_time))/60  -- minutes
-- order_value = total_amount
-- profit_estimate = total_amount - (commission_rate * subtotal) - delivery_fee - cost_estimate (if available)

-- End of schema

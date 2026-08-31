#!/usr/bin/env python3
"""
Generate realistic raw data for the Food Delivery Analytics project.

Usage (small test):
  python generate_raw_data.py --customers 100 --restaurants 50 --food 200 --orders 1000

For full-scale generation, increase the counts (may take time and disk space).
"""
from __future__ import annotations

import argparse
import csv
import math
import os
import random
import string
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from faker import Faker

BASE = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(BASE, exist_ok=True)

fake = Faker()
Faker.seed(42)
random.seed(42)
np.random.seed(42)


def _out_path(name: str) -> str:
    return os.path.join(BASE, f"{name}.csv")


def generate_customers(n: int):
    rows = []
    for i in range(1, n + 1):
        first = fake.first_name()
        last = fake.last_name()
        email = fake.email() if random.random() > 0.02 else ""  # some missing
        phone = fake.phone_number()
        dob = fake.date_of_birth(minimum_age=18, maximum_age=75)
        signup = fake.date_time_between(start_date='-3y', end_date='now')
        city = fake.city()
        segment = random.choices(['low', 'mid', 'high'], weights=[0.6, 0.3, 0.1])[0]
        pref = random.choice(['North Indian','South Indian','Chinese','Italian','Fast Food','Beverages'])
        total_orders = max(0, int(np.random.poisson(2)))
        total_spend = round(total_orders * random.uniform(8,25), 2)
        last_order = (signup + timedelta(days=random.randint(1, 700))) if total_orders>0 else None

        rows.append({
            'customer_id': i,
            'first_name': first,
            'last_name': last,
            'email': email,
            'phone': phone,
            'gender': random.choice(['male','female','other']),
            'date_of_birth': dob.isoformat(),
            'city': city,
            'signup_date': signup.isoformat(),
            'customer_segment': segment,
            'preferred_cuisine': pref,
            'total_orders': total_orders,
            'total_spend': total_spend,
            'average_order_value': round((total_spend/total_orders) if total_orders else 0,2),
            'last_order_date': last_order.isoformat() if last_order else ''
        })

    df = pd.DataFrame(rows)
    df.to_csv(_out_path('customers'), index=False)
    print(f'wrote customers: {len(df)}')


def generate_restaurants(n: int):
    rows = []
    cuisines = ['North Indian','South Indian','Chinese','Italian','Fast Food','Biryani','Continental','Desserts']
    for i in range(1, n+1):
        name = fake.company() + ' ' + random.choice(['Kitchen','Zaika','Bhojan','Corner','Hub','House'])
        city = fake.city()
        area = fake.street_name()
        cuisine = random.choice(cuisines)
        rating = round(max(1.0, min(5.0, np.random.normal(4.0, 0.5))),2)
        reviews = int(abs(np.random.poisson(120)))
        avg_price = round(random.uniform(150,600),2)
        delivery_time = int(max(20, np.random.normal(35,10)))
        distance = round(random.uniform(0.5, 12.0),2)
        commission = round(random.choice([0.18,0.20,0.22,0.25]),2)
        status = random.choices(['open','closed','busy'], weights=[0.8, 0.1, 0.1])[0]

        rows.append({
            'restaurant_id': i,
            'restaurant_name': name,
            'description': fake.catch_phrase(),
            'city': city,
            'area': area,
            'cuisine': cuisine,
            'rating': rating,
            'number_of_reviews': reviews,
            'average_price': avg_price,
            'delivery_time_minutes': delivery_time,
            'distance_km': distance,
            'commission_rate': commission,
            'restaurant_status': status
        })

    df = pd.DataFrame(rows)
    df.to_csv(_out_path('restaurants'), index=False)
    print(f'wrote restaurants: {len(df)}')


def generate_food_items(num_food: int, restaurants_df: pd.DataFrame):
    rows = []
    food_names = [
        'Biryani','Masala Dosa','Idli','Vada','Paneer Butter Masala','Margherita Pizza','Cheeseburger',
        'Veg Momos','Hakka Noodles','Fried Rice','Thali','Pav Bhaji','Vada Pav','Chole Bhature','Aloo Paratha',
        'South Indian Meals','North Indian Meals','Butter Chicken','Tandoori Chicken','Samosa','Paneer Tikka',
        'Chocolate Brownie','Gulab Jamun','Fish Curry','Prawn Biryani','Kebabs'
    ]

    for i in range(1, num_food+1):
        rest = restaurants_df.sample(1).iloc[0]
        name = random.choice(food_names) + ' ' + random.choice(['Classic','Special','House','Deluxe',''])
        category = random.choice(['Main','Starter','Dessert','Beverage','Sides'])
        cuisine = rest['cuisine']
        veg = random.choice([True, False])
        price = round(max(30, np.random.normal(150 if veg else 220, 50)),2)
        rating = round(max(1.0, min(5.0, np.random.normal(4.0, 0.6))),2)
        calories = int(max(50, np.random.normal(400, 120)))
        prep = int(max(5, np.random.normal(20,8)))
        available = random.choices([True, False], weights=[0.95,0.05])[0]

        rows.append({
            'food_id': i,
            'restaurant_id': int(rest['restaurant_id']),
            'food_name': name.strip(),
            'category': category,
            'cuisine': cuisine,
            'vegetarian': veg,
            'price': price,
            'rating': rating,
            'calories': calories,
            'preparation_time': prep,
            'available': available
        })

    df = pd.DataFrame(rows)
    df.to_csv(_out_path('food_items'), index=False)
    print(f'wrote food_items: {len(df)}')


def _random_order_timestamp(start_days=365*2):
    # Simulate seasonal and weekly patterns
    base = datetime.now() - timedelta(days=random.randint(0, start_days))
    # apply time of day peaks: lunch 12-14, dinner 19-21
    hour = int(np.random.choice(
        [12,13,19,20,18,21,11,14], p=[0.12,0.12,0.15,0.15,0.12,0.12,0.1,0.12]))
    minute = random.randint(0,59)
    return base.replace(hour=hour, minute=minute, second=random.randint(0,59), microsecond=0)


def generate_orders(num_orders: int, customers_df: pd.DataFrame, restaurants_df: pd.DataFrame, food_df: pd.DataFrame):
    orders_rows = []
    order_items_rows = []
    payments_rows = []
    deliveries_rows = []
    order_id = 1

    food_by_rest = food_df.groupby('restaurant_id')

    for i in range(num_orders):
        cust = customers_df.sample(1).iloc[0]
        rest = restaurants_df.sample(1).iloc[0]
        ts = _random_order_timestamp()
        subtotal = 0.0
        items_count = max(1, int(np.random.poisson(2)))
        chosen_food = []
        # choose food from this restaurant when possible
        try:
            candidates = food_by_rest.get_group(int(rest['restaurant_id']))
        except KeyError:
            candidates = food_df.sample(5)

        for _ in range(items_count):
            fi = candidates.sample(1).iloc[0]
            qty = max(1, int(np.random.poisson(1.2)))
            unit = float(fi['price'])
            discount = 0.0 if random.random() > 0.1 else round(unit * random.uniform(0.05, 0.25),2)
            total_price = round(qty * unit - discount,2)
            subtotal += total_price
            order_items_rows.append({
                'order_id': order_id,
                'food_id': int(fi['food_id']),
                'quantity': qty,
                'unit_price': unit,
                'discount': discount,
                'total_price': total_price
            })

        discount_amount = 0.0 if random.random() > 0.05 else round(subtotal * random.uniform(0.05,0.2),2)
        delivery_fee = round(max(20, np.random.normal(40,10)),2)
        tax = round(subtotal * 0.05,2)
        total = round(subtotal - discount_amount + delivery_fee + tax,2)
        payment_method = random.choice(['card','upi','cash'])
        est_delivery = ts + timedelta(minutes=int(rest['delivery_time_minutes']))
        actual_delivery = est_delivery + timedelta(minutes=int(np.random.normal(0,10))) if random.random() > 0.05 else None
        status = random.choices(['delivered','cancelled','returned','pending'], weights=[0.88,0.05,0.01,0.06])[0]
        cancel_reason = ''
        if status == 'cancelled':
            cancel_reason = random.choice(['customer_request','restaurant_unavailable','payment_failed'])

        orders_rows.append({
            'order_id': order_id,
            'customer_id': int(cust['customer_id']),
            'restaurant_id': int(rest['restaurant_id']),
            'order_timestamp': ts.isoformat(),
            'order_status': status,
            'subtotal': round(subtotal,2),
            'discount_amount': discount_amount,
            'delivery_fee': delivery_fee,
            'tax_amount': tax,
            'total_amount': total,
            'payment_method': payment_method,
            'delivery_address': cust['city'],
            'estimated_delivery_time': est_delivery.isoformat(),
            'actual_delivery_time': actual_delivery.isoformat() if actual_delivery else '',
            'cancellation_reason': cancel_reason
        })

        payments_rows.append({
            'order_id': order_id,
            'method': payment_method,
            'status': 'success' if status != 'cancelled' else 'failed',
            'amount': total,
            'transaction_reference': ''.join(random.choices(string.ascii_uppercase+string.digits, k=10))
        })

        deliveries_rows.append({
            'order_id': order_id,
            'partner_id': random.randint(1,200),
            'assigned_at': (ts + timedelta(minutes=5)).isoformat(),
            'pickup_time': (ts + timedelta(minutes=15)).isoformat(),
            'delivered_time': (actual_delivery.isoformat() if actual_delivery else ''),
            'delivery_distance_km': float(rest['distance_km']),
            'delivery_status': 'delivered' if status=='delivered' else status
        })

        order_id += 1

    pd.DataFrame(orders_rows).to_csv(_out_path('orders'), index=False)
    pd.DataFrame(order_items_rows).to_csv(_out_path('order_items'), index=False)
    pd.DataFrame(payments_rows).to_csv(_out_path('payments'), index=False)
    pd.DataFrame(deliveries_rows).to_csv(_out_path('deliveries'), index=False)

    print(f'wrote orders: {len(orders_rows)}, order_items: {len(order_items_rows)}')


def generate_reviews(num_reviews: int, customers_df: pd.DataFrame, restaurants_df: pd.DataFrame, food_df: pd.DataFrame):
    rows = []
    for i in range(num_reviews):
        cust = customers_df.sample(1).iloc[0]
        rest = restaurants_df.sample(1).iloc[0]
        food = food_df.sample(1).iloc[0]
        rating = int(max(1, min(5, int(np.random.normal(4,1)))))
        text = fake.sentence(nb_words=12)
        # introduce some invalid ratings intentionally
        if random.random() < 0.002:
            rating = 9
        rows.append({
            'review_id': i+1,
            'customer_id': int(cust['customer_id']),
            'restaurant_id': int(rest['restaurant_id']),
            'food_id': int(food['food_id']),
            'rating': rating,
            'review_text': text,
            'created_at': fake.date_time_between(start_date='-2y', end_date='now').isoformat()
        })

    pd.DataFrame(rows).to_csv(_out_path('reviews'), index=False)
    print(f'wrote reviews: {len(rows)}')


def generate_image_searches(num: int, customers_df: pd.DataFrame, food_df: pd.DataFrame, restaurants_df: pd.DataFrame):
    rows = []
    for i in range(1, num+1):
        cust = customers_df.sample(1).iloc[0]
        food = food_df.sample(1).iloc[0]
        rest = restaurants_df.loc[restaurants_df['restaurant_id'] == food['restaurant_id']].iloc[0]
        confidence = round(random.uniform(0.3, 0.99), 2)
        converted = random.random() < 0.12
        order_id = random.randint(1, 1000) if converted else ''
        rows.append({
            'image_search_id': i,
            'customer_id': int(cust['customer_id']),
            'image_path': f'/images/{i}.jpg',
            'predicted_food': food['food_name'],
            'confidence_score': confidence,
            'search_timestamp': fake.date_time_between(start_date='-1y', end_date='now').isoformat(),
            'selected_food': food['food_name'] if random.random() < 0.4 else '',
            'restaurant_id': int(rest['restaurant_id']),
            'converted_to_order': converted,
            'order_id': order_id
        })

    pd.DataFrame(rows).to_csv(_out_path('image_searches'), index=False)
    print(f'wrote image_searches: {len(rows)}')


def main(args):
    # generate smaller sample by default so tests run quickly
    print('Generating raw data to', BASE)
    generate_customers(args.customers)
    generate_restaurants(args.restaurants)
    restaurants_df = pd.read_csv(_out_path('restaurants'))
    generate_food_items(args.food, restaurants_df)
    food_df = pd.read_csv(_out_path('food_items'))
    customers_df = pd.read_csv(_out_path('customers'))

    generate_orders(args.orders, customers_df, restaurants_df, food_df)
    generate_reviews(args.reviews, customers_df, restaurants_df, food_df)
    generate_image_searches(args.image_searches, customers_df, food_df, restaurants_df)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--customers', type=int, default=100, help='number of customers')
    parser.add_argument('--restaurants', type=int, default=50, help='number of restaurants')
    parser.add_argument('--food', type=int, default=200, help='number of food items')
    parser.add_argument('--orders', type=int, default=1000, help='number of orders')
    parser.add_argument('--reviews', type=int, default=500, help='number of reviews')
    parser.add_argument('--image_searches', type=int, default=200, help='number of image searches')
    args = parser.parse_args()
    main(args)

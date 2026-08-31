"""Download sample real-world images into webapp/public/images.

Usage:
  python webapp/scripts/download_images.py

This script fetches a small set of images from Unsplash via the Source API
and saves them to `webapp/public/images/` so the frontend can use local files
and display real photos even if remote image hotlinking is blocked.

If your network blocks Unsplash, you can replace the URLs with other image
URLs or manually copy images into `webapp/public/images/`.
"""
import os
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print('requests not installed. Run: pip install requests')
    sys.exit(1)

OUT_DIR = Path(__file__).resolve().parents[1] / 'public' / 'images'
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Map filename -> Unsplash query (Source API will return a photo)
IMAGES = {
    'pizza.jpg': 'pizza',
    'wings.jpg': 'chicken wings',
    'burger.jpg': 'burger',
    'sushi.jpg': 'sushi',
    'salad.jpg': 'salad',
}

TIMEOUT = 20

for fname, query in IMAGES.items():
    url = f'https://source.unsplash.com/1200x800/?{query}'
    dest = OUT_DIR / fname
    print(f'Downloading {query} -> {dest} ...')
    try:
        r = requests.get(url, timeout=TIMEOUT)
        r.raise_for_status()
        with open(dest, 'wb') as f:
            f.write(r.content)
    except Exception as e:
        print('Failed to download', url, e)

print('Done. Check files in', OUT_DIR)
print('Now run: cd webapp && npm run dev')

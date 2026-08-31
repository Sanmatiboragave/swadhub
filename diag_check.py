import requests
urls=[
 'http://127.0.0.1:8001/index.html',
 'http://127.0.0.1:8000/index.html',
 'http://127.0.0.1:8001/dashboard/',
 'http://127.0.0.1:8001/aggregates/daily',
 'http://127.0.0.1:8001/order/menu'
]
for u in urls:
    try:
        r=requests.get(u, timeout=3)
        print(u, r.status_code)
        txt = r.text
        print(txt[:200].replace('\n',' '))
    except Exception as e:
        print(u, 'ERROR', e)

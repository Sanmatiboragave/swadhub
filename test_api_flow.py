import requests
API='http://127.0.0.1:8001'
print('registering')
try:
    r = requests.post(API+'/auth/register', params={'username':'testa','password':'pass','email':'test@example.com'})
    print('reg', r.status_code, r.text)
except Exception as e:
    print('reg err', e)
print('login')
r = requests.post(API+'/auth/login', params={'username':'testa','password':'pass'})
print('login', r.status_code, r.text)
if not r.ok:
    raise SystemExit('login failed')
token = r.json().get('token')
print('token', token)

payload = {
    'customer_name':'Tester',
    'customer_email':'test@example.com',
    'customer_phone':'123',
    'delivery_address':'123 Test St',
    'payment_method':'card',
    'items':[{'id':'m1','name':'Margherita Pizza','qty':1,'price':9.5}]
}
print('checkout')
rc = requests.post(API+'/order/checkout', json=payload, params={'token':token})
print('checkout', rc.status_code, rc.text)
if not rc.ok:
    raise SystemExit('checkout failed')
order = rc.json()
print('order', order)

print('process payment')
p = requests.post(API+f"/payment/process?order_id={order['order_id']}&amount={order['total']}&method=card")
print('payment', p.status_code, p.text)

print('user orders')
q = requests.get(API+'/user/orders', params={'token':token})
print('orders', q.status_code, q.text)

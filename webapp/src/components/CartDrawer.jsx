import React, { useContext, useState } from 'react'
import { CartContext } from '../context/CartContext'

export default function CartDrawer({apiBase, token}){
  const {cart, remove, clear} = useContext(CartContext)
  const [open, setOpen] = useState(false)
  const items = Object.values(cart)
  const subtotal = items.reduce((s,i)=>s + i.price * i.qty, 0)
  const checkout = async ()=>{
    if(items.length===0) return alert('Cart empty')
    const payload = {
      customer_name: 'Guest',
      customer_email: null,
      customer_phone: null,
      delivery_address: null,
      payment_method: 'card',
      items: items.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price}))
    }
    try{
      const res = await fetch(apiBase + `/order/checkout${token?('?token='+token):''}`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if(!res.ok) throw new Error('checkout failed')
      const j = await res.json()
      // process payment
      const p = await fetch(apiBase + `/payment/process?order_id=${j.order_id}&amount=${j.total}&method=card`, { method: 'POST' })
      const pj = await p.json()
      if(pj.status==='success'){
        alert('Order placed: '+j.order_id)
        clear()
        setOpen(false)
      }else{
        alert('Payment failed')
      }
    }catch(e){ alert('Checkout error: '+e) }
  }
  return (
    <>
      <button onClick={()=>setOpen(true)} className="fixed right-6 bottom-6 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2">Cart ({items.length})</button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex justify-end">
          <div className="w-full sm:w-96 bg-white p-4">
            <h3 className="font-semibold mb-2">Your Cart</h3>
            <div className="space-y-2">
              {items.map(it=> (
                <div key={it.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-500">{it.qty} × ${it.price}</div>
                  </div>
                  <div>
                    <button className="text-sm text-red-500" onClick={()=>remove(it.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">Subtotal: ${subtotal.toFixed(2)}</div>
            <div className="mt-4 flex gap-2">
              <button onClick={()=>setOpen(false)} className="px-3 py-2 bg-gray-200 rounded">Close</button>
              <button onClick={checkout} className="px-3 py-2 bg-indigo-600 text-white rounded">Checkout</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCreditCard, FiSmartphone } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { deliveryFee, gst, inr } from '../utils/money'

export default function Checkout() {
  const { items, subtotal, address, setAddress, placeOrder, setQty, remove } = useCart()
  const navigate = useNavigate()
  const [name, setName] = useState('Asha Rao')
  const [phone, setPhone] = useState('+91 98765 43210')
  const [payment, setPayment] = useState('upi')
  const [placing, setPlacing] = useState(false)

  const delivery = deliveryFee(subtotal)
  const tax = gst(subtotal)
  const total = subtotal + delivery + tax

  const submit = (e) => {
    e.preventDefault()
    if (!items.length) return
    setPlacing(true)
    const order = placeOrder({ name, phone, address, payment })
    setTimeout(() => {
      navigate(`/track/${order.id}`)
    }, 600)
  }

  if (!items.length) {
    return (
      <div className="min-h-screen">
        <Navbar showSearch={false} />
        <div className="section-pad py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Bag is empty</h1>
          <p className="mt-2 text-ink-700/70">Add dishes from a kitchen to checkout.</p>
          <Link to="/" className="btn-primary mt-6 inline-flex">Browse kitchens</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar showSearch={false} />
      <div className="section-pad py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zest-600">
          <FiArrowLeft /> Continue browsing
        </Link>
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Checkout</h1>

        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <section className="rounded-3xl bg-white p-5 shadow-lift ring-1 ring-zest-100 sm:p-6">
              <h2 className="font-display text-xl font-bold">Delivery details</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">Full name</span>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-zest-200 px-3 py-3 outline-none focus:border-zest-500" />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Phone</span>
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-zest-200 px-3 py-3 outline-none focus:border-zest-500" />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block font-medium">Address</span>
                  <textarea required value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full rounded-xl border border-zest-200 px-3 py-3 outline-none focus:border-zest-500" />
                </label>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-lift ring-1 ring-zest-100 sm:p-6">
              <h2 className="font-display text-xl font-bold">Payment</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPayment('card')}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${payment === 'card' ? 'border-zest-500 bg-zest-50' : 'border-zest-100'}`}
                >
                  <FiCreditCard className="text-zest-600" size={22} />
                  <div>
                    <div className="font-semibold">Card</div>
                    <div className="text-xs text-ink-700/60">Visa · Mastercard</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPayment('upi')}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${payment === 'upi' ? 'border-zest-500 bg-zest-50' : 'border-zest-100'}`}
                >
                  <FiSmartphone className="text-zest-600" size={22} />
                  <div>
                    <div className="font-semibold">UPI / Wallet</div>
                    <div className="text-xs text-ink-700/60">Instant pay</div>
                  </div>
                </button>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl bg-ink-900 p-5 text-white shadow-plate sm:p-6">
            <h2 className="font-display text-xl font-bold">Order summary</h2>
            <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((it) => (
                <li key={it.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium">{it.name} × {it.qty}</div>
                    <div className="text-white/50">{it.restaurantName}</div>
                    <div className="mt-1 flex gap-2 text-xs">
                      <button type="button" className="text-citrus-400" onClick={() => setQty(it.id, it.qty - 1)}>-1</button>
                      <button type="button" className="text-citrus-400" onClick={() => setQty(it.id, it.qty + 1)}>+1</button>
                      <button type="button" className="text-flame" onClick={() => remove(it.id)}>Remove</button>
                    </div>
                  </div>
                  <span>{inr(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-white/15 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-white/60">Subtotal</span><span>{inr(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-white/60">Delivery</span><span>{delivery === 0 ? 'Free' : inr(delivery)}</span></div>
              <div className="flex justify-between"><span className="text-white/60">GST (5%)</span><span>{inr(tax)}</span></div>
              <div className="flex justify-between pt-2 text-lg font-bold"><span>Total</span><span>{inr(total)}</span></div>
            </div>
            <button type="submit" disabled={placing} className="mt-6 w-full rounded-xl bg-citrus-500 py-3.5 font-bold text-ink-900 transition hover:brightness-105 disabled:opacity-60">
              {placing ? 'Placing order…' : `Pay ${inr(total)}`}
            </button>
          </aside>
        </form>
      </div>
    </div>
  )
}
